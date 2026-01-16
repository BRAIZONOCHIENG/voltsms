"use client";

import React from 'react';
import { usePaystackPayment } from 'react-paystack';
import { motion } from 'framer-motion';

interface PaystackTriggerProps {
    email: string;
    amountUSD: number;
    method: 'card' | 'mpesa';
    onSuccess: (reference: any) => void;
}

const PaystackTrigger: React.FC<PaystackTriggerProps> = ({ email, amountUSD, method, onSuccess }) => {
    const amountKES = Math.round(amountUSD * 130 * 100); // USD -> KES -> Cents
    const [loading, setLoading] = React.useState(false);

    // Ensure email is valid or fallback to avoid Paystack errors if state is empty
    const safeEmail = email || 'guest@example.com';

    const config = {
        reference: (new Date()).getTime().toString(),
        email: safeEmail,
        amount: amountKES, // Amount is in Kobo/Cents
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
        currency: 'KES',
        channels: method === 'mpesa' ? ['mobile_money'] : ['card'],
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
                // Small timeout to allow state to update before the heavier script load potentially blocks UI? 
                // Actually initializePayment is async internally but we can't await it easily.
                setTimeout(() => {
                    initializePayment({
                        onSuccess: (reference: any) => {
                            setLoading(false);
                            onSuccess(reference);
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
            {loading ? 'Securely Loading...' : `Confirm Deposit (${method === 'mpesa' ? 'M-Pesa' : 'Card'})`}
        </motion.button>
    );
};

export default PaystackTrigger;
