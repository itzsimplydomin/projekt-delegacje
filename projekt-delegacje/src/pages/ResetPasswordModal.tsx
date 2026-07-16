import { memo, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { UserRow } from './AdminPanel';

interface ResetPasswordModalProps {
    target: UserRow;
    isPending: boolean;
    onClose: () => void;
    onSuccess: (message: string) => void;
    resetPassword: (vars: { email: string; newPassword: string }) => Promise<void>;
}

// Modal zmiany hasła użytkownika - wydzielony z AdminPanel dla czytelności
export const ResetPasswordModal = memo(({ target, isPending, onClose, onSuccess, resetPassword }: ResetPasswordModalProps) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!newPassword || !confirmPassword) {
            setError('Wszystkie pola są wymagane');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Hasła nie są takie same');
            return;
        }

        try {
            await resetPassword({ email: target.email, newPassword });
            onSuccess(`Hasło użytkownika ${target.imie} ${target.nazwisko} zostało zresetowane`);
        } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : 'Nie udało się zresetować hasła';
            setError(errMsg);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <p className="eyebrow">Bezpieczeństwo</p>
                        <h2>Zmień hasło</h2>
                        <p className="subtitle">
                            Ustaw nowe hasło dla {target.imie} {target.nazwisko} ({target.email})
                        </p>
                    </div>
                    <button
                        type="button"
                        className="modal-close-btn"
                        onClick={onClose}
                        aria-label="Zamknij"
                    >
                        <X className="icon" size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="settings-form">
                    {error && (
                        <div className="action-message error" role="alert">
                            <span className="action-message-icon"><AlertTriangle className="icon" size={16} /></span>
                            <span className="action-message-text">{error}</span>
                        </div>
                    )}
                    <div className="form-grid">
                        <label className="full-width">
                            Nowe hasło
                            <input
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                placeholder="Minimum 8 znaków"
                                autoFocus
                                required
                            />
                        </label>
                        <label className="full-width">
                            Potwierdź nowe hasło
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                placeholder="Powtórz nowe hasło"
                                required
                            />
                        </label>
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="secondary"
                            onClick={onClose}
                            disabled={isPending}
                        >
                            Anuluj
                        </button>
                        <button
                            type="submit"
                            className="primary"
                            disabled={isPending}
                        >
                            {isPending ? 'Zmieniam hasło...' : 'Zmień hasło'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

ResetPasswordModal.displayName = 'ResetPasswordModal';

export default ResetPasswordModal;
