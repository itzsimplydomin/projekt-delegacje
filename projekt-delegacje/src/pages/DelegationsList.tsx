import '/src/styles/App.css';
import '/src/styles/Dashboard.css';
import '/src/styles/DelegationsList.css';
import {
    useDelegacje,
    useDeleteDelegacja,
    useUpdateDelegacja,
    useGeneratePdf,
    useGenerateMonthlyPdf,
} from '../api/hooks';
import { useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import logo from '/src/img/logoArtikon.png';
import type { Delegacja, DelegacjaCreate } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import Loader from './Loader';

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDateRange = (start?: string, end?: string) => {
    if (!start || !end) return 'Brak daty';

    const startParts = start.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    const endParts = end.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (!startParts || !endParts) return 'Brak daty';

    const fmt = (y: string, m: string, d: string) =>
        new Date(parseInt(y), parseInt(m) - 1, parseInt(d)).toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });

    return `${fmt(startParts[1], startParts[2], startParts[3])} ${startParts[4]}:${startParts[5]} - ${fmt(endParts[1], endParts[2], endParts[3])} ${endParts[4]}:${endParts[5]}`;
};

/**
 * Parsuje ISO string bezpośrednio, ignorując strefę czasową przeglądarki.
 * Backend zapisuje daty bez 'Z' (czas lokalny PL), więc new Date() błędnie
 * konwertuje je przez offset UTC przeglądarki.
 */
const parseIso = (iso: string): { year: number; month: number; day: number; minutesOfDay: number } | null => {
    const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (!m) return null;
    return {
        year: parseInt(m[1]),
        month: parseInt(m[2]),
        day: parseInt(m[3]),
        minutesOfDay: parseInt(m[4]) * 60 + parseInt(m[5]),
    };
};

const calculateDiet = (startIso?: string, endIso?: string): number => {
    if (!startIso || !endIso) return 0;

    const start = parseIso(startIso);
    const end = parseIso(endIso);
    if (!start || !end) return 0;

    const toNum = (p: typeof start) => p.year * 10000 + p.month * 100 + p.day;
    const startNum = toNum(start);
    const endNum = toNum(end);

    if (endNum < startNum || (endNum === startNum && end.minutesOfDay <= start.minutesOfDay)) return 0;

    let total = 0;
    let curYear = start.year, curMonth = start.month, curDay = start.day;

    while (true) {
        const curNum = curYear * 10000 + curMonth * 100 + curDay;
        const isFirstDay = curNum === startNum;
        const isLastDay = curNum === endNum;

        const dayStartMin = isFirstDay ? start.minutesOfDay : 0;
        const dayEndMin = isLastDay ? end.minutesOfDay : 24 * 60;

        const hours = (dayEndMin - dayStartMin) / 60;
        if (hours >= 12) total += 45;
        else if (hours >= 8) total += 22.5;

        if (isLastDay) break;

        // Przejdź do następnego dnia (obsługa końca miesiąca/roku)
        const next = new Date(curYear, curMonth - 1, curDay + 1);
        curYear = next.getFullYear();
        curMonth = next.getMonth() + 1;
        curDay = next.getDate();
    }

    return total;
};

const overlapsMonth = (startIso?: string, endIso?: string, yyyyMm?: string): boolean => {
    if (!startIso || !endIso || !yyyyMm) return true;
    const [y, m] = yyyyMm.split('-').map(Number);
    if (!y || !m) return true;
    const monthStart = new Date(y, m - 1, 1);
    const monthEnd = new Date(y, m, 0, 23, 59, 59, 999);
    return new Date(startIso) <= monthEnd && new Date(endIso) >= monthStart;
};

// ── Komponent ─────────────────────────────────────────────────────────────────

