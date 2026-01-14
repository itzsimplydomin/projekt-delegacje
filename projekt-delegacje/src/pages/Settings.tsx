import '/src/styles/App.css';
import '/src/styles/Dashboard.css';
import '/src/styles/Settings.css';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChangePassword } from '../api/hooks';
import logo from '/src/img/logoArtikon.png';

export const Settings = () => {
    const navigate = useNavigate();
    const changePasswordMutation = useChangePassword();

    const [menuOpen, setMenuOpen] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [message, setMessage] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage(null);

        // Walidacja po stronie frontendu
        if (!formData.currentPassword || !formData.newPassword || !formData.confirmNewPassword) {
            setMessage({
                type: 'error',
                text: 'Wszystkie pola są wymagane',
            });
            return;
        }

        if (formData.newPassword !== formData.confirmNewPassword) {
            setMessage({
                type: 'error',
                text: 'Nowe hasła nie są takie same',
            });
            return;
        }

        if (formData.newPassword.length < 6) {
            setMessage({
                type: 'error',
                text: 'Hasło musi mieć minimum 6 znaków',
            });
            return;
        }

        try {
            await changePasswordMutation.mutateAsync(formData);

            setMessage({
                type: 'success',
                text: 'Hasło zostało pomyślnie zmienione',
            });

            // Wyczyść formularz
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: '',
            });
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.message || 'Nie udało się zmienić hasła',
            });
        }
    };

    return (
        <div className="dashboard-wrapper settings-page">
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
                        id='main-nav'
                        className={`main-nav ${menuOpen ? 'open' : ''}`}
                        role="navigation"
                        aria-label="Menu główne"
                    >
                        <button className="nav-link" onClick={() => { setMenuOpen(false); navigate('/delegacje'); }}>
                            Kalendarz
                        </button>
                        <button className="nav-link" onClick={() => { setMenuOpen(false); navigate('/delegacje/lista'); }}>
                            Delegacje
                        </button>
                        <button className="nav-link" onClick={() => { setMenuOpen(false); navigate('/delegacje/ustawienia'); }}>
                            Ustawienia
                        </button>
                    </nav>
                </div>
            </header>

            <main className="dashboard-main">
                {message && (
                    <div className={`action-message ${message.type}`}>
                        <span className="action-message-icon">
                            {message.type === 'success' ? '✓' : '⚠'}
                        </span>
                        <span className="action-message-text">{message.text}</span>
                    </div>
                )}

                <section className="settings-container">
                    <div className="settings-card">
                        <div className="settings-header">
                            <div>
                                <p className="eyebrow">Bezpieczeństwo</p>
                                <h2>Zmiana hasła</h2>
                                <p className="subtitle">
                                    Hasło musi mieć minimum 6 znaków.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="settings-form">
                            <div className="form-grid">
                                <label className="full-width">
                                    Obecne hasło
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleInputChange}
                                        placeholder="Wpisz obecne hasło"
                                        required
                                    />
                                </label>

                                <label>
                                    Nowe hasło
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleInputChange}
                                        placeholder="Minimum 6 znaków"
                                        required
                                    />
                                </label>

                                <label>
                                    Potwierdź nowe hasło
                                    <input
                                        type="password"
                                        name="confirmNewPassword"
                                        value={formData.confirmNewPassword}
                                        onChange={handleInputChange}
                                        placeholder="Powtórz nowe hasło"
                                        required
                                    />
                                </label>
                            </div>

                            <button
                                className="primary"
                                type="submit"
                                disabled={changePasswordMutation.isPending}
                            >
                                {changePasswordMutation.isPending
                                    ? 'Zmieniam hasło...'
                                    : 'Zmień hasło'}
                            </button>

                            <button
                                className="logout-btn"
                                type="button"
                                onClick={handleLogout}
                            >
                                Wyloguj się
                            </button>

                            <div className="settings-footer">
                                <p className="app-version">Wersja aplikacji: 0.0.0</p>
                                <p className="app-license">©Artikon 2026 - Wszystkie prawa zastrzeżone</p>
                            </div>
                        </form>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Settings;