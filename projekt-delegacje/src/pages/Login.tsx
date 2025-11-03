import '/src/styles/Login.css';

export const LoginBanner = () => {
  return (
    <section className="login-banner" aria-labelledby="login-banner-title">
      <div className="banner-copy">
        <span className="banner-eyebrow">Delegacje ARTIKON S.C</span>
        <h1 id="login-banner-title">Witamy w systemie do zarządzania delegacjami</h1>
      </div>

      <div className="banner-illustration">
        <div className="login-card" role="form" aria-label="Formularz logowania">
          <h2>Logowanie</h2>
          <form>
            <div className="form-field">
              <label htmlFor="email">Służbowy e-mail</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="nazwa@artikon.pl"
              />
            </div>
            <div className="form-field">
              <label htmlFor="password">Hasło</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder=""
              />
            </div>
            <button className="login-submit" type="submit">
              Zaloguj się
            </button>
          </form>
          <div className="login-meta">
            <label className="remember-label">
              <input type="checkbox" name="remember" />
              <span className="custom-checkbox" aria-hidden="true"></span>
              Zapamiętaj mnie
            </label>

          </div>
        </div>
      </div>
    </section>
  );
};