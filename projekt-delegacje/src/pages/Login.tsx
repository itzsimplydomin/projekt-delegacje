import './Login.css';

export const LoginBanner = () => {
  return (
    <section className="login-banner" aria-labelledby="login-banner-title">
      <div className="banner-copy">
        <span className="banner-eyebrow">Delegacje ARTIKON S.C</span>
        <h1 id="login-banner-title" className="banner-title">
          Zaloguj się i przejmij kontrolę nad podróżami służbowymi
        </h1>
        <p className="banner-description">
          Zarządzaj delegacjami, kosztami i rozliczeniami w jednym miejscu. Dzięki
          inteligentnym automatyzacjom oszczędzasz czas, zachowując pełną
          przejrzystość procesów.
        </p>
        <button className="banner-cta" type="button">
          Poznaj możliwości platformy
          <span aria-hidden>→</span>
        </button>
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
                placeholder="anna.kowalska@firma.pl"
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
            <label>
              <input type="checkbox" name="remember" /> Zapamiętaj mnie
            </label>
            <a href="#">Nie pamiętasz hasła?</a>
          </div>
        </div>
      </div>
    </section>
  );
};