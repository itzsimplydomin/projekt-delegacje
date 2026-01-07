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

    // Parsuj jako UTC i konwertuj na lokalny czas bez zmiany wartości
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        return 'Brak daty';
    }

    // Pobierz składowe daty bezpośrednio z ISO string (UTC)
    const startParts = start.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    const endParts = end.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);

    if (!startParts || !endParts) {
        return 'Brak daty';
    }

    const formattedStart = new Date(
        parseInt(startParts[1]),
        parseInt(startParts[2]) - 1,
        parseInt(startParts[3])
    ).toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    const formattedEnd = new Date(
        parseInt(endParts[1]),
        parseInt(endParts[2]) - 1,
        parseInt(endParts[3])
    ).toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    // Użyj godzin bezpośrednio z UTC string
    const startTime = `${startParts[4]}:${startParts[5]}`;
    const endTime = `${endParts[4]}:${endParts[5]}`;

    return `${formattedStart} ${startTime} - ${formattedEnd} ${endTime}`;
};


const calculateDiet = (startIso?: string, endIso?: string) => {
    if (!startIso || !endIso) return 0;

    const start = new Date(startIso);
    const end = new Date(endIso);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;

    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    // < 8h = 0 zł
    if (diffHours < 8) return 0;

    // 8-12h = 50% (22.50 zł)
    if (diffHours >= 8 && diffHours <= 12) return 22.50;

    // > 12h - liczymy pełne doby
    const fullDays = Math.floor(diffHours / 24);
    const remainingHours = diffHours % 24;

    let diet = fullDays * 45; // pełne doby po 45 zł

    // ostatni niepełny dzień
    if (remainingHours >= 8 && remainingHours <= 12) {
        diet += 22.50;
    } else if (remainingHours > 12) {
        diet += 45;
    }

    return diet;
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

    const totalDiet = filteredDelegacje.reduce((sum, d) =>
        sum + calculateDiet(d.dataRozpoczecia, d.dataZakonczenia), 0
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
    const handleGeneratePdf = async (id: string) => {
  setActionMessage(null);

  try {
    const pdfBlob = await generatePdfMutation.mutateAsync(id);

    const url = window.URL.createObjectURL(
      new Blob([pdfBlob], { type: 'application/pdf' })
    );

    const a = document.createElement('a');
    a.href = url;
    a.download = `delegacja-${id}.pdf`;
    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(url);

    setActionMessage({
      type: 'success',
      text: 'PDF wygenerowany i pobrany',
    });

    setTimeout(() => setActionMessage(null), 3000);
  } catch (error) {
    console.error(error);
    setActionMessage({
      type: 'error',
      text: 'Nie udało się wygenerować PDF',
    });
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
            // Poprawiona konwersja dat - zachowaj lokalny czas
            const payload: Partial<DelegacjaCreate> = {};

            if (editForm.miejsce !== undefined) {
                payload.miejsce = editForm.miejsce;
            }

            if (editForm.dataRozpoczecia) {
                const localDate = new Date(editForm.dataRozpoczecia);
                // Usuń offset strefy czasowej
                const tzOffset = localDate.getTimezoneOffset() * 60000;
                payload.dataRozpoczecia = new Date(localDate.getTime() - tzOffset).toISOString();
            }

            if (editForm.dataZakonczenia) {
                const localDate = new Date(editForm.dataZakonczenia);
                // Usuń offset strefy czasowej
                const tzOffset = localDate.getTimezoneOffset() * 60000;
                payload.dataZakonczenia = new Date(localDate.getTime() - tzOffset).toISOString();
            }

            if (editForm.uwagi !== undefined) {
                payload.uwagi = editForm.uwagi;
            }

            await updateMutation.mutateAsync({ id, payload });
            setEditingId(null);
            setEditForm({});
            setActionMessage({ type: 'success', text: 'Delegacja została zaktualizowana' });
            setTimeout(() => setActionMessage(null), 3000);
        } catch (error) {
            setActionMessage({ type: 'error', text: 'Nie udało się zaktualizować delegacji' });
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
                        <button onClick={() => navigate('/delegacje/ustawienia')} style={{ background: 'none', border: 'none', color: 'var(--white)', textDecoration: 'none', fontWeight: 700, textTransform: 'uppercase', fontSize: 'clamp(0.8rem, 2vw, 0.9em)', cursor: 'pointer', transition: 'color 0.3s ease' }}>Ustawienia</button>   
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

                    <div className="hero-meta hero-meta-diet">
                        <p className="metric-label">Suma diet</p>
                        <p className="metric-value">
                            {totalDiet.toFixed(2)} <span className="metric-currency">zł</span>
                        </p>
                        <p className="metric-sublabel">45 zł/doba, 12h</p>
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
                        <span className="action-message-icon">
                            {actionMessage.type === 'success' ? '✓' : '⚠'}
                        </span>
                        <span className="action-message-text">{actionMessage.text}</span>
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