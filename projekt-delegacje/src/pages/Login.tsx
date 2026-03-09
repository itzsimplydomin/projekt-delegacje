import { type FormEvent, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import '/src/styles/Login.css';
import { login, getToken } from '../api/client';

export const LoginBanner = () => {
  const navigate = useNavigate();

  // Jeśli token już istnieje – przekieruj na dashboard bez renderowania loginu
  if (getToken()) {
    return <Navigate to="/delegacje" replace />;
  }

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [remember, setRemember] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const response = await login({ email, password }, remember);

      if (response.success) {
        setMessage(response.message ?? 'Zalogowano pomyślnie');
        navigate('/delegacje');
      } else {
        setError(response.message ?? 'Nieprawidłowe dane logowania');
      }
    } catch (e) {
      console.error(e);
      setError('Błąd połączenia z serwerem.');
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

            {error && <p className="login-error">{error}</p>}
            {message && <p className="login-success">{message}</p>}

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
              <span className="custom-checkbox" aria-hidden="true"></span>
              Zapamiętaj mnie
            </label>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginBanner;