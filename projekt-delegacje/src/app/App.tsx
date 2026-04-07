import '/src/styles/App.css';
import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RequireAuth } from '../auth/RequireAuth';
import { Providers } from './providers';

// Struktura aplikacji: główny router i lazy loading stron
const LoginBanner = lazy(() => import('../pages/Login'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const DelegationsList = lazy(() => import('../pages/DelegationsList'));
const Settings = lazy(() => import('../pages/Settings'));
const AdminPanel = lazy(() => import('../pages/AdminPanel'));

// Root App component: definiuje routing i layout aplikacji
export const App = () => {
  return (
    <Providers>
      <main className="app-shell">
        <Suspense fallback={<div className="route-loading">Ładowanie...</div>}>
          <Routes>
            <Route path="/" element={<LoginBanner />} />
            <Route path="/delegacje" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/delegacje/lista" element={<RequireAuth><DelegationsList /></RequireAuth>} />
            <Route path="/delegacje/ustawienia" element={<RequireAuth><Settings /></RequireAuth>} />
            <Route path="/delegacje/admin" element={<RequireAuth><AdminPanel /></RequireAuth>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </Providers>
  );
};

export default App;