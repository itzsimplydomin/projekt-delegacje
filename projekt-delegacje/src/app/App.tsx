import '/src/styles/App.css';
import { Routes, Route } from 'react-router-dom';
import { LoginBanner } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { Providers } from './providers';

export const App = () => {
  return (
    <Providers>
      <main className="app-shell">
        <Routes>
          <Route path="/" element={<LoginBanner />} />
          <Route path="/delegacje" element={<Dashboard />} />
        </Routes>
      </main>
    </Providers>
  );
};

export default App;
