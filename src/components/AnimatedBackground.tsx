"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export const AnimatedBackground = () => {
    const { scrollYProgress } = useScroll();

    // Transform colors based on scroll
    // Purple -> Pink -> Orange -> Yellow
    const color1 = useTransform(scrollYProgress, [0, 0.5, 1], ["#845ec2", "#ff6f91", "#f9f871"]);
    const color2 = useTransform(scrollYProgress, [0, 0.5, 1], ["#d65db1", "#ff9671", "#845ec2"]);
    const color3 = useTransform(scrollYProgress, [0, 0.5, 1], ["#ff9671", "#f9f871", "#d65db1"]);
    const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

    return (
        <motion.div
            style={{ scale: bgScale }}
            className="fixed inset-0 z-0 overflow-hidden bg-[#0f0c29]"
        >
            <motion.div
                style={{ backgroundColor: color1, willChange: 'transform' }}
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0],
                    opacity: [0.15, 0.3, 0.15],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px]"
            />
            <motion.div
                style={{ backgroundColor: color2, willChange: 'transform' }}
                animate={{
                    scale: [1, 1.5, 1],
                    x: [0, 100, 0],
                    y: [0, -50, 0],
                    opacity: [0.15, 0.3, 0.15],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px]"
            />
            <motion.div
                style={{ backgroundColor: color3, willChange: 'transform' }}
                animate={{
                    scale: [1, 1.3, 1],
                    x: [0, -100, 0],
                    opacity: [0.15, 0.3, 0.15],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute top-[40%] left-[30%] w-[400px] h-[400px] rounded-full blur-[90px]"
            />
        </motion.div>
    );
};