export const DelegationsList = () => {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();

    const { data: delegacje = [], isLoading, isError } = useDelegacje();
    const deleteMutation = useDeleteDelegacja();
    const updateMutation = useUpdateDelegacja();
    const generatePdfMutation = useGeneratePdf();
    const generateMonthlyPdfMutation = useGenerateMonthlyPdf();

    const [menuOpen, setMenuOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<DelegacjaCreate>>({});
    const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [employeeFilter, setEmployeeFilter] = useState('');
    const [monthFilter, setMonthFilter] = useState('');

    const filteredDelegacje = useMemo(() =>
        delegacje.filter((d) => {
            const matchesMonth = overlapsMonth(d.dataRozpoczecia, d.dataZakonczenia, monthFilter);
            if (!isAdmin) return matchesMonth;
            if (employeeFilter) {
                const term = employeeFilter.toLowerCase();
                return matchesMonth && `${d.pracownikImie} ${d.pracownikNazwisko}`.toLowerCase().includes(term);
            }
            return matchesMonth;
        }),
        [delegacje, monthFilter, employeeFilter, isAdmin],
    );

    const totalDiet = useMemo(
        () => filteredDelegacje.reduce((sum, d) => sum + calculateDiet(d.dataRozpoczecia, d.dataZakonczenia), 0),
        [filteredDelegacje],
    );

    // ── Akcje ──────────────────────────────────────────────────────────────────

    const showMsg = (type: 'success' | 'error', text: string, autohide = true) => {
        setActionMessage({ type, text });
        if (autohide) setTimeout(() => setActionMessage(null), 3000);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Czy na pewno chcesz usunąć tę delegację?')) return;
        try {
            await deleteMutation.mutateAsync(id);
            showMsg('success', 'Delegacja została usunięta');
        } catch {
            showMsg('error', 'Nie udało się usunąć delegacji');
        }
    };

    const handleGeneratePdf = async (id: string) => {
        try {
            const pdfBlob = await generatePdfMutation.mutateAsync(id);
            const url = window.URL.createObjectURL(new Blob([pdfBlob], { type: 'application/pdf' }));
            const a = document.createElement('a');
            a.href = url;
            a.download = `delegacja-${id}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            showMsg('success', 'PDF wygenerowany i pobrany');
        } catch {
            showMsg('error', 'Nie udało się wygenerować PDF');
        }
    };

    const handleGenerateMonthlyPdf = async () => {
        if (!monthFilter) {
            showMsg('error', 'Najpierw wybierz miesiąc w filtrze powyżej', false);
            return;
        }
        const [year, month] = monthFilter.split('-').map(Number);
        let resolvedEmail: string | undefined;

        if (isAdmin && employeeFilter) {
            resolvedEmail = filteredDelegacje[0]?.userEmail;
            if (!resolvedEmail) {
                showMsg('error', 'Nie znaleziono pracownika pasującego do filtra', false);
                return;
            }
        }

        try {
            const blob = await generateMonthlyPdfMutation.mutateAsync({ year, month, userEmail: resolvedEmail });
            const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
            const a = document.createElement('a');
            a.href = url;
            a.download = `delegacje-${monthFilter}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            showMsg('success', 'Raport PDF pobrany');
        } catch {
            showMsg('error', 'Nie udało się wygenerować raportu. Sprawdź czy istnieją delegacje w wybranym miesiącu.');
        }
    };

    const handleEdit = (d: Delegacja) => {
        setEditingId(d.id);
        setEditForm({ miejsce: d.miejsce, dataRozpoczecia: d.dataRozpoczecia, dataZakonczenia: d.dataZakonczenia, uwagi: d.uwagi ?? '' });
        setActionMessage(null);
    };

    const handleCancelEdit = () => { setEditingId(null); setEditForm({}); };

    const handleSaveEdit = async (id: string) => {
        try {
            const payload: Partial<DelegacjaCreate> = {};
            if (editForm.miejsce !== undefined) payload.miejsce = editForm.miejsce;
            if (editForm.dataRozpoczecia) {
                const d = new Date(editForm.dataRozpoczecia);
                payload.dataRozpoczecia = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
            }
            if (editForm.dataZakonczenia) {
                const d = new Date(editForm.dataZakonczenia);
                payload.dataZakonczenia = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
            }
            if (editForm.uwagi !== undefined) payload.uwagi = editForm.uwagi;

            await updateMutation.mutateAsync({ id, payload });
            setEditingId(null);
            setEditForm({});
            showMsg('success', 'Delegacja została zaktualizowana');
        } catch {
            showMsg('error', 'Nie udało się zaktualizować delegacji');
        }
    };

    // ── Loading / Error ────────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <div className="dashboard-wrapper">
                <header className="dark-header">
                    <div className="nav-center">
                        <div className="logo"><img src={logo} alt="Logo Artikon" loading="lazy" /></div>
                    </div>
                </header>
                <Loader fullScreen message="Pobieranie listy delegacji..." />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="dashboard-wrapper">
                <header className="dark-header">
                    <div className="nav-center">
                        <div className="logo"><img src={logo} alt="Logo Artikon" loading="lazy" /></div>
                    </div>
                </header>
                <div className="dashboard-main">
                    <p className="delegations-status delegations-status-error">
                        Nie udało się pobrać delegacji. Spróbuj ponownie później.
                    </p>
                </div>
            </div>
        );
    }

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="dashboard-wrapper delegations-page">
            <header className="dark-header">
                <div className="nav-center">
                    <div className="logo">
                        <img src={logo} alt="Logo Artikon" loading="lazy" />
                    </div>
                    <button className="menu-toggle" aria-label="Przełącz menu" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
                    <nav id="main-nav" className={`main-nav ${menuOpen ? 'open' : ''}`} role="navigation" aria-label="Menu główne">
                        <button className="nav-link" onClick={() => { setMenuOpen(false); navigate('/delegacje'); }}>Kalendarz</button>
                        <button className="nav-link" onClick={() => { setMenuOpen(false); navigate('/delegacje/lista'); }}>Delegacje</button>
                        <button className="nav-link" onClick={() => { setMenuOpen(false); navigate('/delegacje/ustawienia'); }}>Ustawienia</button>
                    </nav>
                </div>
            </header>

            <main className="dashboard-main">
                <section className="hero-card">
                    <div>
                        <h1>Lista delegacji</h1>
                        <p className="subtitle">Przeglądaj, edytuj i zarządzaj delegacjami zapisanymi w systemie.</p>
                    </div>

                    <div className="hero-metrics-group">
                        <div className="hero-meta">
                            <p className="metric-label">Wszystkich delegacji</p>
                            <p className="metric-value">{filteredDelegacje.length}</p>
                        </div>
                        <div className="hero-meta hero-meta-diet">
                            <p className="metric-label">Suma diet</p>
                            <p className="metric-value">{totalDiet.toFixed(2)} <span className="metric-currency">zł</span></p>
                            <p className="metric-sublabel">45 zł/doba, 12h</p>
                        </div>
                    </div>

                    <div className="hero-filters-group">
                        <div className="month-filter">
                            <input
                                className="month-filter-input"
                                type="month"
                                value={monthFilter}
                                onChange={(e) => setMonthFilter(e.target.value)}
                            />
                            {monthFilter && (
                                <button type="button" className="month-filter-clear" onClick={() => setMonthFilter('')}>Wyczyść</button>
                            )}
                        </div>

                        {isAdmin && (
                            <div className="employee-filter">
                                <input
                                    className="employee-filter-input"
                                    type="text"
                                    placeholder="Wpisz imię lub nazwisko..."
                                    value={employeeFilter}
                                    onChange={(e) => setEmployeeFilter(e.target.value)}
                                />
                                {employeeFilter && (
                                    <button type="button" className="employee-filter-clear" onClick={() => setEmployeeFilter('')}>Wyczyść</button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="monthly-pdf-btn-wrap">
                        <button
                            type="button"
                            className="monthly-pdf-btn"
                            onClick={handleGenerateMonthlyPdf}
                            disabled={generateMonthlyPdfMutation.isPending || !monthFilter}
                            title={!monthFilter ? 'Wybierz miesiąc, aby pobrać raport' : 'Pobierz raport PDF za wybrany miesiąc'}
                        >
                            {generateMonthlyPdfMutation.isPending ? (
                                <>⏳ Generuję...</>
                            ) : (
                                <>
                                    📊 PDF miesiąca
                                    {monthFilter && (
                                        <span className="monthly-pdf-badge">
                                            {new Date(monthFilter + '-01').toLocaleDateString('pl-PL', { month: 'short', year: 'numeric' })}
                                        </span>
                                    )}
                                    {isAdmin && employeeFilter && (
                                        <span className="monthly-pdf-badge monthly-pdf-badge--person">👤 {employeeFilter}</span>
                                    )}
                                </>
                            )}
                        </button>
                        {!monthFilter && <p className="monthly-pdf-hint">Wybierz miesiąc w filtrze, aby odblokować</p>}
                    </div>
                </section>

                {actionMessage && (
                    <div className={`action-message ${actionMessage.type}`} role="alert">
                        <span className="action-message-icon">{actionMessage.type === 'success' ? '✓' : '⚠'}</span>
                        <span className="action-message-text">{actionMessage.text}</span>
                    </div>
                )}

                {delegacje.length === 0 ? (
                    <div className="empty-state">
                        <p>Brak zapisanych delegacji.</p>
                        <button className="primary" onClick={() => navigate('/delegacje')}>Dodaj pierwszą delegację</button>
                    </div>
                ) : (
                    <div className="delegations-grid" role="list">
                        {filteredDelegacje.map((delegacja) => (
                            <article className="delegations-card" key={delegacja.id} role="listitem">
                                {editingId === delegacja.id ? (
                                    <div className="edit-mode">
                                        <div className="form-grid">
                                            <label>
                                                Miejsce
                                                <input type="text" value={editForm.miejsce ?? ''} onChange={(e) => setEditForm({ ...editForm, miejsce: e.target.value })} />
                                            </label>
                                            <label>
                                                Data rozpoczęcia
                                                <input
                                                    type="datetime-local"
                                                    value={editForm.dataRozpoczecia ? new Date(editForm.dataRozpoczecia).toISOString().slice(0, 16) : ''}
                                                    onChange={(e) => setEditForm({ ...editForm, dataRozpoczecia: new Date(e.target.value).toISOString() })}
                                                />
                                            </label>
                                            <label>
                                                Data zakończenia
                                                <input
                                                    type="datetime-local"
                                                    value={editForm.dataZakonczenia ? new Date(editForm.dataZakonczenia).toISOString().slice(0, 16) : ''}
                                                    onChange={(e) => setEditForm({ ...editForm, dataZakonczenia: new Date(e.target.value).toISOString() })}
                                                />
                                            </label>
                                            <label className="full-width">
                                                Uwagi
                                                <textarea value={editForm.uwagi ?? ''} onChange={(e) => setEditForm({ ...editForm, uwagi: e.target.value })} rows={3} />
                                            </label>
                                        </div>
                                        <div className="card-actions">
                                            <button className="primary" onClick={() => handleSaveEdit(delegacja.id)}>Zapisz</button>
                                            <button className="secondary" onClick={handleCancelEdit}>Anuluj</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <header className="card-header">
                                            <div>
                                                <p className="card-title">{delegacja.miejsce}</p>
                                                <p className="card-meta">{delegacja.pracownikImie} {delegacja.pracownikNazwisko}</p>
                                            </div>
                                        </header>
                                        <div className="card-body">
                                            <div className="card-row">
                                                <span className="card-label">Termin</span>
                                                <p>{formatDateRange(delegacja.dataRozpoczecia, delegacja.dataZakonczenia)}</p>
                                            </div>
                                            {delegacja.uwagi && (
                                                <div className="card-row">
                                                    <span className="card-label">Uwagi</span>
                                                    <p>{delegacja.uwagi}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="card-actions">
                                            <button className="action-btn edit-btn" onClick={() => handleEdit(delegacja)} aria-label={`Edytuj delegację: ${delegacja.miejsce}`}>✏️ Edytuj</button>
                                            <button className="action-btn pdf-btn" onClick={() => handleGeneratePdf(delegacja.id)} aria-label={`Generuj PDF dla delegacji: ${delegacja.miejsce}`}>📄 PDF</button>
                                            <button className="action-btn delete-btn" onClick={() => handleDelete(delegacja.id)} aria-label={`Usuń delegację: ${delegacja.miejsce}`}>🗑️ Usuń</button>
                                        </div>
                                    </>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default DelegationsList;