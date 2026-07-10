import './Sidebar.css';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Calendar, Luggage, UserCog, Settings, Sun, Moon, LogOut } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../app/ThemeContext';
import logo from '/src/img/logoArtikon.png';

const NAV_ITEMS = [
    { label: 'Kalendarz', icon: Calendar, path: '/delegacje' },
    { label: 'Delegacje', icon: Luggage, path: '/delegacje/lista' },
];

const ADMIN_ITEM = { label: 'Admin', icon: UserCog, path: '/delegacje/admin' };

export function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAdmin, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const handleNav = (path: string) => {
        navigate(path);
        setIsOpen(false);
    };

    const isActive = (path: string) => location.pathname === path;

    const navItems = isAdmin ? [...NAV_ITEMS, ADMIN_ITEM] : NAV_ITEMS;

    return (
        <>
            {/* Mobilny header z hamburgerem */}
            <div className="mobile-header">
                <img src={logo} alt="Logo Artikon" className="mobile-header-logo" />
                <button
                    className="mobile-hamburger"
                    onClick={() => setIsOpen(true)}
                    aria-label="Otwórz menu"
                >
                    <Menu className="icon" size={24} />
                </button>
            </div>

            {/* Overlay na mobilnym */}
            <div
                className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
            />

            {/* Sidebar */}
            <aside className={`sidebar ${isOpen ? 'open' : ''}`} aria-label="Nawigacja">

                {/* Logo i nazwa */}
                <div className="sidebar-logo">
                    <img src={logo} alt="Logo Artikon" />
                </div>

                {/* Informacje o użytkowniku */}
                <div className="sidebar-user">
                    <div className="sidebar-avatar">
                        {user?.email?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                    <div className="sidebar-user-info">
                        <p className="sidebar-user-email">{user?.email}</p>
                        <p className="sidebar-user-role">{user?.role}</p>
                    </div>
                </div>

                <hr className="sidebar-divider" />

                {/* Nawigacja główna */}
                <nav className="sidebar-nav" aria-label="Menu główne">
                    {navItems.map(item => (
                        <button
                            key={item.path}
                            className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
                            onClick={() => handleNav(item.path)}
                        >
                            <item.icon className="icon" size={18} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="sidebar-spacer" />

                {/* Dolna sekcja: ustawienia, motyw, wyloguj */}
                <div className="sidebar-bottom">
                    <button
                        className={`sidebar-link ${isActive('/delegacje/ustawienia') ? 'active' : ''}`}
                        onClick={() => handleNav('/delegacje/ustawienia')}
                    >
                        <Settings className="icon" size={18} />
                        Ustawienia
                    </button>

                    <button className="sidebar-link" onClick={toggleTheme}>
                        {theme === 'dark' ? <Sun className="icon" size={18} /> : <Moon className="icon" size={18} />}
                        {theme === 'dark' ? 'Jasny motyw' : 'Ciemny motyw'}
                    </button>

                    <button className="sidebar-link sidebar-logout" onClick={logout}>
                        <LogOut className="icon" size={18} />
                        Wyloguj się
                    </button>
                </div>
            </aside>
        </>
    );
}
