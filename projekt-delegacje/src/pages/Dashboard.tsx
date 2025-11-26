import '/src/styles/App.css';
import '/src/styles/Dashboard.css';
import { useDelegacje } from '../api/hooks';
import { useState } from 'react';
import logo from '/src/img/logoArtikon.png'

export const Dashboard = () => {
    const { isLoading, isError } = useDelegacje();
    const [menuOpen, setMenuOpen] = useState(false);

    if (isLoading) {
        return <p>Ładowanie delegacji...</p>;
    }

    if (isError) {
        return <p>Nie udało się załadować strony.</p>;
    }

    return (
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
                    <a href="#glowna">Kalendarz</a>
                    <a href="#raporty">Raporty</a>
                    <a href="#delegacje">Delegacje</a>
                    <a href="#ustawienia">Ustawienia</a>
                </nav>
            </div>
        </header>
        
    );
};

export default Dashboard;