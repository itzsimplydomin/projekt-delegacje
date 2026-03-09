import { type FormEvent, useState } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import '/src/styles/Login.css';
import { loginRequest } from '../api/client';
import { useAuth } from '../auth/AuthContext';

export const LoginBanner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();

  // Jeśli token już istnieje i jest ważny – przekieruj
  if (isAuthenticated) {
    const from = (location.state as { from?: Location })?.from?.pathname ?? '/delegacje';
    return <Navigate to={from} replace />;
  }

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = await loginRequest({ email, password });
      login(token, remember);

      const from = (location.state as { from?: Location })?.from?.pathname ?? '/delegacje';
      navigate(from, { replace: true });
    } catch (e: unknown) {
      console.error(e);
      if (
        typeof e === 'object' &&
        e !== null &&
        'response' in e &&
        (e as { response?: { status?: number } }).response?.status === 401
      ) {
        setError('Nieprawidłowy email lub hasło.');
      } else {
        setError('Błąd połączenia z serwerem.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="login-banner" aria-labelledby="login-banner-title">
      <div className="banner-copy">
        <span className="banner-eyebrow">Delegacje ARTIKON S.C</span>
        <h1 id="login-banner-title">
          Witamy w systemie do zarządzania delegacjami
        </h1>
      </div>

      <div className="banner-illustration">
        <div className="login-card" role="form" aria-label="Formularz logowania">
          <h2>Logowanie</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="email">Służbowy e-mail</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="nazwisko@artikon.pl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="password">Hasło</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="login-error" role="alert">{error}</p>}

            <button
              className="login-submit"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logowanie...' : 'Zaloguj się'}
            </button>
          </form>

          <div className="login-meta">
            <label className="remember-label">
              <input
                type="checkbox"
                name="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span className="custom-checkbox" aria-hidden="true" />
              Zapamiętaj mnie
            </label>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginBanner;