
"use client";

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { FcGoogle } from 'react-icons/fc';

export default function GoogleSignInButton() {
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard`,
                },
            });

            if (error) {
                console.error('Google Login Error:', error.message);
                alert('Failed to login with Google: ' + error.message);
            }
        } catch (error) {
            console.error('Unexpected Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white text-black py-3 rounded-xl font-bold text-lg hover:bg-stone-200 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3"
            type="button"
        >
            {loading ? (
                <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></span>
            ) : (
                <FcGoogle className="text-2xl" />
            )}
            Sign in with Google
        </button>
    );
}
