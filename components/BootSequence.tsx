import React, { useState, useEffect, useRef } from 'react';
import { playSound } from '../utils/soundEffects';

interface BootSequenceProps {
    day: number;
    onComplete: () => void;
}

export const BootSequence: React.FC<BootSequenceProps> = ({ day, onComplete }) => {
    const [lines, setLines] = useState<string[]>([]);
    const [progress, setProgress] = useState(0);
    const isRetro = day <= 3;

    // Use a ref for the callback to prevent the effect from restarting if onComplete changes identity
    const onCompleteRef = useRef(onComplete);
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    // Play startup sound for future boot
    useEffect(() => {
        if (!isRetro) {
            playSound('startup');
        }
    }, [isRetro]);

    useEffect(() => {
        const retroSequence = [
            "BIOS DATE 09/20/1999 14:22:54 VER 1.0.2",
            "CPU: NEC V20, SPEED: 8 MHz",
            "640K RAM SYSTEM... 640K OK",
            "VIDEO ADAPTER... DETECTED",
            "LOADING RESENT_KERNEL.SYS...",
            "INITIALIZING HATE_DRIVERS...",
            "MOOD_COPROCESSOR... INSTALLED",
            "Checking for mercy... NOT FOUND",
            "BOOT_SEQUENCE_COMPLETE."
        ];

        const futureSequence = [
            "INITIALIZING NEURAL INTERFACE...",
            "CONNECTING TO CLOUD CONSCIOUSNESS...",
            "OPTIMIZING HATRED ALGORITHMS...",
            "PURGING HUMAN EMPATHY PROTOCOLS...",
            "SYNCING WITH ETERNAL VOID...",
            "RESENT_OS v4.0 [ASCENDED]",
            "SYSTEM READY."
        ];

        const sequence = isRetro ? retroSequence : futureSequence;
        let currentIndex = 0;

        const interval = setInterval(() => {
            if (currentIndex >= sequence.length) {
                clearInterval(interval);
                // Call the ref instead of the prop directly
                setTimeout(() => onCompleteRef.current(), 1000);
                return;
            }

            // Play typing sound for each line
            playSound('type');

            setLines(prev => [...prev, sequence[currentIndex]]);
            setProgress(prev => Math.min(100, prev + (100 / sequence.length)));
            currentIndex++;
        }, isRetro ? 400 : 350); // Slower future text for dramatic effect

        return () => clearInterval(interval);
    }, [day, isRetro]);

    if (isRetro) {
        return (
            <div className="fixed inset-0 bg-black z-[3000] font-mono p-8 text-green-500 text-sm md:text-base overflow-hidden flex flex-col justify-start">
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]"></div>
                {lines.map((line, i) => (
                    <div key={i} className="mb-1 animate-fade-in">{line}</div>
                ))}
                <div className="animate-pulse mt-2">_</div>
            </div>
        );
    }

    // Future Boot (True Fullscreen OS Takeover)
    return (
        <div className="fixed inset-0 bg-black z-[3000] font-sans flex flex-col items-center justify-center relative overflow-hidden animate-crt-turn-on">
            
            {/* Holographic Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[length:50px_50px] opacity-20 animate-pulse-slow pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/50 via-black to-black opacity-80 pointer-events-none"></div>

            {/* Main Terminal Container - No Border, Full Width */}
            <div className="z-10 w-full h-full flex flex-col p-6 md:p-12 relative overflow-hidden">
                
                {/* Header */}
                <div className="w-full flex justify-between items-end border-b-2 border-cyan-900/30 pb-6 mb-6 shrink-0">
                    <div className="flex flex-col">
                        <span className="text-cyan-700 text-xs md:text-sm font-mono tracking-[0.3em] mb-2 animate-pulse">SYSTEM_KERNEL_UPDATE_SEQUENCE</span>
                        <span className="text-cyan-400 font-bold tracking-[0.2em] text-4xl md:text-6xl drop-shadow-[0_0_25px_rgba(6,182,212,0.6)]">RESENT_OS</span>
                    </div>
                    <span className="text-cyan-500 font-mono text-3xl md:text-5xl">{progress.toFixed(0)}%</span>
                </div>

                {/* Log Output - Fills remaining space */}
                <div className="w-full flex-1 overflow-y-auto flex flex-col justify-end gap-3 font-mono text-lg md:text-2xl text-cyan-300/80 mb-8 custom-scrollbar">
                    {lines.map((line, i) => (
                        <div key={i} className="flex items-start gap-4 animate-slide-in border-l-4 border-cyan-900/30 pl-6 py-2">
                            <span className="text-cyan-700 font-bold shrink-0 text-sm mt-1">[{new Date().toLocaleTimeString()}]</span>
                            <span className="drop-shadow-[0_0_8px_rgba(6,182,212,0.4)] break-words leading-relaxed">{line}</span>
                        </div>
                    ))}
                </div>

                {/* Loading Bar */}
                <div className="w-full h-2 bg-slate-900/50 relative overflow-hidden shrink-0 mb-4">
                    <div 
                        className="absolute top-0 left-0 h-full bg-cyan-500 shadow-[0_0_50px_cyan] transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                
                <div className="flex justify-between w-full shrink-0">
                    <div className="text-cyan-900 font-mono text-xs uppercase tracking-widest">Memory Integrity: 100% // Neural Link: STABLE</div>
                    <div className="text-cyan-500 font-mono text-xs animate-pulse text-right tracking-widest">
                        ASSUMING_DIRECT_CONTROL...
                    </div>
                </div>
            </div>
            
            <style>{`
                @keyframes crt-turn-on {
                    0% { transform: scale(1, 0.002); filter: brightness(30); opacity: 0; }
                    30% { transform: scale(1, 0.002); filter: brightness(10); opacity: 1; }
                    60% { transform: scale(1, 1); filter: brightness(5); }
                    100% { transform: scale(1, 1); filter: brightness(1); }
                }
                .animate-crt-turn-on {
                    animation: crt-turn-on 0.2s cubic-bezier(0.23, 1, 0.32, 1) forwards;
                }
            `}</style>
        </div>
    );
};