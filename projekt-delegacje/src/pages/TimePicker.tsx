import { useState, useRef, useEffect } from 'react';

interface TimePickerProps {
    name: string;
    value: string; // "HH:MM"
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    label?: string;
    required?: boolean;
}

export const TimePicker = ({ name, value, onChange, label, required }: TimePickerProps) => {
    const [open, setOpen] = useState(false);
    const [hours, setHours] = useState(() => parseInt(value.split(':')[0]) || 8);
    const [minutes, setMinutes] = useState(() => parseInt(value.split(':')[1]) || 0);
    const ref = useRef<HTMLDivElement>(null);

    const hourOptions = Array.from({ length: 24 }, (_, i) => i);
    const minuteOptions = [0, 15, 30, 45];

    // Synchronizacja stanu z wartością z propsów
    useEffect(() => {
        const [h, m] = value.split(':').map(Number);
        if (!isNaN(h)) setHours(h);
        if (!isNaN(m)) setMinutes(m);
    }, [value]);

    // Zamknięcie dropdownu po kliknięciu poza komponent
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const emit = (h: number, m: number) => {
        const hh = String(h).padStart(2, '0');
        const mm = String(m).padStart(2, '0');
        onChange({ target: { name, value: `${hh}:${mm}` } } as React.ChangeEvent<HTMLInputElement>);
    };

    const selectHour = (h: number) => {
        setHours(h);
        emit(h, minutes);
    };

    const selectMinute = (m: number) => {
        setMinutes(m);
        emit(hours, m);
        setOpen(false);
    };

    const pad = (n: number) => String(n).padStart(2, '0');

    return (
        <div className="tp-wrapper" ref={ref}>
            {label && (
                <span className="tp-label">
                    {label}
                    {required && <span className="tp-required"></span>}
                </span>
            )}

            <button
                type="button"
                className={`tp-trigger ${open ? 'open' : ''}`}
                onClick={() => setOpen(!open)}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <span className="tp-clock-icon" aria-hidden>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M8 4.5V8L10.5 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </span>
                <span className="tp-value">{pad(hours)}:{pad(minutes)}</span>
                <span className={`tp-chevron ${open ? 'up' : ''}`} aria-hidden>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </span>
            </button>

            {open && (
                <div className="tp-dropdown" role="dialog" aria-label="Wybierz godzinę">
                    <div className="tp-columns">
                        {/* Kolumny godzin */}
                        <div className="tp-col">
                            <p className="tp-col-label">Godzina</p>
                            <div className="tp-scroll" role="listbox" aria-label="Godziny">
                                {hourOptions.map((h) => (
                                    <button
                                        key={h}
                                        type="button"
                                        role="option"
                                        aria-selected={h === hours}
                                        className={`tp-option ${h === hours ? 'active' : ''}`}
                                        onClick={() => selectHour(h)}
                                    >
                                        {pad(h)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dzielnik */}
                        <div className="tp-divider" aria-hidden>:</div>

                        {/* Kolumna minut */}
                        <div className="tp-col">
                            <p className="tp-col-label">Minuta</p>
                            <div className="tp-scroll tp-scroll--minutes" role="listbox" aria-label="Minuty">
                                {minuteOptions.map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        role="option"
                                        aria-selected={m === minutes}
                                        className={`tp-option ${m === minutes ? 'active' : ''}`}
                                        onClick={() => selectMinute(m)}
                                    >
                                        {pad(m)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimePicker;