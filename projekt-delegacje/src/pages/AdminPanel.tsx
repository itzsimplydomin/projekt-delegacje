import '/src/styles/App.css';
import '/src/styles/Dashboard.css';
import '/src/styles/AdminPanel.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useUsers, useRegisterUser } from '../api/hooks';
import { Navigate } from 'react-router-dom';
import logo from '/src/img/logoArtikon.png';
import Loader from './Loader';

type Tab = 'users' | 'create';

interface UserRow {
    email: string;
    imie: string;
    nazwisko: string;
    rola: string;
}

const EMPTY_FORM = { imie: '', nazwisko: '', email: '', password: '', rola: 'User' };

export const AdminPanel = () => {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [tab, setTab] = useState<Tab>('users');
    const [form, setForm] = useState(EMPTY_FORM);
    const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const { data: users = [], isLoading } = useUsers();
    const registerMutation = useRegisterUser();

    if (!isAdmin) return <Navigate to="/delegacje" replace />;

    const showMsg = (type: 'success' | 'error', text: string) => {
        setMsg({ type, text });
        setTimeout(() => setMsg(null), 3500);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.imie || !form.nazwisko || !form.email || !form.password) {
            showMsg('error', 'Wszystkie pola są wymagane');
            return;
        }
        try {
            await registerMutation.mutateAsync(form);
            showMsg('success', `Konto dla ${form.imie} ${form.nazwisko} zostało utworzone`);
            setForm(EMPTY_FORM);
            setTab('users');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Nie udało się utworzyć konta';
            showMsg('error', msg);
        }
    };

    return (
        <div className="dashboard-wrapper admin-page">
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
                        <button className="nav-link nav-link--admin" onClick={() => { setMenuOpen(false); navigate('/delegacje/admin'); }}>Admin</button>
                    </nav>
                </div>
            </header>

            <main className="dashboard-main">
                <section className="hero-card admin-hero">
                    <div>
                        <p className="eyebrow">Panel administracyjny</p>
                        <h1>Zarządzanie użytkownikami</h1>
                        <p className="subtitle">Przeglądaj konta pracowników i twórz nowe.</p>
                    </div>
                    <div className="admin-hero-meta">
                        <div className="hero-meta">
                            <p className="metric-label">Pracownicy</p>
                            <p className="metric-value">{users.filter((u: UserRow) => u.rola === 'User').length}</p>
                        </div>
                        <div className="hero-meta">
                            <p className="metric-label">Administratorzy</p>
                            <p className="metric-value">{users.filter((u: UserRow) => u.rola === 'Admin').length}</p>
                        </div>
                    </div>
                </section>

                {msg && (
                    <div className={`action-message ${msg.type}`} role="alert">
                        <span className="action-message-icon">{msg.type === 'success' ? '✓' : '⚠'}</span>
                        <span className="action-message-text">{msg.text}</span>
                    </div>
                )}

                <div className="admin-tabs">
                    <button
                        className={`admin-tab ${tab === 'users' ? 'active' : ''}`}
                        onClick={() => setTab('users')}
                    >
                        👥 Lista użytkowników
                    </button>
                    <button
                        className={`admin-tab ${tab === 'create' ? 'active' : ''}`}
                        onClick={() => setTab('create')}
                    >
                        ➕ Utwórz konto
                    </button>
                </div>

                {tab === 'users' && (
                    <section className="admin-section">
                        {isLoading ? (
                            <Loader fullScreen={false} message="Ładowanie użytkowników..." />
                        ) : users.length === 0 ? (
                            <p className="admin-empty">Brak użytkowników w systemie.</p>
                        ) : (
                            <div className="admin-users-grid">
                                {users.map((u: UserRow) => (
                                    <div className="admin-user-card" key={u.email}>
                                        <div className="admin-user-avatar">
                                            {u.imie.charAt(0)}{u.nazwisko.charAt(0)}
                                        </div>
                                        <div className="admin-user-info">
                                            <p className="admin-user-name">{u.imie} {u.nazwisko}</p>
                                            <p className="admin-user-email">{u.email}</p>
                                        </div>
                                        <span className={`admin-role-badge ${u.rola === 'Admin' ? 'admin' : 'user'}`}>
                                            {u.rola === 'Admin' ? '🔑 Admin' : '👤 Pracownik'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {tab === 'create' && (
                    <section className="admin-section">
                        <div className="admin-form-card">
                            <div className="settings-header">
                                <p className="eyebrow">Nowe konto</p>
                                <h2>Utwórz użytkownika</h2>
                                <p className="subtitle">Wypełnij dane pracownika i wybierz rolę.</p>
                            </div>
                            <form onSubmit={handleSubmit} className="settings-form">
                                <div className="form-grid admin-form-grid">
                                    <label>
                                        Imię
                                        <input
                                            type="text"
                                            value={form.imie}
                                            onChange={e => setForm({ ...form, imie: e.target.value })}
                                            placeholder="Jan"
                                            required
                                        />
                                    </label>
                                    <label>
                                        Nazwisko
                                        <input
                                            type="text"
                                            value={form.nazwisko}
                                            onChange={e => setForm({ ...form, nazwisko: e.target.value })}
                                            placeholder="Kowalski"
                                            required
                                        />
                                    </label>
                                    <label className="full-width">
                                        Adres e-mail
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })}
                                            placeholder="jan.kowalski@artikon.pl"
                                            required
                                        />
                                    </label>
                                    <label className="full-width">
                                        Hasło
                                        <input
                                            type="password"
                                            value={form.password}
                                            onChange={e => setForm({ ...form, password: e.target.value })}
                                            placeholder="Minimum 6 znaków"
                                            required
                                        />
                                    </label>
                                    <label className="full-width">
                                        Rola
                                        <div className="admin-role-select">
                                            <button
                                                type="button"
                                                className={`admin-role-option ${form.rola === 'User' ? 'active' : ''}`}
                                                onClick={() => setForm({ ...form, rola: 'User' })}
                                            >
                                                👤 Pracownik
                                            </button>
                                            <button
                                                type="button"
                                                className={`admin-role-option ${form.rola === 'Admin' ? 'active' : ''}`}
                                                onClick={() => setForm({ ...form, rola: 'Admin' })}
                                            >
                                                🔑 Administrator
                                            </button>
                                        </div>
                                    </label>
                                </div>
                                <button
                                    className="primary"
                                    type="submit"
                                    disabled={registerMutation.isPending}
                                    style={{ width: '100%', maxWidth: 400 }}
                                >
                                    {registerMutation.isPending ? 'Tworzę konto...' : 'Utwórz konto'}
                                </button>
                            </form>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default AdminPanel;