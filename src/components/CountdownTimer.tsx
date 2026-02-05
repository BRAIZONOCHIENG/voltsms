
import { useState, useEffect } from 'react';

export const CountdownTimer = ({ expiresAt }: { expiresAt: number }) => {
    const [timeLeft, setTimeLeft] = useState(expiresAt - Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            const tl = expiresAt - Date.now();
            setTimeLeft(tl);
            if (tl <= 0) clearInterval(interval);
        }, 1000);
        return () => clearInterval(interval);
    }, [expiresAt]);

    if (timeLeft <= 0) return <span>Expired</span>;

    const mins = Math.floor(timeLeft / 60000);
    const secs = Math.floor((timeLeft % 60000) / 1000);

    return (
        <span>{mins}:{String(secs).padStart(2, '0')}</span>
    );
};
