import '/src/styles/App.css';
import { Routes, Route } from 'react-router-dom';
import { LoginBanner } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { DelegationsList } from '../pages/DelegationsList';
import { Settings } from '../pages/Settings';
import { Providers } from './providers';

export const App = () => {
  return (
    <Providers>
      <main className="app-shell">
        <Routes>
          <Route path="/" element={<LoginBanner />} />
          <Route path="/delegacje" element={<Dashboard />} />
          <Route path="/delegacje/lista" element={<DelegationsList />} />
          <Route path="/delegacje/ustawienia" element={<Settings />} />
        </Routes>
      </main>
    </Providers>
  );
};

export default App;
