import '/src/styles/App.css';
import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
const LoginBanner = lazy(() => import('../pages/Login'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const DelegationsList = lazy(() => import('../pages/DelegationsList'));
const Settings = lazy(() => import('../pages/Settings'));
import { Providers } from './providers';

// Główna aplikacja
export const App = () => {
  return (

    // Otaczanie aplikacji dostawcami kontekstu
    <Providers>
      <main className="app-shell">
        <Suspense fallback={<div className="route-loading">Ładowanie...</div>}>
          <Routes>
            <Route path="/" element={<LoginBanner />} />
            <Route path="/delegacje" element={<Dashboard />} />
            <Route path="/delegacje/lista" element={<DelegationsList />} />
            <Route path="/delegacje/ustawienia" element={<Settings />} />
          </Routes>
        </Suspense>
      </main>
    </Providers>
  );
};

export default App;
