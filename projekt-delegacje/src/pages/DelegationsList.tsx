import '/src/styles/App.css';
import '/src/styles/DelegationsList.css';
import '/src/styles/Dashboard.css';
import { useDelegacje, useDeleteDelegacja, useUpdateDelegacja, useGeneratePdf } from '../api/hooks';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import logo from '/src/img/logoArtikon.png';
import type { Delegacja, DelegacjaCreate } from '../api/types';

const formatDateRange = (start?: string, end?: string) => {
    if (!start || !end) {
        return 'Brak daty';
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        return 'Brak daty';
    }

    const formattedStart = startDate.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
    const formattedEnd = endDate.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    return `${formattedStart} - ${formattedEnd}`;
};

export const DelegationsList = () => {
    const navigate = useNavigate();
    const { data: delegacje = [], isLoading, isError } = useDelegacje();
    const deleteMutation = useDeleteDelegacja();
    const updateMutation = useUpdateDelegacja();
    const generatePdfMutation = useGeneratePdf();

    const [menuOpen, setMenuOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<DelegacjaCreate>>({});
    const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [monthFilter, setMonthFilter] = useState<string>(''); // format: "YYYY-MM" lub '' = wszystkie
    const overlapsMonth = (startIso?: string, endIso?: string, yyyyMm?: string) => {
        if (!startIso || !endIso || !yyyyMm) return true;

        const [y, m] = yyyyMm.split('-').map(Number);
        if (!y || !m) return true;

        // zakres wybranego miesiąca (lokalnie)
        const monthStart = new Date(y, m - 1, 1, 0, 0, 0, 0);
        const monthEnd = new Date(y, m, 0, 23, 59, 59, 999); // ostatni dzień miesiąca

        const start = new Date(startIso);
        const end = new Date(endIso);

        // delegacja pasuje jeśli przecina się z zakresem miesiąca
        return start <= monthEnd && end >= monthStart;
    };

    const filteredDelegacje = delegacje.filter((d) =>
        overlapsMonth(d.dataRozpoczecia, d.dataZakonczenia, monthFilter),
    );

    const handleDelete = async (id: string) => {
        if (!window.confirm('Czy na pewno chcesz usunąć tę delegację?')) return;

        setActionMessage(null);
        try {
            await deleteMutation.mutateAsync(id);
            setActionMessage({ type: 'success', text: 'Delegacja została usunięta' });
            setTimeout(() => setActionMessage(null), 3000);
        } catch (error) {
            setActionMessage({ type: 'error', text: 'Nie udało się usunąć delegacji' });
        }
    };

    const handleEdit = (delegacja: Delegacja) => {
        setEditingId(delegacja.id);
        setEditForm({
            miejsce: delegacja.miejsce,
            dataRozpoczecia: delegacja.dataRozpoczecia,
            dataZakonczenia: delegacja.dataZakonczenia,
            uwagi: delegacja.uwagi || '',
        });
        setActionMessage(null);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleSaveEdit = async (id: string) => {
        setActionMessage(null);
        try {
            await updateMutation.mutateAsync({ id, payload: editForm });
            setEditingId(null);
            setEditForm({});
            setActionMessage({ type: 'success', text: 'Delegacja została zaktualizowana' });
            setTimeout(() => setActionMessage(null), 3000);
        } catch (error) {
            setActionMessage({ type: 'error', text: 'Nie udało się zaktualizować delegacji' });
        }
    };

    const handleGeneratePdf = async (id: string) => {
        setActionMessage(null);
        try {
            const result = await generatePdfMutation.mutateAsync(id);
            window.open(result.pdfUrl, '_blank');
            setActionMessage({ type: 'success', text: 'PDF wygenerowany pomyślnie' });
            setTimeout(() => setActionMessage(null), 3000);
        } catch (error) {
            setActionMessage({ type: 'error', text: 'Nie udało się wygenerować PDF' });
        }
    };

    if (isLoading) {
        return (
            <div className="dashboard-wrapper">
                <header className="dark-header">
                    <div className="nav-center">
                        <div className="logo">
                            <img src={logo} alt="Logo Artikon" loading="lazy" />
                        </div>
                    </div>
                </header>
                <div className="dashboard-main">
                    <p className="delegations-status">Ładowanie delegacji...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="dashboard-wrapper">
                <header className="dark-header">
                    <div className="nav-center">
                        <div className="logo">
                            <img src={logo} alt="Logo Artikon" loading="lazy" />
                        </div>
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

    return (
        <div className="dashboard-wrapper">
            <header className="dark-header">
                <div className="nav-center">
                    <div className="logo">
                        <img src={logo} alt="Logo Artikon" loading="lazy" />
                    </div>

                    <button
                        className="menu-toggle"
                        aria-label="Przełącz menu"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        ☰
                    </button>

                    <nav
                        className={`main-nav ${menuOpen ? 'open' : ''}`}
                        role="navigation"
                        aria-label="Menu główne"
                    >
                        <button onClick={() => navigate('/delegacje')} style={{ background: 'none', border: 'none', color: 'var(--white)', textDecoration: 'none', fontWeight: 700, textTransform: 'uppercase', fontSize: 'clamp(0.8rem, 2vw, 0.9em)', cursor: 'pointer', transition: 'color 0.3s ease' }}>Kalendarz</button>
                        <button onClick={() => navigate('/delegacje/lista')} style={{ background: 'none', border: 'none', color: 'var(--white)', textDecoration: 'none', fontWeight: 700, textTransform: 'uppercase', fontSize: 'clamp(0.8rem, 2vw, 0.9em)', cursor: 'pointer', transition: 'color 0.3s ease' }}>Delegacje</button>
                    </nav>
                </div>
            </header>

            <main className="dashboard-main">
                <section className="hero-card">
                    <div>
                        <h1>Lista delegacji</h1>
                        <p className="subtitle">
                            Przeglądaj, edytuj i zarządzaj delegacjami zapisanymi w systemie.
                        </p>
                    </div>
                    <div className="hero-meta">
                        <p className="metric-label">Wszystkich delegacji</p>
                        <p className="metric-value">{filteredDelegacje.length}</p>
                    </div>
                    <div className="month-filter">
                        <label className="month-filter-label" htmlFor="monthFilter">
                            Miesiąc
                        </label>
                        <input
                            id="monthFilter"
                            className="month-filter-input"
                            type="month"
                            value={monthFilter}
                            onChange={(e) => setMonthFilter(e.target.value)}
                        />
                        {monthFilter && (
                            <button
                                type="button"
                                className="month-filter-clear"
                                onClick={() => setMonthFilter('')}
                                title="Wyczyść filtr"
                            >
                                Wyczyść
                            </button>
                        )}
                    </div>
                    
                </section>

                {actionMessage && (
                    <div className={`action-message ${actionMessage.type}`}>
                        {actionMessage.text}
                    </div>
                )}

                {delegacje.length === 0 ? (
                    <div className="empty-state">
                        <p>Brak zapisanych delegacji.</p>
                        <button className="primary" onClick={() => navigate('/delegacje')}>
                            Dodaj pierwszą delegację
                        </button>
                    </div>
                ) : (
                    <div className="delegations-grid" role="list">
                        {filteredDelegacje.map((delegacja) => (
                            <article
                                className="delegations-card"
                                key={delegacja.id}
                                role="listitem"
                            >
                                {editingId === delegacja.id ? (
                                    // Tryb edycji
                                    <div className="edit-mode">
                                        <div className="form-grid">
                                            <label>
                                                Miejsce
                                                <input
                                                    type="text"
                                                    value={editForm.miejsce || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, miejsce: e.target.value })}
                                                />
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
                                                <textarea
                                                    value={editForm.uwagi || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, uwagi: e.target.value })}
                                                    rows={3}
                                                />
                                            </label>
                                        </div>
                                        <div className="card-actions">
                                            <button className="primary" onClick={() => handleSaveEdit(delegacja.id)}>
                                                Zapisz
                                            </button>
                                            <button className="secondary" onClick={handleCancelEdit}>
                                                Anuluj
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // Tryb wyświetlania
                                    <>
                                        <header className="card-header">
                                            <div>
                                                <p className="card-title">{delegacja.miejsce}</p>
                                                <p className="card-meta">
                                                    {delegacja.userEmail}
                                                </p>
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
                                            <button
                                                className="action-btn edit-btn"
                                                onClick={() => handleEdit(delegacja)}
                                                title="Edytuj delegację"
                                            >
                                                ✏️ Edytuj
                                            </button>
                                            <button
                                                className="action-btn pdf-btn"
                                                onClick={() => handleGeneratePdf(delegacja.id)}
                                                title="Generuj PDF"
                                            >
                                                📄 PDF
                                            </button>
                                            <button
                                                className="action-btn delete-btn"
                                                onClick={() => handleDelete(delegacja.id)}
                                                title="Usuń delegację"
                                            >
                                                🗑️ Usuń
                                            </button>
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