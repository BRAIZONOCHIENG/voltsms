"use client";

import React, { useEffect, useRef, useState } from 'react';

interface PayPalTriggerProps {
    amount: number;
    clientId: string;
    onSuccess: (orderID: string) => void;
    onError: (err: any) => void;
    getAccessToken: () => Promise<string | null>;
}

declare global {
    interface Window {
        paypal?: any;
    }
}

const PayPalTrigger: React.FC<PayPalTriggerProps> = ({ amount, clientId, onSuccess, onError, getAccessToken }) => {
    const paypalRef = useRef<HTMLDivElement>(null);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Load PayPal SDK manually
        const scriptId = "paypal-sdk-script";

        // 1. Check if already available globally
        if (window.paypal) {
            setLoaded(true);
            return;
        }

        // 2. Setup script if missing
        let script = document.getElementById(scriptId) as HTMLScriptElement;

        if (!script) {
            script = document.createElement("script");
            script.id = scriptId;
            script.src = `https://www.paypal.com/sdk/js?client-id=${clientId || "test"}&currency=USD`;
            script.async = true;
            document.body.appendChild(script);
        }

        // 3. Listen for load
        const handleLoad = () => setLoaded(true);
        const handleError = () => setError("Failed to load PayPal SDK");

        script.addEventListener('load', handleLoad);
        script.addEventListener('error', handleError);

        // 4. Fallback Polling (crucial if script already exists but window.paypal not ready)
        const interval = setInterval(() => {
            if (window.paypal) {
                setLoaded(true);
                clearInterval(interval);
            }
        }, 200);

        return () => {
            script.removeEventListener('load', handleLoad);
            script.removeEventListener('error', handleError);
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        if (loaded && window.paypal && paypalRef.current) {
            // Clear container to prevent duplicate buttons
            paypalRef.current.innerHTML = "";

            window.paypal.Buttons({
                fundingSource: "paypal",
                style: { layout: "vertical" },
                createOrder: async () => {
                    try {
                        const token = await getAccessToken();
                        if (!token) throw new Error("No token");
                        const res = await fetch('/api/deposit', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ amount: amount, method: 'paypal' })
                        });
                        const data = await res.json();
                        if (!data.id) throw new Error(data.detail || "Failed to create order");
                        return data.id;
                    } catch (err: any) {
                        console.error(err);
                        alert(`PayPal Init Error: ${err.message}`);
                        throw err;
                    }
                },
                onApprove: async (data: any, actions: any) => {
                    onSuccess(data.orderID);
                },
                onError: (err: any) => {
                    console.error("PayPal SDK Error:", err);
                    onError(err);
                }
            }).render(paypalRef.current);
        }
    }, [loaded, amount]); // Re-render if amount changes

    if (error) return <div className="text-red-500 text-sm">{error}</div>;

    return (
        <div className="relative z-0 w-full max-w-[500px] mx-auto py-2">
            {!loaded && <div className="text-stone-500 text-sm animate-pulse text-center">Loading...</div>}
            <div ref={paypalRef} className="paypal-button-container w-full" style={{ display: loaded ? 'block' : 'none' }} />
        </div>
    );
};

export default PayPalTrigger;
