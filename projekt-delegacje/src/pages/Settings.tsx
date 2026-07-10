import '/src/styles/App.css';
import '/src/styles/Dashboard.css';
import '/src/styles/Settings.css';
import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { useChangePassword } from '../api/hooks';
import { useAuth } from '../auth/AuthContext';
import { Sidebar } from '../components/Sidebar';

// Strona ustawień: zmiana hasła, wylogowanie, informacje o wersji i licencji, z responsywnym menu i komunikatami o sukcesie/błędzie
export const Settings = () => {
    const { logout } = useAuth();
    const changePasswordMutation = useChangePassword();
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage(null);

        if (!formData.currentPassword || !formData.newPassword || !formData.confirmNewPassword) {
            setMessage({ type: 'error', text: 'Wszystkie pola są wymagane' });
            setTimeout(() => setMessage(null), 3000);
            return;
        }

        if (formData.newPassword !== formData.confirmNewPassword) {
            setMessage({ type: 'error', text: 'Nowe hasła nie są takie same' });
            setTimeout(() => setMessage(null), 3000);
            return;
        }

        if (formData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Hasło musi mieć minimum 6 znaków' });
            setTimeout(() => setMessage(null), 3000);
            return;
        }

        try {
            await changePasswordMutation.mutateAsync(formData);
            setMessage({ type: 'success', text: 'Hasło zostało pomyślnie zmienione' });
            setFormData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
            setTimeout(() => setMessage(null), 3000);

        } catch (error: unknown) {
            const msg =
                error instanceof Error ? error.message : 'Nie udało się zmienić hasła';
            setMessage({ type: 'error', text: msg });
            setTimeout(() => setMessage(null), 3000);
        }
    };

    return (
        <div className="dashboard-wrapper settings-page">
            <Sidebar />

            <main className="dashboard-main">


                <section className="settings-container">
                    <div className="settings-card">
                        <div className="settings-header">
                            <div>
                                <p className="eyebrow">Bezpieczeństwo</p>
                                <h2>Zmiana hasła</h2>
                                <p className="subtitle">Hasło musi mieć minimum 6 znaków.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="settings-form">

                            {message && (
                                <div className={`action-message ${message.type}`} role="alert">
                                    <span className="action-message-icon">
                                        {message.type === 'success' ? <CheckCircle2 className="icon" size={16} /> : <AlertTriangle className="icon" size={16} />}
                                    </span>
                                    <span className="action-message-text">{message.text}</span>
                                </div>
                            )}
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
                                {changePasswordMutation.isPending ? 'Zmieniam hasło...' : 'Zmień hasło'}
                            </button>

                            <button
                                className="logout-btn"
                                type="button"
                                onClick={logout}
                            >
                                Wyloguj się
                            </button>

                            <div className="settings-footer">
                                <p className="app-version">Wersja aplikacji: 1.0.4</p>
                                <p className="app-license">©artikon s.c. 2026 - Wszystkie prawa zastrzeżone</p>
                            </div>
                        </form>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Settings;