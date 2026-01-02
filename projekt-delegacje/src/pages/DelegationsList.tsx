import '/src/styles/App.css';
import '/src/styles/DelegationsList.css';
import '/src/styles/Dashboard.css';
import { useDelegacje } from '../api/hooks'
import { useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import logo from '/src/img/logoArtikon.png';


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
    const [menuOpen, setMenuOpen] = useState(false);

    if (isLoading) {
        return (
            <section className="delegations-list" aria-busy="true">
                <p className="delegations-status">Ładowanie delegacji...</p>
            </section>
        );
    }

    if (isError) {
        return (
            <section className="delegations-list">
                <p className="delegations-status delegations-status-error">
                    Nie udało się pobrać delegacji. Spróbuj ponownie później.
                </p>
            </section>
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

            <section className="delegations-list">
                <header className="delegations-header">
                    <div>
                        <p className="delegations-eyebrow">Panel delegacji</p>
                        <h1>Lista delegacji</h1>
                        <p className="delegations-subtitle">
                            Przeglądaj delegacje zapisane w systemie.
                        </p>
                    </div>
                    <div className="delegations-summary">
                        <span className="delegations-summary-label">Wszystkich delegacji</span>
                        <span className="delegations-summary-value">{delegacje.length}</span>
                    </div>
                </header>

                {delegacje.length === 0 ? (
                    <p className="delegations-status">Brak zapisanych delegacji.</p>
                ) : (
                    <div className="delegations-grid" role="list">
                        {delegacje.map((delegacja) => (
                            <article
                                className="delegations-card"
                                key={`${delegacja.partitionKey}-${delegacja.rowKey}`}
                                role="listitem"
                            >
                                <header>
                                    <p className="delegations-card-title">
                                        {delegacja.pracownikImie} {delegacja.pracownikNazwisko}
                                    </p>
                                    <p className="delegations-card-meta">
                                        ID pracownika: {delegacja.pracownikID}
                                    </p>
                                </header>

                                <div className="delegations-card-body">
                                    <div>
                                        <span className="delegations-card-label">Miejsce</span>
                                        <p>{delegacja.miejsce}</p>
                                    </div>
                                    <div>
                                        <span className="delegations-card-label">Termin</span>
                                        <p>{formatDateRange(delegacja.dataRozpoczecia, delegacja.dataZakonczenia)}</p>
                                    </div>
                                </div>

                                {delegacja.uwagi && (
                                    <div className="delegations-card-footer">
                                        <span className="delegations-card-label">Uwagi</span>
                                        <p>{delegacja.uwagi}</p>
                                    </div>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </section>

        </div>
    );
};


export default DelegationsList;
