import '/src/styles/App.css';
import '/src/styles/Dashboard.css';
import '/src/styles/AdminPanel.css';
import { useState } from 'react';
import { CheckCircle2, AlertTriangle, Users, Plus, ShieldCheck, User, Trash2 } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useUsers, useRegisterUser, useDeleteUser } from '../api/hooks';
import { Navigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import Loader from './Loader';

// Typy i interfejsy
type Tab = 'users' | 'create';

// Interfejs reprezentujący wiersz użytkownika w tabeli
interface UserRow {
    email: string;
    imie: string;
    nazwisko: string;
    rola: string;
}

// Stała reprezentująca pusty formularz do tworzenia użytkownika
const EMPTY_FORM = { imie: '', nazwisko: '', email: '', password: '', rola: 'User' };

export const AdminPanel = () => {

    // Hooki i stany komponentu
    const { isAdmin, user: currentUser } = useAuth();
    const [tab, setTab] = useState<Tab>('users');
    const [form, setForm] = useState(EMPTY_FORM);
    const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const { data: users = [], isLoading } = useUsers();
    const registerMutation = useRegisterUser();
    const deleteMutation = useDeleteUser();

    // Jeśli użytkownik nie jest administratorem, przekieruj go do strony delegacji
    if (!isAdmin) return <Navigate to="/delegacje" replace />;

    // Funkcja do wyświetlania komunikatów akcji (sukces lub błąd)
    const showMsg = (type: 'success' | 'error', text: string) => {
        setMsg({ type, text });
        setTimeout(() => setMsg(null), 3500);
    };

    // Funkcja obsługująca przesłanie formularza tworzenia użytkownika
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

    // Funkcja obsługująca usuwanie użytkownika
    const handleDeleteUser = async (u: UserRow) => {
        if (!window.confirm(`Czy na pewno chcesz usunąć użytkownika ${u.imie} ${u.nazwisko} (${u.email})?\n\nUsunięte zostaną również wszystkie jego delegacje.`)) return;
        try {
            await deleteMutation.mutateAsync(u.email);
            showMsg('success', `Użytkownik ${u.imie} ${u.nazwisko} został usunięty`);
        } catch (err: unknown) {
            const errMsg =
                err instanceof Error
                    ? err.message
                    : 'Nie udało się usunąć użytkownika';
            showMsg('error', errMsg);
        }
    };

    // Renderowanie komponentu
    return (
        <div className="dashboard-wrapper admin-page">
            <Sidebar />

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
                        <span className="action-message-icon">{msg.type === 'success' ? <CheckCircle2 className="icon" size={16} /> : <AlertTriangle className="icon" size={16} />}</span>
                        <span className="action-message-text">{msg.text}</span>
                    </div>
                )}

                <div className="admin-tabs">
                    <button
                        className={`admin-tab ${tab === 'users' ? 'active' : ''}`}
                        onClick={() => setTab('users')}
                    >
                        <Users className="icon" size={18} /> Lista użytkowników
                    </button>
                    <button
                        className={`admin-tab ${tab === 'create' ? 'active' : ''}`}
                        onClick={() => setTab('create')}
                    >
                        <Plus className="icon" size={18} /> Utwórz konto
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
                                {users.map((u: UserRow) => {
                                    const isSelf = u.email.toLowerCase() === currentUser?.email?.toLowerCase();
                                    const adminCount = users.filter((x: UserRow) => x.rola === 'Admin').length;
                                    const isLastAdmin = u.rola === 'Admin' && adminCount <= 1;
                                    const canDelete = !isSelf && !isLastAdmin;

                                    return (
                                        <div className="admin-user-card" key={u.email}>
                                            <div className="admin-user-avatar">
                                                {u.imie.charAt(0)}{u.nazwisko.charAt(0)}
                                            </div>
                                            <div className="admin-user-info">
                                                <p className="admin-user-name">{u.imie} {u.nazwisko}</p>
                                                <p className="admin-user-email">{u.email}</p>
                                            </div>
                                            <span className={`admin-role-badge ${u.rola === 'Admin' ? 'admin' : 'user'}`}>
                                                {u.rola === 'Admin' ? <><ShieldCheck className="icon" size={16} /> Admin</> : <><User className="icon" size={16} /> Pracownik</>}
                                            </span>
                                            <button
                                                className="admin-delete-btn"
                                                onClick={() => handleDeleteUser(u)}
                                                disabled={!canDelete || deleteMutation.isPending}
                                                title={
                                                    isSelf
                                                        ? 'Nie możesz usunąć własnego konta'
                                                        : isLastAdmin
                                                            ? 'Nie można usunąć ostatniego administratora'
                                                            : `Usuń użytkownika ${u.imie} ${u.nazwisko}`
                                                }
                                                aria-label={`Usuń użytkownika ${u.imie} ${u.nazwisko}`}
                                            >
                                                <Trash2 className="icon" size={16} />
                                            </button>
                                        </div>
                                    );
                                })}
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
                                                <User className="icon" size={16} /> Pracownik
                                            </button>
                                            <button
                                                type="button"
                                                className={`admin-role-option ${form.rola === 'Admin' ? 'active' : ''}`}
                                                onClick={() => setForm({ ...form, rola: 'Admin' })}
                                            >
                                                <ShieldCheck className="icon" size={16} /> Administrator
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