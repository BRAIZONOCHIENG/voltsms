"use client";

import React from 'react';
import { usePaystackPayment } from 'react-paystack';
import { motion } from 'framer-motion';

interface PaystackTriggerProps {
    email: string;
    amountUSD: number;
    method: 'card' | 'mpesa';
    publicKey: string;
    userToken: string;
    onSuccess: (reference: any) => void;
}

const PaystackTrigger: React.FC<PaystackTriggerProps> = ({ email, amountUSD, method, publicKey, userToken, onSuccess }) => {
    // We must charge in KES because the Paystack merchant account is not enabled for USD.
    const amountKESCents = Math.round(amountUSD * 130 * 100); // USD -> KES -> Cents
    const [loading, setLoading] = React.useState(false);

    // Ensure email is valid or fallback to avoid Paystack errors if state is empty
    const safeEmail = email || 'guest@example.com';

    const config = {
        reference: (new Date()).getTime().toString(),
        email: safeEmail,
        amount: amountKESCents, // Amount is in KES Cents
        publicKey: publicKey,
        currency: 'KES',
        channels: ['card'], // Default to card only to prevent scaring global users with local payment methods
        metadata: {
            custom_fields: [
                {
                    display_name: "Customer Email",
                    variable_name: "customer_email",
                    value: safeEmail
                }
            ]
        }
    };

    const initializePayment = usePaystackPayment(config);

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
                setLoading(true);
                setTimeout(() => {
                    initializePayment({
                        onSuccess: async (reference: any) => {
                            try {
                                const res = await fetch('/api/payment/verify', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${userToken}`
                                    },
                                    body: JSON.stringify({
                                        type: 'paystack',
                                        reference: reference.reference || reference.transaction,
                                        amount: amountUSD
                                    })
                                });
                                
                                if (!res.ok) {
                                    throw new Error("Failed to verify payment on backend");
                                }
                                
                                onSuccess(reference);
                            } catch (err) {
                                console.error(err);
                                alert("Payment verification failed! Please contact support.");
                            } finally {
                                setLoading(false);
                            }
                        },
                        onClose: () => {
                            setLoading(false);
                            alert("Payment cancelled");
                        }
                    });
                }, 100);
            }}
            disabled={loading}
            className="w-full py-4 mt-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-lg shadow-lg hover:shadow-purple-500/25 transition-all text-white disabled:opacity-75 disabled:cursor-not-allowed"
        >
            {loading ? 'Securely Loading...' : `Confirm Deposit`}
        </motion.button>
    );
};

export default PaystackTrigger;
