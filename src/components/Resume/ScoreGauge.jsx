import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const ScoreGauge = ({ score = 0, size = 180 }) => {
    const [displayScore, setDisplayScore] = useState(0);
    const radius = size * 0.4;
    const stroke = size * 0.08;
    const normalizedRadius = radius - stroke * 0.5;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (displayScore / 100) * circumference;

    useEffect(() => {
        const timer = setTimeout(() => {
            setDisplayScore(score);
        }, 500);
        return () => clearTimeout(timer);
    }, [score]);

    const getColor = (s) => {
        if (s >= 75) return '#10b981'; // Success
        if (s >= 50) return '#f59e0b'; // Warning
        return '#ef4444'; // Danger
    };

    return (
        <div className="relative flex flex-col items-center justify-center p-4">
            <svg
                height={size}
                width={size}
                className="transform -rotate-90 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            >
                {/* Background Circle */}
                <circle
                    stroke="rgba(255,255,255,0.05)"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={size / 2}
                    cy={size / 2}
                />
                {/* Progress Circle */}
                <motion.circle
                    stroke={getColor(displayScore)}
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset }}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={size / 2}
                    cy={size / 2}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-white">
                <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-4xl font-black italic tracking-tighter"
                >
                    {Math.round(displayScore)}
                </motion.span>
                <span className="text-[10px] uppercase tracking-widest font-bold opacity-50 mt-1">ATS Score</span>
            </div>

            {/* Glow Effect */}
            <div
                className="absolute w-full h-full rounded-full opacity-20 blur-2xl"
                style={{ backgroundColor: getColor(displayScore) }}
            ></div>
        </div>
    );
};

export default ScoreGauge;
