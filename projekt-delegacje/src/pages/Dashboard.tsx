import '/src/styles/App.css';
import '/src/styles/Dashboard.css';
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, isWithinInterval, startOfMonth, startOfWeek } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDelegacje } from '../api/hooks';
import { createDelegacja } from '../api/client';
import { useMemo, useState } from 'react';
import type { DelegacjaCreate } from '../api/types';
import logo from '/src/img/logoArtikon.png';

export const Dashboard = () => {
    const { data: delegacje = [], isLoading, isError } = useDelegacje();
    const queryClient = useQueryClient();
    const [menuOpen, setMenuOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedRange, setSelectedRange] = useState<{ start: Date | null; end: Date | null }>({
        start: null,
        end: null,
    });
    const [formState, setFormState] = useState({
        pracownikImie: '',
        pracownikNazwisko: '',
        pracownikID: '',
        miejsce: '',
        uwagi: '',
        godzinaRozpoczecia: '08:00',
        godzinaZakonczenia: '16:00',
    });
    const [submitMessage, setSubmitMessage] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: async (payload: DelegacjaCreate) => createDelegacja(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['delegacje'] });
            setSubmitMessage('Delegacja została dodana do kalendarza.');
            setSelectedRange({ start: null, end: null });
            setFormState({
                pracownikImie: '',
                pracownikNazwisko: '',
                pracownikID: '',
                miejsce: '',
                uwagi: '',
                godzinaRozpoczecia: '08:00',
                godzinaZakonczenia: '16:00',
            });
        },
        onError: () => setSubmitMessage('Nie udało się zapisać delegacji. Sprawdź dane i spróbuj ponownie.'),
    });

    const monthDays = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
        const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
        return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    }, [currentMonth]);

    const delegationsByDay = useMemo(() =>
        monthDays.map((day) => {
            const matches = delegacje.filter((delegacja) => {
                // Konwersja dat z UTC na lokalną datę bez zmiany wartości dnia
                const startDate = new Date(delegacja.dataRozpoczecia);
                const endDate = new Date(delegacja.dataZakonczenia);

                // Normalizacja dat do początku dnia w lokalnej strefie czasowej
                const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
                const delegationStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
                const delegationEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

                return isWithinInterval(dayStart, {
                    start: delegationStart,
                    end: delegationEnd,
                });
            });
            return { day, matches };
        }),
        [delegacje, monthDays]);

    const handleDaySelection = (day: Date) => {
        setSubmitMessage(null);
        if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
            setSelectedRange({ start: day, end: null });
        } else if (selectedRange.start && !selectedRange.end) {
            if (day < selectedRange.start) {
                setSelectedRange({ start: day, end: selectedRange.start });
            } else {
                setSelectedRange({ start: selectedRange.start, end: day });
            }
        }
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitMessage(null);

        if (!selectedRange.start || !selectedRange.end) {
            setSubmitMessage('Wybierz zakres dat delegacji.');
            return;
        }

        // Tworzenie dat z godzinami
        const [startHour, startMinute] = formState.godzinaRozpoczecia.split(':').map(Number);
        const [endHour, endMinute] = formState.godzinaZakonczenia.split(':').map(Number);

        const startDateTime = new Date(selectedRange.start);
        startDateTime.setHours(startHour, startMinute, 0, 0);

        const endDateTime = new Date(selectedRange.end);
        endDateTime.setHours(endHour, endMinute, 0, 0);

        const payload: DelegacjaCreate = {
            partitionKey: 'delegacja',
            rowKey: '',
            pracownikImie: formState.pracownikImie,
            pracownikNazwisko: formState.pracownikNazwisko,
            pracownikID: Number(formState.pracownikID),
            miejsce: formState.miejsce,
            dataRozpoczecia: startDateTime.toISOString(),
            dataZakonczenia: endDateTime.toISOString(),
            uwagi: formState.uwagi,
        };

        mutation.mutate(payload);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setFormState((prev) => ({ ...prev, [name]: value }));
    };

    if (isLoading) {
        return <p>Ładowanie delegacji...</p>;
    }

    if (isError) {
        return <p>Nie udało się załadować strony.</p>;
    }

    return (
        <div className="dashboard-wrapper">
            <header className="dark-header">
                <div className="nav-center">
                    <div className="logo">
                        <img src={logo} alt="Logo Artikon" loading="lazy" />
                    </div>

                    <button
                        className="menu-toggle"
                        aria-label="Przełącz menu"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        ☰
                    </button>

                    <nav
                        className={`main-nav ${menuOpen ? 'open' : ''}`}
                        role="navigation"
                        aria-label="Menu główne"
                    >
                        <a href="#kalendarz">Kalendarz</a>
                        <a href="#delegacje">Delegacje</a>
                        <a href="#ustawienia">Ustawienia</a>
                    </nav>
                </div>
            </header>

            <main className="dashboard-main">
                <section className="hero-card">
                    <div>
                        <h1>Planowanie delegacji</h1>
                        <p className="subtitle">
                            Zaznacz na kalendarzu daty delegacji, uzupełnij szczegóły i wyślij do systemu.
                        </p>
                    </div>
                    <div className="hero-meta">
                        <p className="metric-label">Aktywne delegacje</p>
                        <p className="metric-value">{delegacje.length}</p>
                    </div>
                </section>

                <section className="workbench" id="kalendarz">
                    <div className="calendar-shell">
                        <div className="calendar-header">
                            <div>
                                <p className="eyebrow">Kalendarz delegacji</p>
                                <h2>{format(currentMonth, 'LLLL yyyy')}</h2>
                                <p className="subtitle">Dotknij zakres dat, aby dodać delegację. Dni z kropką zawierają wpisy.</p>
                            </div>
                            <div className="month-nav">
                                <button onClick={() => setCurrentMonth((prev) => addMonths(prev, -1))} aria-label="Poprzedni miesiąc">
                                    ◀
                                </button>
                                <button onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))} aria-label="Następny miesiąc">
                                    ▶
                                </button>
                            </div>
                        </div>

                        <div className="calendar">
                            <div className="calendar-weekdays">
                                {['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd'].map((day) => (
                                    <span key={day}>{day}</span>
                                ))}
                            </div>
                            <div className="calendar-scroll">
                                <div className="calendar-grid">
                                    {delegationsByDay.map(({ day, matches }) => {
                                        const isStart = Boolean(selectedRange.start && isSameDay(day, selectedRange.start));
                                        const isEnd = Boolean(selectedRange.end && isSameDay(day, selectedRange.end));
                                        const isInside = Boolean(
                                            selectedRange.start &&
                                            selectedRange.end &&
                                            isWithinInterval(day, {
                                                start: selectedRange.start,
                                                end: selectedRange.end,
                                            }),
                                        );
                                        const isOutsideMonth = !isSameMonth(day, currentMonth);
                                        const hasDelegation = matches.length > 0;

                                        return (
                                            <button
                                                key={day.toISOString()}
                                                type="button"
                                                className={`calendar-day ${isOutsideMonth ? 'muted' : ''} ${isInside ? 'selected' : ''} ${isStart || isEnd ? 'range-edge' : ''
                                                    } ${hasDelegation ? 'has-delegation' : ''}`}
                                                onClick={() => handleDaySelection(day)}
                                                aria-pressed={isInside}
                                                aria-label={`Dzień ${format(day, 'dd MMMM yyyy')}${hasDelegation ? ', posiada delegację' : ''}`}
                                            >
                                                <span className="day-number">{format(day, 'd')}</span>
                                                {hasDelegation && <span className="dot" aria-hidden />}
                                                {isStart && <span className="pill">Start</span>}
                                                {isEnd && <span className="pill">Koniec</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="planner-grid" id="delegacje">
                        <div className="selection-card">
                            <p className="eyebrow">Wybrany zakres</p>
                            <h3>Tworzysz delegację</h3>
                            <ul className="selection-meta">
                                <li>
                                    <span>Od</span>
                                    <strong>
                                        {selectedRange.start
                                            ? `${format(selectedRange.start, 'dd.MM.yyyy')} ${formState.godzinaRozpoczecia}`
                                            : '—'}
                                    </strong>
                                </li>
                                <li>
                                    <span>Do</span>
                                    <strong>
                                        {selectedRange.end
                                            ? `${format(selectedRange.end, 'dd.MM.yyyy')} ${formState.godzinaZakonczenia}`
                                            : '—'}
                                    </strong>
                                </li>
                                <li>
                                    <span>Dni delegacji</span>
                                    <strong>
                                        {selectedRange.start && selectedRange.end
                                            ? Math.max(
                                                1,
                                                Math.ceil(
                                                    (selectedRange.end.getTime() - selectedRange.start.getTime()) /
                                                    (1000 * 60 * 60 * 24),
                                                ) + 1,
                                            )
                                            : '0'}
                                    </strong>
                                </li>
                            </ul>
                            <p className="subtitle">
                                Zmiany widoczne powyżej pojawią się po udanym zapisie w bazie danych.
                            </p>
                        </div>

                        <form className="delegation-form" onSubmit={handleSubmit}>
                            <div className="form-header">
                                <div>
                                    <p className="eyebrow">Szczegóły</p>
                                    <h3>Nowa delegacja</h3>
                                    <p className="subtitle">Uzupełnij wymagane pola.</p>
                                </div>
                            </div>

                            <div className="form-grid">
                                {/* Pracownik Details 
                                
                                <label>
                                    Imię pracownika
                                    <input
                                        type="text"
                                        name="pracownikImie"
                                        value={formState.pracownikImie}
                                        onChange={handleInputChange}
                                        placeholder="np. Jan"
                                        required
                                    />
                                </label>
                                <label>
                                    Nazwisko pracownika
                                    <input
                                        type="text"
                                        name="pracownikNazwisko"
                                        value={formState.pracownikNazwisko}
                                        onChange={handleInputChange}
                                        placeholder="np. Kowalski"
                                        required
                                    />
                                </label>
                                <label>
                                    ID pracownika
                                    <input
                                        type="number"
                                        name="pracownikID"
                                        value={formState.pracownikID}
                                        onChange={handleInputChange}
                                        placeholder="np. 1024"
                                        required
                                    />
                                </label>
                                */}

                                <label>
                                    Miejsce delegacji
                                    <input
                                        type="text"
                                        name="miejsce"
                                        value={formState.miejsce}
                                        onChange={handleInputChange}
                                        placeholder="Miasto lub region"
                                        required
                                    />
                                </label>
                                <label>
                                    Godzina rozpoczęcia
                                    <input
                                        type="time"
                                        name="godzinaRozpoczecia"
                                        value={formState.godzinaRozpoczecia}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </label>
                                <label>
                                    Godzina zakończenia
                                    <input
                                        type="time"
                                        name="godzinaZakonczenia"
                                        value={formState.godzinaZakonczenia}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </label>
                                <label className="full-width">
                                    Uwagi dla zespołu
                                    <textarea
                                        name="uwagi"
                                        value={formState.uwagi}
                                        onChange={handleInputChange}
                                        placeholder="Logistyka, nocleg, transport..."
                                        rows={3}
                                    />
                                </label>
                            </div>

                            <button className="primary" type="submit" disabled={mutation.isPending}>
                                Zapisz delegację
                            </button>
                            {submitMessage && <p className="form-message">{submitMessage}</p>}
                        </form>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;