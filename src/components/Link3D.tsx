"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Link3DProps {
    href: string;
    children: React.ReactNode;
    className?: string;
}

export const Link3D = ({ href, children, className }: Link3DProps) => {
    return (
        <Link href={href} className={className}>
            <motion.span
                className="inline-block"
                whileHover={{
                    y: -2,
                    scale: 1.1,
                    textShadow: "0px 0px 8px rgb(255,255,255)"
                }}
                whileTap={{ scale: 0.9, y: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
                {children}
            </motion.span>
        </Link>
    );
};
