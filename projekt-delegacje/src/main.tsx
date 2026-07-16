import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './app/App';
// Pliki łączone (nie same "latin"/"latin-ext") - zawierają poprawny
// unicode-range dla każdego podzbioru, dzięki czemu przeglądarka i tak
// pobiera z sieci tylko pliki latin/latin-ext (polskie znaki), a pozostałe
// podzbiory (cyrillic/greek/vietnamese) nigdy nie są faktycznie pobierane
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '/src/styles/index.css';

// Utworzenie korzenia aplikacji i renderowanie komponentu App wewnątrz BrowserRouter
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

// Renderowanie aplikacji React
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
