import '/src/styles/App.css';
import { LoginBanner } from '../pages/Login';

export const App = () => {
  return (
    <main className="app-shell">
      <LoginBanner />
    </main>
  );
};

export default App;