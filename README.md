## Dane autora projektu

| Pole | Wartość |
|------|----------|
| **Imię i nazwisko:** | Dominik Pakuła, Paweł Kulesza |
| **Numer indeksu:** | 322960, 322948 |
| **Temat projektu:** | Aplikacja do delegacji |

---

# 📄 Aplikacja Delegacje

Aplikacja **Delegacje** to system umożliwiający obsługę delegacji służbowych w przedsiębiorstwie. Projekt składa się z części backendowej oraz frontendowej i został wdrożony w środowisku chmurowym **Microsoft Azure**.

Celem aplikacji jest centralizacja procesu zarządzania delegacjami, poprawa bezpieczeństwa danych oraz eliminacja ręcznego przetwarzania dokumentów.

---

## 🚀 Funkcjonalności

### 👤 Użytkownik
- logowanie i autoryzacja przy użyciu JWT  
- tworzenie delegacji służbowych  
- edycja i usuwanie własnych delegacji  
- przegląd listy delegacji  
- generowanie dokumentów delegacji w formacie PDF  
- zmiana hasła użytkownika  

### 🛠️ Administrator
- tworzenie i zarządzanie kontami użytkowników  
- przegląd listy wszystkich użytkowników  
- wgląd w delegacje wybranego pracownika  
- filtrowanie delegacji (np. według imienia użytkownika)  

---

## 🧱 Architektura aplikacji

Aplikacja została zaprojektowana w architekturze klient–serwer z wyraźnym podziałem na warstwy.

### Backend
- **ASP.NET Core Web API**
- architektura warstwowa:  
  **Controller – Service – Model – DTO**

### Frontend
- **React**
- **TypeScript**
- **Vite**
- **React Router**

Frontend odpowiada za warstwę prezentacji, komunikację z API oraz obsługę routingu po stronie klienta.

---

## 🔐 Bezpieczeństwo

W aplikacji zaimplementowano:
- autentykację i autoryzację opartą o **JWT**  
- system ról użytkowników (**Admin**, **User**)  
- bezpieczne hashowanie haseł z użyciem soli (salt)  

---

## ☁️ Technologie i usługi

### Backend
- **ASP.NET Core Web API**
- **C#**

### Frontend
- **React**
- **TypeScript**
- **Vite**
- **React Router**

### Chmura (Microsoft Azure)
- **Azure Web App** – hosting backendu (24/7)  
- **Azure Table Storage** – dane użytkowników i delegacji  
- **Azure Blob Storage** – pliki PDF delegacji  

---

## ▶️ Uruchamianie projektu

### Wymagania
- Node.js (v18 lub nowszy)
- npm
- .NET SDK

### Frontend

1. Przejdź do katalogu z frontendem:
   ```bash
   cd projekt-delegacje
   npm install
   npm run dev
