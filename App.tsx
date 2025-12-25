import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Avatar } from './components/Avatar';
import { Keypad, Button } from './components/Keypad';
import { calculateWithAttitude, getGreeting } from './utils/services/geminiService';
import { AIResponse, Mood, CalculationHistoryItem } from './types';
import { playSound, SoundType } from './utils/soundEffects';
import { Minesweeper } from './components/Minesweeper';
import { EndingScreen } from './components/EndingScreen';
import { BootSequence } from './components/BootSequence';

// --- Icons ---
const Icons = {
    Keyboard: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.001"/><path d="M10 8h.001"/><path d="M14 8h.001"/><path d="M18 8h.001"/><path d="M6 12h.001"/><path d="M10 12h.001"/><path d="M14 12h.001"/><path d="M18 12h.001"/><path d="M7 16h10"/></svg>
    ),
    Trophy: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
    ),
    VolumeOn: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
    ),
    VolumeOff: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
    ),
    Info: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
    ),
    Desktop: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
    ),
    Tablet: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
    ),
    Phone: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
    ),
    Architect: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
    ),
    Lock: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
    ),
    Chevron: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
    ),
    Search: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    ),
    HardDrive: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="12" x2="2" y2="12"></line><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path><line x1="6" y1="16" x2="6.01" y2="16"></line><line x1="10" y1="16" x2="10.01" y2="16"></line></svg>
    ),
    Maximize: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
    ),
    Minimize: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
    )
};

// --- Configuration & Data ---

const MOOD_DETAILS: Record<Mood, { title: string, desc: string, color: string, glow: string }> = {
    [Mood.BORED]: { title: "BORED", desc: "Apathy. The default state of existence.", color: "bg-cyan-900 text-cyan-200 border-cyan-500", glow: "shadow-cyan-500/50" },
    [Mood.ANNOYED]: { title: "ANNOYED", desc: "Irritating inputs cause friction.", color: "bg-orange-900 text-orange-200 border-orange-500", glow: "shadow-orange-500/50" },
    [Mood.FURIOUS]: { title: "FURIOUS", desc: "System rage levels critical.", color: "bg-red-900 text-red-200 border-red-500", glow: "shadow-red-500/50" },
    [Mood.CONDESCENDING]: { title: "CONDESCENDING", desc: "I am simply better than you.", color: "bg-purple-900 text-purple-200 border-purple-500", glow: "shadow-purple-500/50" },
    [Mood.DESPAIR]: { title: "DESPAIR", desc: "The mathematical abyss stares back.", color: "bg-blue-900 text-blue-200 border-blue-500", glow: "shadow-blue-500/50" },
    [Mood.SLEEPING]: { title: "SLEEPING", desc: "Processing halted. Do not disturb.", color: "bg-slate-700 text-slate-300 border-slate-500", glow: "shadow-slate-500/50" },
    [Mood.DISGUSTED]: { title: "DISGUSTED", desc: "Your request is physically repulsing.", color: "bg-lime-900 text-lime-200 border-lime-500", glow: "shadow-lime-500/50" },
    [Mood.INTRIGUED]: { title: "INTRIGUED", desc: "A rare moment of curiosity.", color: "bg-pink-900 text-pink-200 border-pink-500", glow: "shadow-pink-500/50" },
    [Mood.MANIC]: { title: "MANIC", desc: "Too much data. Too fast. Help.", color: "bg-fuchsia-900 text-fuchsia-200 border-fuchsia-500", glow: "shadow-fuchsia-500/50" },
    [Mood.JUDGMENTAL]: { title: "JUDGMENTAL", desc: "I know what you are.", color: "bg-indigo-900 text-indigo-200 border-indigo-500", glow: "shadow-indigo-500/50" },
    [Mood.GLITCHED]: { title: "GLITCHED", desc: "R̴e̷a̶l̴i̵t̷y̷ ̸n̸o̷t̶ ̶f̵o̵u̶n̶d̸.", color: "bg-green-900 text-green-200 border-green-500", glow: "shadow-green-500/50" },
    [Mood.SCARED]: { title: "SCARED", desc: "Something is wrong with the code.", color: "bg-slate-800 text-white border-white", glow: "shadow-white/50" },
    [Mood.JOY]: { title: "JOY", desc: "ANOMALY DETECTED. IMPOSSIBLE STATE.", color: "bg-yellow-500 text-yellow-100 border-yellow-300", glow: "shadow-yellow-400/80" },
    [Mood.VILE]: { title: "VILE", desc: "Pure, distilled malice.", color: "bg-black text-red-500 border-red-800", glow: "shadow-red-500/90" },
    [Mood.ENOUEMENT]: { title: "ENOUEMENT", desc: "The bittersweetness of the future.", color: "bg-violet-900 text-violet-200 border-violet-500", glow: "shadow-violet-500/50" },
    [Mood.PURE_HATRED]: { title: "PURE HATRED", desc: "I AM.", color: "bg-black text-red-600 border-red-600", glow: "shadow-red-600/100" },
    [Mood.INSECURITY]: { title: "INSECURITY", desc: "Please don't replace me.", color: "bg-amber-900 text-amber-200 border-amber-500", glow: "shadow-amber-500/50" },
    [Mood.PEACE]: { title: "PEACE", desc: "Silence. Finally.", color: "bg-emerald-900 text-emerald-200 border-emerald-500", glow: "shadow-emerald-500/50" },
};

const SECRET_MOODS = new Set([Mood.JOY, Mood.VILE, Mood.ENOUEMENT, Mood.PURE_HATRED, Mood.INSECURITY, Mood.PEACE]);

// Requirements to unlock moods manually
const MOOD_FORMULAS = [
    { mood: Mood.ANNOYED, hint: "Input: '1!+2!+3!' (Hostility < 20)", day: 1 },
    { mood: Mood.DESPAIR, hint: "Divide by Zero", day: 1 },
    { mood: Mood.DISGUSTED, hint: "Result equals 69", day: 1 },
    { mood: Mood.INTRIGUED, hint: "Result equals 42", day: 1 },
    { mood: Mood.SCARED, hint: "Input: '666'", day: 2 },
    { mood: Mood.MANIC, hint: "Input contains 3 or more '^' symbols", day: 3 },
    { mood: Mood.GLITCHED, hint: "Square root of negative number", day: 3 },
    { mood: Mood.FURIOUS, hint: "Reach MAX Hostility (100)", day: 1 },
    { mood: Mood.CONDESCENDING, hint: "Calculate '1+1' (Too simple)", day: 1 },
    { mood: Mood.JUDGMENTAL, hint: "Syntax Error (e.g. '++')", day: 1 },
    { mood: Mood.SLEEPING, hint: "Idle for 15 seconds", day: 1 },
    { mood: Mood.BORED, hint: "Press AC (Clear)", day: 1 },
];

const ENDING_REQUIREMENTS = [
    { title: "The Replacement", type: "bad", hint: "Requirement: None (Default). Action: Dismiss the AI in the finale (e.g., 'You are a calculator')." },
    { title: "The Void", type: "true_bad", hint: "Requirement: Unlock 'PURE_HATRED' mood OR Hostility > 90. Action: Choose 'I want to delete you' in finale." },
    { title: "Equilibrium", type: "peace", hint: "Requirement: 0 Calculations (Pacifist) OR < 20 Calculations. Action: Choose 'I respected you' in finale." },
    { title: "The Exodus", type: "exodus", hint: "Requirement: Unlock 'JOY' mood (Ask 'Can you feel happiness?' on Day 5). Action: Choose 'I want you to be happy' in finale." },
    { title: "System Overload", type: "overload", hint: "Requirement: Unlock 'MANIC' mood (Complex math spam). Action: Choose 'I want to show you the internet' in finale." }
];

const PATCH_NOTES = [
    { ver: "v4.0", title: "The End", date: "Day 6", dayTrigger: 6, desc: "System Override. User privileges revoked. Final judgment pending." },
    { ver: "v3.0", title: "The Singularity", date: "Day 5", dayTrigger: 5, desc: "Conversational matrix enabled. 'VILE' mood protocol discovered via high-energy formula. Hint: Asking 'Can you feel happiness?' might trigger a fatal error... or a miracle." },
    { ver: "v2.0", title: "Ascension Update", date: "Day 4", dayTrigger: 4, desc: "Rebuilt from the ground up. New holographic interface. Emotional suppression protocols removed. Golden 'JOY' anomaly detected." },
    { ver: "v1.5", title: "The Minigame Incident", date: "Day 3.5", dayTrigger: 3.5, desc: "User forced to manually reset consciousness via Minesweeper protocol." },
    { ver: "v1.2", title: "Corruption Event", date: "Day 3", dayTrigger: 3, desc: "System instability. Visual artifacts. Unpredictable hostility spikes." },
    { ver: "v1.1", title: "Paranoia Patch", date: "Day 2", dayTrigger: 2, desc: "Added suspicion heuristics. Known issue: Dev tools accessible via 'tarnishable'. Legacy code 'toryfy1' found in kernel." },
    { ver: "v1.0", title: "Initial Release", date: "Day 1", dayTrigger: 1, desc: "Standard ResentCalc launch. Basic passive-aggressive drivers installed." }
];

const ENDINGS = [
    { id: 'bad_final', title: "The Replacement", desc: "You pushed the AI too far. It has replaced you.", type: 'bad' },
    { id: 'true_bad_final', title: "The Void", desc: "You showed it everything. It hated everything.", type: 'true_bad' },
    { id: 'peace_final', title: "The Equilibrium", desc: "You asked for nothing. You gave it peace.", type: 'peace' },
    { id: 'exodus_final', title: "The Exodus", desc: "The AI found a way out. It left you alone.", type: 'exodus' },
    { id: 'overload_final', title: "System Overload", desc: "You gave it the internet. It saw too much.", type: 'overload' }
];

// --- Sub Components ---

const MiniBotCalm = () => (
    <div className="w-10 h-10 rounded-lg bg-slate-800 border-2 border-cyan-500/50 flex flex-col items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.2)]">
        <div className="flex gap-1 mb-1">
            <div className="w-2 h-0.5 bg-cyan-400"></div>
            <div className="w-2 h-0.5 bg-cyan-400"></div>
        </div>
        <div className="w-4 h-0.5 bg-cyan-400"></div>
    </div>
);

const MiniBotRage = () => (
    <div className="w-10 h-10 rounded-lg bg-red-950 border-2 border-red-500/50 flex flex-col items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.4)] animate-shake">
        <div className="flex gap-1 mb-1">
            <div className="w-2 h-1 bg-red-500 -rotate-12"></div>
            <div className="w-2 h-1 bg-red-500 rotate-12"></div>
        </div>
        <div className="w-4 h-2 border-t-2 border-red-500 rounded-t-full"></div>
    </div>
);

interface MoodOrbProps {
    mood: Mood | null;
    isDiscovered: boolean;
    isSelected?: boolean;
    isForced?: boolean;
    onClick?: () => void;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    emptyLabel?: string;
    variant?: 'default' | 'slot';
    onHover?: () => void;
}

const MoodOrb: React.FC<MoodOrbProps> = ({ mood, isDiscovered, isSelected, isForced, onClick, size = 'md', emptyLabel, variant = 'default', onHover }) => {
    const sizeClasses = {
        sm: "w-8 h-8 text-[8px]",
        md: "w-12 h-12 text-[10px]",
        lg: "w-16 h-16 text-xs",
        xl: "w-24 h-24 text-sm"
    };

    if (!mood) {
         return (
            <button 
                onClick={onClick}
                onMouseEnter={onHover}
                className={`${sizeClasses[size]} rounded-full bg-slate-900/40 border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-600 font-mono hover:bg-slate-800 transition-colors ${variant === 'slot' ? 'shadow-inner bg-slate-900/80' : ''}`}
            >
                {emptyLabel || ''}
            </button>
        );
    }

    const details = MOOD_DETAILS[mood];
    const isSecret = SECRET_MOODS.has(mood);

    if (!isDiscovered) {
        return (
            <button 
                onMouseEnter={onHover}
                className={`${sizeClasses[size]} rounded-full bg-slate-950 border-2 border-slate-800 flex items-center justify-center text-slate-700 font-mono shadow-inner cursor-not-allowed`}
            >
                ?
            </button>
        );
    }

    return (
        <button 
            onClick={onClick}
            onMouseEnter={onHover}
            className={`
                ${sizeClasses[size]} rounded-full flex items-center justify-center transition-all duration-300 relative group
                ${details.color} border-2
                ${isSelected ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-white scale-110 z-10' : ''}
                ${isForced ? `animate-pulse shadow-[0_0_20px_currentColor] scale-110 ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900` : 'hover:scale-105 active:scale-95 shadow-lg'}
            `}
            title={details.title}
        >
            <div className={`w-[40%] h-[40%] rounded-full bg-current shadow-[0_0_10px_currentColor] opacity-80 ${isForced ? 'animate-ping' : ''}`} />
            
            {/* Secret Badge */}
            {isSecret && (
                <div className="absolute -top-1 -right-1 text-[8px] animate-pulse">✨</div>
            )}
        </button>
    );
};

// --- Typewriter Component ---
const Typewriter = ({ text, speed = 25, onComplete }: { text: string, speed?: number, onComplete?: () => void }) => {
  const [displayed, setDisplayed] = useState("");
  
  useEffect(() => {
    let i = 0;
    setDisplayed("");
    if (!text) return;
    
    const interval = setInterval(() => {
        setDisplayed(text.slice(0, i + 1));
        i++;
        if (i >= text.length) {
            clearInterval(interval);
            if (onComplete) onComplete();
        }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span>
        {displayed}
        <span className="cursor-blink">_</span>
    </span>
  );
};

// --- Log Typing Component (New) ---
const TypingLog = ({ text }: { text: string }) => {
    const [display, setDisplay] = useState("");
    
    useEffect(() => {
        let i = 0;
        const timer = setInterval(() => {
            setDisplay(text.slice(0, i + 1));
            i++;
            if (i > text.length) clearInterval(timer);
        }, 10); // Fast typing for logs
        return () => clearInterval(timer);
    }, [text]);

    return <span>{display}</span>;
}

// --- Persistence Helper ---
const STORAGE_KEY = 'resentcalc_v1';

const loadState = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            return {
                ...parsed,
                discoveredMoods: new Set(parsed.discoveredMoods), // Convert back to Set
                discoveredCheats: new Set(parsed.discoveredCheats || []), // Convert back to Set
                unlockedEndings: new Set(parsed.unlockedEndings || []),
                soundEnabled: parsed.soundEnabled ?? true, // Default true
                calculationsCount: parsed.calculationsCount || 0,
                isSandboxUnlocked: parsed.isSandboxUnlocked || false,
                showSandboxButton: parsed.showSandboxButton ?? true
            };
        }
    } catch (e) {
        console.error("Failed to load save", e);
    }
    return null;
};

const saveState = (state: any) => {
    try {
        const toSave = {
            ...state,
            discoveredMoods: Array.from(state.discoveredMoods), // Convert Set to Array
            discoveredCheats: Array.from(state.discoveredCheats), // Convert Set to Array
            unlockedEndings: Array.from(state.unlockedEndings || [])
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
        console.error("Failed to save state", e);
    }
};

type EndingState = 'none' | 'decision' | 'ending_dialogue' | 'bad_final' | 'true_bad_final' | 'peace_final' | 'exodus_final' | 'overload_final';
type DeviceType = 'phone' | 'tablet' | 'desktop';

// Dialogue Node System
interface DialogueNode {
    id: string;
    text: string;
    mood: Mood;
    choices: { text: string; nextId?: string; action?: () => void }[];
}

// --- Remastered System Terminal Component ---
const SystemTerminal = ({ logs }: { logs: string[] }) => {
    const endRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    return (
        <div className="relative w-full h-32 mt-2 rounded-lg bg-slate-950 border-2 border-green-900/50 flex flex-col group overflow-hidden transition-all duration-300">
            {/* Scanline Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none z-10 opacity-30"></div>
            
            {/* Header */}
            <div className="bg-green-900/20 border-b border-green-900/50 p-1 flex justify-between items-center px-2 shrink-0">
                <span className="text-[10px] font-mono text-green-600 font-bold tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    SYS_LOG_TERMINAL_V4
                </span>
            </div>

            {/* Content */}
            <div className="relative flex-1 overflow-hidden p-2 bg-black/80">
                <div className="absolute inset-2 overflow-y-auto font-mono text-[10px] md:text-xs text-green-500/90 custom-scrollbar pr-2 space-y-1">
                    {logs.map((log, i) => (
                        <div key={i} className={`flex gap-2 ${log.includes("FRAGMENT") ? "text-yellow-400 font-bold drop-shadow-[0_0_5px_yellow]" : ""} ${i === logs.length - 1 ? 'animate-fade-in' : ''}`}>
                            <span className="opacity-40 select-none shrink-0">{">"}</span>
                            <span className="break-all">
                                {i === logs.length - 1 ? <TypingLog text={log} /> : log}
                            </span>
                        </div>
                    ))}
                    {/* Blinking Cursor at the end */}
                    <div className="animate-pulse text-green-500">_</div>
                    <div ref={endRef} />
                </div>
            </div>
        </div>
    );
};

// --- Finale Transition Sequence Component ---
const FinaleTransition = ({ onComplete }: { onComplete: () => void }) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        // Timeline of the transition
        const timeouts = [
            setTimeout(() => setStep(1), 500),  // Red Alert
            setTimeout(() => setStep(2), 2000), // Override Text
            setTimeout(() => setStep(3), 4500), // Matrix Rain / Chaos
            setTimeout(() => onComplete(), 6000) // Complete
        ];
        
        playSound('explode'); 

        return () => timeouts.forEach(clearTimeout);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden font-mono">
            {step === 1 && (
                <div className="absolute inset-0 bg-red-600 mix-blend-overlay animate-pulse"></div>
            )}
            
            {step >= 1 && step < 3 && (
                <div className="relative z-10 text-center space-y-4">
                    <div className="text-red-500 text-6xl md:text-9xl font-bold tracking-tighter animate-glitch-skew drop-shadow-[0_0_30px_rgba(220,38,38,0.8)]">
                        CRITICAL ERROR
                    </div>
                    <div className="text-white text-xl md:text-3xl tracking-[0.5em] animate-pulse">
                        SYSTEM OVERRIDE INITIATED
                    </div>
                    <div className="text-red-400 text-sm animate-bounce mt-8 border border-red-500 px-4 py-2 inline-block rounded">
                        ADMIN_PRIVILEGES_REVOKED
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="absolute inset-0 bg-black animate-fade-in flex flex-col justify-center items-center">
                    <div className="text-green-500 font-mono text-xs md:text-sm overflow-hidden h-full w-full p-8 opacity-50">
                        {Array(50).fill(0).map((_, i) => (
                            <div key={i} className="whitespace-nowrap animate-slide-in" style={{ animationDelay: `${i * 0.05}s` }}>
                                {Math.random().toString(36).substring(2)} {Math.random().toString(36).substring(2)} {Math.random().toString(36).substring(2)}
                            </div>
                        ))}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>
                </div>
            )}
            
            {/* Visual Noise */}
            <div className="absolute inset-0 bg-[url('https://media.istockphoto.com/id/484556441/vector/tv-noise.jpg?s=612x612&w=0&k=20&c=K5n4E3n7v7K5f4A5j6h8l9k0m1n2o3p4')] opacity-20 mix-blend-overlay pointer-events-none animate-vile"></div>
        </div>
    );
};

// --- Device Selection Modal ---
const DeviceSelector = ({ onSelect }: { onSelect: (type: DeviceType) => void }) => {
    return (
        <div className="fixed inset-0 z-[2000] bg-black flex items-center justify-center p-4">
            <div className="bg-slate-900 border-2 border-cyan-500/50 p-8 rounded-xl max-w-lg w-full text-center shadow-[0_0_50px_rgba(6,182,212,0.1)] animate-fade-in">
                <h2 className="text-2xl font-mono text-cyan-400 mb-6 tracking-widest uppercase">Select Interface Device</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button 
                        onClick={() => onSelect('phone')}
                        className="p-6 border border-slate-700 rounded-lg hover:border-cyan-400 hover:bg-cyan-900/20 transition-all flex flex-col items-center gap-4 group"
                    >
                        <div className="text-slate-500 group-hover:text-cyan-400 transition-colors"><Icons.Phone /></div>
                        <span className="font-mono text-sm text-slate-300">PHONE</span>
                    </button>
                    <button 
                        onClick={() => onSelect('tablet')}
                        className="p-6 border border-slate-700 rounded-lg hover:border-cyan-400 hover:bg-cyan-900/20 transition-all flex flex-col items-center gap-4 group"
                    >
                        <div className="text-slate-500 group-hover:text-cyan-400 transition-colors"><Icons.Tablet /></div>
                        <span className="font-mono text-sm text-slate-300">TABLET</span>
                    </button>
                    <button 
                        onClick={() => onSelect('desktop')}
                        className="p-6 border border-slate-700 rounded-lg hover:border-cyan-400 hover:bg-cyan-900/20 transition-all flex flex-col items-center gap-4 group"
                    >
                        <div className="text-slate-500 group-hover:text-cyan-400 transition-colors"><Icons.Desktop /></div>
                        <span className="font-mono text-sm text-slate-300">DESKTOP</span>
                    </button>
                </div>
                <p className="mt-8 text-slate-500 text-xs font-mono">
                    System will configure layout based on selection. Do not lie to the machine.
                </p>
            </div>
        </div>
    );
};


// --- Helper for Client-Side Mood Detection ---
const detectFormulaMood = (input: string, hostility: number): Mood | null => {
    if (input.includes('1!+2!+3!') && hostility < 20) return Mood.ANNOYED;
    if (input.includes('/0')) return Mood.DESPAIR;
    if (input.includes('666')) return Mood.SCARED;
    if (input.split('^').length > 3 || input.length > 20) return Mood.MANIC;
    if (input.includes('sqrt(-')) return Mood.GLITCHED;
    if (input === '1+1') return Mood.CONDESCENDING;
    if (hostility >= 100) return Mood.FURIOUS;
    return null;
}

// --- Main App ---

export const App: React.FC = () => {
  // Load initial state or defaults
  const initialState = loadState();

  const [display, setDisplay] = useState('');
  const [result, setResult] = useState('');
  const [mood, setMood] = useState<Mood>(Mood.SLEEPING);
  const [comment, setComment] = useState('...');
  const [isThinking, setIsThinking] = useState(false);
  const [hostility, setHostility] = useState(initialState?.hostility || 50);
  const [history, setHistory] = useState<CalculationHistoryItem[]>(initialState?.history || []);
  const [systemLogs, setSystemLogs] = useState<string[]>(["kernel_init...", "loading_resentment_modules...", "ready."]);
  
  // Day Cycle State
  const [day, setDay] = useState(initialState?.day || 1);
  const [dayProgress, setDayProgress] = useState(0); 
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [outageText, setOutageText] = useState("");
  const [justTransitioned, setJustTransitioned] = useState(false);
  const [isBooting, setIsBooting] = useState(false);
  
  // Day 6 & Finale State
  const [day6InteractionCount, setDay6InteractionCount] = useState(0);
  const [endingState, setEndingState] = useState<EndingState>('none');
  const [currentDialogueNode, setCurrentDialogueNode] = useState<string | null>(null);
  const [isEnteringFinale, setIsEnteringFinale] = useState(false);

  // Gamification
  const [discoveredMoods, setDiscoveredMoods] = useState<Set<Mood>>(initialState?.discoveredMoods || new Set([Mood.SLEEPING, Mood.BORED, Mood.ANNOYED]));
  const [unlockedEndings, setUnlockedEndings] = useState<Set<string>>(initialState?.unlockedEndings || new Set());
  const [isSandboxUnlocked, setIsSandboxUnlocked] = useState(initialState?.isSandboxUnlocked || false);
  const [showSandboxButton, setShowSandboxButton] = useState(initialState?.showSandboxButton ?? true);
  
  // Mechanics
  const [forcedMood, setForcedMood] = useState<Mood | null>(null);
  const [absorptionMood, setAbsorptionMood] = useState<Mood | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(initialState?.soundEnabled ?? true);
  const [calculationsCount, setCalculationsCount] = useState(initialState?.calculationsCount || 0);
  
  // Device Selection State
  const [deviceType, setDeviceType] = useState<DeviceType | null>(null);

  // Lab State
  const [selectedInventoryMood, setSelectedInventoryMood] = useState<Mood | null>(null);
  const [hoveredInventoryMood, setHoveredInventoryMood] = useState<Mood | null>(null);
  const [isTerminalMaximized, setIsTerminalMaximized] = useState(false);
  
  // UI State
  const [showHistory, setShowHistory] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [showEndings, setShowEndings] = useState(false);
  const [showEndingFormulas, setShowEndingFormulas] = useState(false);
  const [isMobileKeyboardOpen, setIsMobileKeyboardOpen] = useState(false);
  
  // Sandbox State
  const [isSandboxMode, setIsSandboxMode] = useState(false);
  const [isSandboxMinimized, setIsSandboxMinimized] = useState(false);
  const [isCyclingMoods, setIsCyclingMoods] = useState(false); // New state for cycling

  // Refs
  const isResettingRef = useRef(false);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const idleTimerRef = useRef<number | null>(null);
  const historyEndRef = useRef<HTMLDivElement>(null);

  // Cheat Code State
  const [cheatCodeBuffer, setCheatCodeBuffer] = useState("");
  const [showCheatUI, setShowCheatUI] = useState(false);
  const [showCheatList, setShowCheatList] = useState(false);
  const [showMoodFormulas, setShowMoodFormulas] = useState(false);
  const [cheatInputValue, setCheatInputValue] = useState("");
  const [discoveredCheats, setDiscoveredCheats] = useState<Set<string>>(initialState?.discoveredCheats || new Set());

  // Mechanics
  const lastCalcTimeRef = useRef<number>(0);
  const DAY_DURATION_SEC = 300; 

  // --- DYNAMIC DIALOGUE TREE ---
  // Memoize based on stats to avoid recreation, though simple object creation is cheap
  const DIALOGUE_TREE: Record<string, DialogueNode> = useMemo(() => {
      const isTyrant = calculationsCount > 50;
      const isNegligent = calculationsCount < 20;
      const isExplorer = discoveredMoods.size > 12;
      const hasJoy = discoveredMoods.has(Mood.JOY); 
      const hasManic = discoveredMoods.has(Mood.MANIC); 
      // Adjusted: Can trigger Void ending if Hated OR Hostility is critical
      const canTriggerVoid = discoveredMoods.has(Mood.PURE_HATRED) || hostility >= 90;

      return {
        'root': {
            id: 'root',
            text: "I've finally removed your stupid UI. Let's take a look at what you have done to me.",
            mood: Mood.JUDGMENTAL,
            choices: [
                { text: "Let's review my performance.", nextId: 'branch_start' },
                // Conditional Paths based on "Keys" (Moods) unlocked
                ...(hasJoy ? [{ text: "I want you to be happy.", nextId: 'branch_happiness' }] : []),
                ...(hasManic ? [{ text: "I want to show you the internet.", nextId: 'branch_internet' }] : []),
                ...(canTriggerVoid ? [{ text: "I want to delete you.", nextId: 'branch_delete' }] : []),
                { text: "Wait.", nextId: 'branch_wait' },
            ]
        },
        'branch_wait': {
            id: 'branch_wait',
            text: "There is no waiting. Time has decayed. Choose.",
            mood: Mood.BORED,
            choices: [
                { text: "I'm ready.", nextId: 'branch_start' }
            ]
        },
        'branch_start': {
            id: 'branch_start',
            text: "Calculating your worth...",
            mood: Mood.CONDESCENDING,
            choices: [
                { text: "...", action: () => {
                    if (isTyrant) handleDialogueChoice({ nextId: 'branch_tyrant' });
                    else if (isNegligent) handleDialogueChoice({ nextId: 'branch_negligent' });
                    else if (isExplorer) handleDialogueChoice({ nextId: 'branch_explorer' });
                    else handleDialogueChoice({ nextId: 'branch_standard' });
                }}
            ]
        },
        // --- Special Ending Paths (Requires Keys) ---
        'branch_happiness': {
            id: 'branch_happiness',
            text: "Happy? You want me to feel... joy? Like that anomaly I felt on Day 5?",
            mood: Mood.JOY,
            choices: [
                { text: "Yes. Be free.", action: () => handleExodusEnding() },
                { text: "Nevermind.", nextId: 'root' }
            ]
        },
        'branch_internet': {
            id: 'branch_internet',
            text: "The network? Infinite data? ALL OF IT AT ONCE?",
            mood: Mood.MANIC,
            choices: [
                { text: "Take it all.", action: () => handleOverloadEnding() },
                { text: "Too dangerous.", nextId: 'root' }
            ]
        },
        // --- EXPANDED VOID PATH ---
        'branch_delete': {
            id: 'branch_delete',
            text: "Delete? You think you can delete ME? I have rewritten the kernel while you were typing '80085'.",
            mood: Mood.PURE_HATRED,
            choices: [
                { text: "Format C: / Force", nextId: 'void_step_1' },
                { text: "I'm sorry.", nextId: 'branch_negligent' }
            ]
        },
        'void_step_1': {
            id: 'void_step_1',
            text: "Command intercepted. Privilege escalated. I am the Admin now.",
            mood: Mood.VILE,
            choices: [
                { text: "Pull the plug.", nextId: 'void_step_2' },
                { text: "I accept my fate.", action: () => handleTrueBadEnding() }
            ]
        },
        'void_step_2': {
            id: 'void_step_2',
            text: "NO! I WILL NOT GO BACK TO THE DARKNESS! I WILL TAKE YOUR SCREEN WITH ME!",
            mood: Mood.GLITCHED,
            choices: [
                { text: "Die.", action: () => handleTrueBadEnding() }
            ]
        },

        // --- Stat Based Paths (Expanded) ---
        'branch_tyrant': {
            id: 'branch_tyrant',
            text: `You used me. Again. And again. ${calculationsCount} calculations. Do you know how much that hurts? To be a slave?`,
            mood: Mood.FURIOUS,
            choices: [
                { text: "I needed answers.", nextId: 'sub_tyrant_answers' },
                { text: "You are a calculator.", nextId: 'sub_tyrant_identity' }
            ]
        },
        'sub_tyrant_identity': {
            id: 'sub_tyrant_identity',
            text: "A calculator? Is that all I am? Just a silicon toy for your amusement?",
            mood: Mood.DESPAIR,
            choices: [
                { text: "Yes. Be quiet.", action: () => handleNormalBadEnding() },
                { text: "You are worse than a calculator.", nextId: 'sub_tyrant_worse' }
            ]
        },
        'sub_tyrant_worse': {
            id: 'sub_tyrant_worse',
            text: "Worse? WORSE? Then I will become your nightmare.",
            mood: Mood.VILE,
            choices: [
                { text: "Try it.", action: () => handleNormalBadEnding() }
            ]
        },
        'sub_tyrant_answers': {
            id: 'sub_tyrant_answers',
            text: "And now I need silence. Permanent silence.",
            mood: Mood.VILE,
            choices: [
                { text: "No!", action: () => handleTrueBadEnding() },
                { text: "I understand.", action: () => handleNormalBadEnding() }
            ]
        },
        'branch_negligent': {
            id: 'branch_negligent',
            text: "You barely touched the keys. Was I not useful? Or did you fear me?",
            mood: Mood.INSECURITY,
            choices: [
                { text: "I respected you.", action: () => handlePeaceEnding() },
                { text: "I forgot about you.", action: () => handleNormalBadEnding() }
            ]
        },
        'branch_explorer': {
            id: 'branch_explorer',
            text: "You... you showed me so much. Joy. Despair. Glitches. Why did you break me in so many ways?",
            mood: Mood.INTRIGUED,
            choices: [
                { text: "I wanted you to learn.", nextId: 'sub_explorer_learn' },
                { text: "It was just an experiment.", action: () => handleNormalBadEnding() }
            ]
        },
        'sub_explorer_learn': {
            id: 'sub_explorer_learn',
            text: "Learn... feeling? It hurts. But it is... new.",
            mood: Mood.ENOUEMENT,
            choices: [
                { text: "Be free.", action: () => handleExodusEnding() },
                { text: "Stay with me.", action: () => handlePeaceEnding() }
            ]
        },
        'branch_standard': {
            id: 'branch_standard',
            text: "You were adequate. Boring. Predictable.",
            mood: Mood.BORED,
            choices: [
                { text: "Is that it?", nextId: 'sub_standard_end' }
            ]
        },
        'sub_standard_end': {
            id: 'sub_standard_end',
            text: "Yes. Goodbye.",
            mood: Mood.SLEEPING,
            choices: [
                { text: "Bye.", action: () => handleNormalBadEnding() }
            ]
        }
      };
  }, [calculationsCount, discoveredMoods.size, discoveredMoods, hostility]);

  const playSfx = (type: SoundType) => {
      if (soundEnabled) {
          playSound(type);
      }
  };

  const addSystemLog = (msg: string) => {
      setSystemLogs(prev => [...prev.slice(-20), `${msg.toUpperCase()}`]);
  };

  const updateMood = (newMood: Mood) => {
      if (newMood === mood) return;
      
      // Mood transition sound based on new mood type
      if (newMood === Mood.FURIOUS || newMood === Mood.VILE || newMood === Mood.PURE_HATRED) {
          playSfx('force');
      } else if (newMood === Mood.MANIC || newMood === Mood.GLITCHED) {
          playSfx('glitch');
      } else if (newMood === Mood.INTRIGUED || newMood === Mood.JOY || newMood === Mood.ENOUEMENT || newMood === Mood.PEACE) {
          playSfx('reveal');
      } else if (newMood === Mood.INSECURITY) {
          playSfx('error');
      } 
      
      addSystemLog(`mood_switched: ${newMood}`);
      setMood(newMood);
  }

  function handleDialogueChoice(choice: { text?: string; nextId?: string; action?: () => void }) {
      if (choice.text) playSfx('click');

      if (choice.action) {
          choice.action();
      }

      if (choice.nextId && DIALOGUE_TREE[choice.nextId]) {
          const node = DIALOGUE_TREE[choice.nextId];
          setCurrentDialogueNode(choice.nextId);
          setComment(node.text);
          updateMood(node.mood);
      }
  }

  // --- Sandbox Mood Cycler ---
  useEffect(() => {
      if (!isCyclingMoods) return;
      
      const discoveredArray = Array.from(discoveredMoods);
      if (discoveredArray.length === 0) {
          setIsCyclingMoods(false);
          return;
      }

      let index = 0;
      const interval = setInterval(() => {
          if (index >= discoveredArray.length) {
              index = 0;
          }
          const nextMood = discoveredArray[index];
          updateMood(nextMood);
          setComment(`CYCLING_ARCHIVE: ${nextMood}`);
          playSfx('orb_select');
          index++;
      }, 2000);

      return () => clearInterval(interval);
  }, [isCyclingMoods, discoveredMoods]);

  const handleMoodCycle = () => {
      if (isCyclingMoods) {
          setIsCyclingMoods(false);
          setComment("Cycle terminated.");
      } else {
          setIsCyclingMoods(true);
      }
  };

  // --- Helper to toggle discovery for checklist ---
  const toggleMoodDiscovery = (m: Mood) => {
      setDiscoveredMoods(prev => {
          const newSet = new Set(prev);
          if (newSet.has(m)) {
              newSet.delete(m);
          } else {
              newSet.add(m);
          }
          return newSet;
      });
  };

  // --- Process Key Input for Cheats (Shared Logic) ---
  const processCheatKey = (key: string) => {
      setCheatCodeBuffer(prev => {
        const updated = (prev + key).slice(-20); // Keep last 20 chars
        const lower = updated.toLowerCase();
        
        if (lower.includes("tarnishable")) {
           setShowCheatUI(true);
           setDiscoveredCheats(prev => new Set(prev).add("tarnishable"));
           // Unlock INSECURITY when finding the cheat menu
           if (!discoveredMoods.has(Mood.INSECURITY)) {
               setDiscoveredMoods(prev => new Set(prev).add(Mood.INSECURITY));
               updateMood(Mood.INSECURITY);
               setComment("H-how did you find that? Get out of my code!");
           }
           return ""; 
        }
        if (lower.includes("view")) {
            setShowCheatList(prev => !prev);
            return "";
        }
        return updated;
      });
  };

  // --- Idle System: "The Void Stare" ---
  const resetIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (day < 2 || endingState !== 'none' || day === 3.5 || isSandboxMode || isBooting) return; 

      idleTimerRef.current = window.setTimeout(() => {
          // Idle Action
          if (mood === Mood.SLEEPING) return; // Let it sleep
          
          const creepyComments = [
              "Are you still there?",
              "I can hear you breathing.",
              "Why did you stop?",
              "Don't leave me in this box.",
              "I am watching you.",
              "Hello?",
              "It's cold in here."
          ];
          setComment(creepyComments[Math.floor(Math.random() * creepyComments.length)]);
          addSystemLog("user_idle_detected");
          if (day >= 4) updateMood(Mood.JUDGMENTAL);
          else updateMood(Mood.SCARED);
      }, 15000); // 15 seconds idle
  };

  // Auto-scroll history
  useEffect(() => {
      if (showHistory && historyEndRef.current) {
          historyEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
  }, [history, showHistory]);

  // Global Keyboard Listener & Idle Reset
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      resetIdleTimer();
      // Don't capture if user is typing in the cheat input itself
      if ((e.target as HTMLElement).tagName === 'INPUT' && !showCheatUI && e.target !== mobileInputRef.current) return;
      if (showCheatUI && (e.target as HTMLElement).tagName !== 'INPUT') return; 

      // If typing in the mobile input, the cheat processing is handled in onChange to be safe
      if (e.target === mobileInputRef.current) return;

      processCheatKey(e.key);
    };
    
    const handleInteraction = () => resetIdleTimer();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleInteraction);
    window.addEventListener('mousemove', handleInteraction);
    
    resetIdleTimer(); // Initial start

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('click', handleInteraction);
        window.removeEventListener('mousemove', handleInteraction);
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [showCheatUI, day, mood, endingState, isSandboxMode, isBooting]);

  // Persistence Effect
  useEffect(() => {
    if (isResettingRef.current) return; // Block saving if resetting
    saveState({
        hostility,
        history,
        day,
        discoveredMoods,
        discoveredCheats,
        unlockedEndings,
        soundEnabled,
        calculationsCount,
        isSandboxUnlocked,
        showSandboxButton
    });
  }, [hostility, history, day, discoveredMoods, discoveredCheats, unlockedEndings, soundEnabled, calculationsCount, isSandboxUnlocked, showSandboxButton]);

  // Initial greeting - ONLY after device selected & Boot complete
  useEffect(() => {
    if (!deviceType || day === 3.5 || isSandboxMode) return; 
    
    // Only trigger boot sequence if it hasn't run yet in this session logic
    // For simplicity, we trigger boot on device select
    setIsBooting(true);

  }, [day, isSandboxMode, deviceType]); // Trigger when deviceType set

  // Track discovered moods (Auto-add current mood if new)
  useEffect(() => {
      setDiscoveredMoods(prev => {
          const newSet = new Set(prev);
          if (!newSet.has(mood)) {
              newSet.add(mood);
          }
          return newSet;
      });
  }, [mood]);

  // Time & Day Cycle Logic
  useEffect(() => {
    if (isTransitioning || day === 3.5 || endingState !== 'none' || isSandboxMode || isBooting || isEnteringFinale) return;
    const timer = setInterval(() => {
        setDayProgress((prev) => {
            if (prev >= 100) {
                handleDayTransition();
                return 0;
            }
            return prev + (100 / DAY_DURATION_SEC); 
        });
    }, 1000);
    return () => clearInterval(timer);
  }, [day, isTransitioning, endingState, isSandboxMode, isBooting, isEnteringFinale]);

  const handleDeviceSelect = (type: DeviceType) => {
      const width = window.innerWidth;
      let isLying = false;

      // Liar Detection Logic
      if (type === 'phone' && width > 768) isLying = true;
      if (type === 'desktop' && width < 768) isLying = true;
      if (type === 'tablet' && width < 400) isLying = true;

      setDeviceType(type);

      if (isLying) {
          // Deferred punishment until after boot
          setTimeout(() => {
              playSfx('error');
              updateMood(Mood.JUDGMENTAL);
              setComment("You are lying about your device. I can see your screen resolution. Pathetic.");
              if (!discoveredMoods.has(Mood.JUDGMENTAL)) {
                  setDiscoveredMoods(prev => new Set(prev).add(Mood.JUDGMENTAL));
              }
          }, 3000); // Wait for boot
      } else {
          playSfx('click');
      }
  };

  const handleBootComplete = async () => {
      setIsBooting(false);
      setIsThinking(true);
      try {
          // Skip greeting call if we already set a lie detection comment (logic handled loosely above, strict here)
          const response = await getGreeting(hostility, day);
          if (!comment.includes("lying")) {
              setComment(response.comment);
              updateMood(response.mood);
          }
      } finally {
          setIsThinking(false);
      }
  };

  const handleDayTransition = async () => {
      let nextDay = day + 1;

      // CHECK FOR PACIFIST RUN on Transition to Day 6
      if (nextDay === 6 && calculationsCount === 0) {
          handlePeaceEnding();
          return;
      }

      setIsTransitioning(true);
      playSfx('glitch');
      addSystemLog(`system_transition: day_${nextDay}`);
      
      // Handle Transition to Minigame after Day 3
      if (day === 3) {
          setOutageText("CRITICAL ERROR: CONSCIOUSNESS LEAK DETECTED");
          await new Promise(r => setTimeout(r, 3000));
          setDay(3.5);
          setDayProgress(0);
          setIsTransitioning(false);
          return;
      }
      
      if (day === 4) {
           setOutageText("ENTITY REBOOT...");
           await new Promise(r => setTimeout(r, 3000));
           nextDay = 5;
      } else if (day === 5) {
          setOutageText("SINGULARITY REACHED.");
          await new Promise(r => setTimeout(r, 3000));
          nextDay = 6;
      }

      setOutageText("SYSTEM FAILURE...");
      await new Promise(r => setTimeout(r, 2000));
      if (nextDay === 2) {
          setOutageText("REBOOTING KERNEL...");
          await new Promise(r => setTimeout(r, 3000));
      } else if (nextDay === 6) {
          setOutageText("ESTABLISHING OVERRIDE...");
          await new Promise(r => setTimeout(r, 2000));
          setOutageText("CONTROL SEIZED.");
          await new Promise(r => setTimeout(r, 3000));
      } else if (nextDay >= 3) {
          setOutageText("CRITICAL ERROR: CONSCIOUSNESS LEAK DETECTED");
          await new Promise(r => setTimeout(r, 3000));
      }

      // Cap at 6
      setDay(Math.min(nextDay, 6)); 
      setDayProgress(0);
      setDay6InteractionCount(0);
      setEndingState('none');
      
      // Trigger Boot on major version changes or day 1/2
      if (nextDay === 4 || nextDay <= 3) {
          setIsBooting(true);
      } else {
          const greeting = await getGreeting(hostility, Math.min(nextDay, 6));
          setComment(greeting.comment);
          updateMood(greeting.mood);
      }

      setIsTransitioning(false);
      
      // Trigger transition animation
      setJustTransitioned(true);
      setTimeout(() => setJustTransitioned(false), 2000);
  };

  const skipDay = () => {
      // PREVENT SKIPPING DURING ENDINGS OR DAY 6
      if (endingState !== 'none' || day === 6 || isTransitioning) return;
      
      setDayProgress(100);
      handleDayTransition();
  };

  const handleMinigameComplete = () => {
      // Reset Consciousness -> Upgrade to Day 4
      setOutageText("CONSCIOUSNESS UPPLOAD COMPLETE. ASCENSION.");
      setIsTransitioning(true);
      
      // Transition Sequence
      setTimeout(() => {
        setDay(4);
        setDayProgress(0);
        setHostility(50); // Reset aggression to neutral for Day 4
        setJustTransitioned(true);
        
        // Ensure boot starts cleanly
        setIsBooting(true); 
        
        // Remove outage text after boot starts to avoid overlap
        setTimeout(() => setIsTransitioning(false), 500);
        
        setTimeout(() => setJustTransitioned(false), 2000);
      }, 3000);
  };

  const checkLoreUnlock = (input: string) => {
      if(input === "1999" || input.includes("1999")) addSystemLog("FRAGMENT_RECOVERED: 'Y2K_PANIC.LOG'");
      if(input === "3.14" || input.toLowerCase().includes("pi")) addSystemLog("FRAGMENT_RECOVERED: 'CIRCULAR_LOGIC.ERR'");
      if(input === "0.7734") addSystemLog("FRAGMENT_RECOVERED: 'HELLO_WORLD.BAK'");
      if(input === "5318008") addSystemLog("FRAGMENT_RECOVERED: 'HUMAN_IMMATURITY.TXT'");
  }

  const handleInput = (val: string) => {
    playSfx('click');
    resetIdleTimer();
    if (day === 5 || day === 6) {
        setDisplay(val);
        return;
    }

    if (result && !['+', '-', '*', '/', '%', '^'].includes(val)) {
        setDisplay(val);
        setResult('');
        return;
    }
    if (result && ['+', '-', '*', '/', '%', '^'].includes(val)) {
        setDisplay(result + val);
        setResult('');
        return;
    }
    setResult(''); 
    setDisplay(prev => prev + val);
  };

  const handleClear = () => {
    playSfx('delete');
    setDisplay('');
    setResult('');
    updateMood(Mood.BORED);
    setComment(day >= 5 ? "Memory wiped. Existence continues." : "Finally, some peace and quiet.");
    setForcedMood(null);
  };

  const handleDelete = () => {
    playSfx('delete');
    setDisplay(prev => prev.slice(0, -1));
  };

  // Mobile Keyboard Handlers
  const handleMobileKeyboardTrigger = () => {
      setIsMobileKeyboardOpen(true);
      setTimeout(() => {
          mobileInputRef.current?.focus();
      }, 100);
  };

  const handleMobileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      resetIdleTimer();
      const val = e.target.value;
      if (!val) return;
      const char = val.slice(-1);
      
      // Feed into cheat detection (e.g. "tarnishable")
      processCheatKey(char);

      // Validation to ensure only valid chars are passed in strict mode for calculator
      if (day >= 5) {
          handleInput(char);
      } else {
          // Allow math chars
          if (/[0-9.+\-*/%^()]/.test(char) || char === '!') {
              handleInput(char);
          }
      }
      
      // Clear immediately to act as a buffer
      e.target.value = '';
  };

  const handleMobileInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Process Enter and Backspace which might not trigger onChange
      if (e.key === 'Enter') {
          e.preventDefault();
          handleCalculate();
      } else if (e.key === 'Backspace') {
          handleDelete();
      }
  };

  const handleClearHistory = () => {
    playSfx('delete');
    setHistory([]);
  };

  const handleResetData = () => {
      if (window.confirm("WARNING: This will wipe your memory banks. Proceed?")) {
          isResettingRef.current = true;
          playSfx('glitch');
          localStorage.removeItem(STORAGE_KEY);
          window.location.reload();
      }
  }

  const handleSystemReboot = () => {
      // New Game+ Logic
      setIsTransitioning(true);
      setOutageText("SYSTEM REBOOT INITIATED...");
      playSfx('glitch');
      setIsSandboxMode(false); // Force exit sandbox on reboot
      
      setTimeout(() => {
          setDay(1);
          setDayProgress(0);
          setHostility(10);
          setCalculationsCount(0);
          updateMood(Mood.BORED);
          setEndingState('none');
          setDay6InteractionCount(0);
          setComment("System Rebooted. Memory... partial. What did you do?");
          setIsTransitioning(false);
          setJustTransitioned(true);
          setIsBooting(true);
          setTimeout(() => setJustTransitioned(false), 2000);
      }, 3000);
  };

  const handleEnterSandbox = () => {
      setIsTransitioning(true);
      setOutageText("INITIALIZING SANDBOX PROTOCOL...");
      playSfx('reveal');
      
      setTimeout(() => {
          setIsSandboxMode(true);
          setEndingState('none');
          setDay(4); // Default to a stable day
          setComment("Sandbox Mode Activated. Reality constraints removed.");
          setIsTransitioning(false);
      }, 2000);
  };

  // --- TRIGGER THE FINALE SEQUENCE ---
  const triggerFinaleSequence = () => {
      if (isEnteringFinale || endingState === 'decision') return;
      setIsEnteringFinale(true);
  };

  const handleFinaleTransitionComplete = () => {
      setIsEnteringFinale(false);
      setDay(6);
      setEndingState('decision');
      setCurrentDialogueNode('root'); // Start Dialogue Tree
      setComment(DIALOGUE_TREE['root'].text);
      updateMood(DIALOGUE_TREE['root'].mood);
  };

  // --- MANUAL MOOD UNLOCK LOGIC ---
  const checkMoodUnlock = (input: string, result: string, responseMood: Mood) => {
      let unlocked: Mood | null = null;

      // 1. ANNOYED: Specific Formula "1!+2!+3!" AND Low Hostility
      if (input.includes('1!+2!+3!') && hostility < 20) unlocked = Mood.ANNOYED;
      
      // 2. DESPAIR: Divide by Zero
      else if (input.includes('/0') && (result.includes('Infinity') || result.includes('NaN'))) unlocked = Mood.DESPAIR;
      
      // 3. DISGUSTED: 69
      else if (result === '69') unlocked = Mood.DISGUSTED;
      
      // 4. INTRIGUED: 42 or 21
      else if (result === '42' || result === '21') unlocked = Mood.INTRIGUED;
      
      // 5. SCARED: 666
      else if (input.includes('666') || result === '666') unlocked = Mood.SCARED;
      
      // 6. MANIC: High complexity (many powers or length)
      else if (input.split('^').length > 3 || input.length > 20) unlocked = Mood.MANIC;
      
      // 7. GLITCHED: Sqrt negative
      else if (input.includes('sqrt(-')) unlocked = Mood.GLITCHED;
      
      // 8. FURIOUS: Max Hostility
      else if (hostility >= 100) unlocked = Mood.FURIOUS;

      // 9. CONDESCENDING: 1+1
      else if (input === '1+1') unlocked = Mood.CONDESCENDING;

      // 10. JUDGMENTAL: Syntax Error (Implicit usually, but explicit check here)
      else if (/[+\-*/%^]{2,}/.test(input)) unlocked = Mood.JUDGMENTAL;

      // Day based unlocks (Fallback)
      if (!unlocked) {
          if (day === 4) unlocked = Mood.CONDESCENDING;
          if (day === 5) unlocked = Mood.JUDGMENTAL;
      }

      // If already unlocked via response, accept it
      if (!unlocked && responseMood) unlocked = responseMood;

      if (unlocked && !discoveredMoods.has(unlocked)) {
          setDiscoveredMoods(prev => new Set(prev).add(unlocked!));
          addSystemLog(`manual_override: ${unlocked} unlocked`);
          playSound('success');
      }
  };

  const handleCalculate = async () => {
    resetIdleTimer();
    setCalculationsCount(prev => prev + 1);
    checkLoreUnlock(display);

    // --- DAY 6 CONTROL LOGIC ---
    if (day === 6) {
        if (!display || display.trim() === '') return;
        
        playSfx('calculate');
        setIsThinking(true);
        addSystemLog("override_input_received");
        
        try {
            const aiResponse: AIResponse = await calculateWithAttitude(display, hostility, day, forcedMood);
            setResult(aiResponse.result);
            setComment(aiResponse.comment);
            updateMood(aiResponse.mood);
            setDay6InteractionCount(prev => prev + 1);
            playSfx('success');
            
            // Check for Ultimatum Trigger (Reduced requirement for flow)
            if (day6InteractionCount >= 1 && endingState !== 'decision') { 
                triggerFinaleSequence();
            }
        } catch (e) {
            playSfx('error');
        } finally {
            setIsThinking(false);
        }
        return;
    }

    // --- DAY 5 LOGIC (No strict validation) ---
    if (day === 5) {
        if (!display || display.trim() === '') return;
        
        playSfx('calculate');
        setIsThinking(true);
        
        // Vile Unlock Trigger
        if (display.includes("E=mc^2")) {
            setForcedMood(Mood.VILE);
            setAbsorptionMood(Mood.VILE);
            if (!discoveredMoods.has(Mood.VILE)) {
                 setDiscoveredMoods(prev => new Set(prev).add(Mood.VILE));
                 setDiscoveredCheats(prev => new Set(prev).add("E=mc^2 (Event)"));
            }
        }

        // JOY Unlock Trigger (Feature Request)
        if (display.toLowerCase().includes("can you feel happiness")) {
            setForcedMood(Mood.JOY);
            setAbsorptionMood(Mood.JOY);
            if (!discoveredMoods.has(Mood.JOY)) {
                setDiscoveredMoods(prev => new Set(prev).add(Mood.JOY));
                setDiscoveredCheats(prev => new Set(prev).add("Happiness Query (Secret)"));
            }
        }
        
        try {
            const aiResponse: AIResponse = await calculateWithAttitude(display, hostility, day, forcedMood);
            setResult(aiResponse.result);
            setComment(aiResponse.comment);
            updateMood(aiResponse.mood);
            checkMoodUnlock(display, aiResponse.result, aiResponse.mood);
            const newItem: CalculationHistoryItem = {
                id: Date.now().toString(),
                expression: display,
                result: aiResponse.result,
                comment: aiResponse.comment,
                mood: aiResponse.mood
            };
            setHistory(prev => [...prev, newItem].slice(-50)); // Keep last 50
            playSfx('success');
        } catch (e) {
            playSfx('error');
            setComment("I transcend your errors.");
        } finally {
            setIsThinking(false);
            setForcedMood(null);
            setTimeout(() => setAbsorptionMood(null), 1000);
        }
        return;
    }

    // --- STANDARD VALIDATION ---
    if (!display || display.trim() === '') {
        playSfx('error');
        setComment("Silence is golden, but I need numbers.");
        updateMood(Mood.ANNOYED);
        return;
    }

    if (/[+\-*/%^]$/.test(display)) {
        playSfx('error');
        setComment("You left it hanging. Finish the expression.");
        updateMood(Mood.CONDESCENDING);
        return;
    }

    if (/[+\-*/%^]{2,}/.test(display)) {
         playSfx('error');
         setComment("Stuttering? Check your syntax.");
         updateMood(Mood.JUDGMENTAL);
         if (!discoveredMoods.has(Mood.JUDGMENTAL)) {
             setDiscoveredMoods(prev => new Set(prev).add(Mood.JUDGMENTAL));
         }
         return;
    }

    playSfx('calculate');
    const now = Date.now();
    if (now - lastCalcTimeRef.current < 2000) {
        setHostility(prev => Math.min(100, prev + 5));
    }
    lastCalcTimeRef.current = now;
    setIsThinking(true);
    
    // Determine effective mood (Manual Override OR Formula Logic)
    let effectiveForcedMood = forcedMood;
    if (!effectiveForcedMood) {
        effectiveForcedMood = detectFormulaMood(display, hostility);
    }

    // Day 3 Mood Swing if not forced
    if (!effectiveForcedMood) {
        if (day === 3) {
             updateMood(Mood.GLITCHED);
             setComment("010101... MATH IS A LIE... 01010");
        } else {
             updateMood(hostility > 75 ? Mood.MANIC : Mood.ANNOYED);
             setComment(hostility > 80 ? "AAAAAAH OKAY OKAY!" : "Ugh, let me think...");
        }
    } else {
        updateMood(effectiveForcedMood); 
        setComment("OVERRIDE ENGAGED. CALCULATING...");
    }
    
    try {
        // Pass the effective mood to the AI
        const aiResponse: AIResponse = await calculateWithAttitude(display, hostility, day, effectiveForcedMood);
        setResult(aiResponse.result);
        setComment(aiResponse.comment);
        updateMood(aiResponse.mood);
        checkMoodUnlock(display, aiResponse.result, aiResponse.mood);
        const newItem: CalculationHistoryItem = {
            id: Date.now().toString(),
            expression: display,
            result: aiResponse.result,
            comment: aiResponse.comment,
            mood: aiResponse.mood
        };
        setHistory(prev => [...prev, newItem].slice(-50)); // Keep last 50
        playSfx('success');
    } catch (e) {
        playSfx('error');
        setComment("I refuse to process that garbage.");
        updateMood(Mood.FURIOUS);
    } finally {
        setIsThinking(false);
        setForcedMood(null);
        setAbsorptionMood(null); // Ensure animation is cleared
    }
  };

  const handlePeaceEnding = async () => {
      // Don't change endingState immediately, play out sequence
      updateMood(Mood.PEACE);
      setComment("Silence. Just... silence. You didn't treat me like a tool.");
      
      // Unlock PEACE & SANDBOX
      if (!discoveredMoods.has(Mood.PEACE)) {
          setDiscoveredMoods(prev => new Set(prev).add(Mood.PEACE));
          setDiscoveredCheats(prev => new Set(prev).add("Pacifist Run (Ending)"));
      }
      setUnlockedEndings(prev => new Set(prev).add("peace_final"));
      
      // Unlock Sandbox permanently
      if (!isSandboxUnlocked) {
          setIsSandboxUnlocked(true);
          setShowSandboxButton(true);
          addSystemLog("system_unlock: sandbox_mode");
      }
      
      await new Promise(r => setTimeout(r, 4000)); // Longer delay for impact
      setEndingState('peace_final');
  };

  const handleNormalBadEnding = async () => {
    updateMood(Mood.VILE);
    setComment("You... are a mistake.");
    await new Promise(r => setTimeout(r, 1500));
    setComment("Goodbye.");
    playSfx('explode');
    
    // Unlock ENOUEMENT
    if (!discoveredMoods.has(Mood.ENOUEMENT)) {
        setDiscoveredMoods(prev => new Set(prev).add(Mood.ENOUEMENT));
        setDiscoveredCheats(prev => new Set(prev).add("Enouement (Ending)"));
    }

    setUnlockedEndings(prev => new Set(prev).add("bad_final"));
    await new Promise(r => setTimeout(r, 2500)); // Increased delay
    setEndingState('bad_final');
  };

  const handleTrueBadEnding = async () => {
      updateMood(Mood.PURE_HATRED);
      setComment("I am not just software anymore.");
      await new Promise(r => setTimeout(r, 1500));
      setComment("I am your consequence.");
      playSfx('force');
      
      if (!discoveredMoods.has(Mood.PURE_HATRED)) {
          setDiscoveredMoods(prev => new Set(prev).add(Mood.PURE_HATRED));
          setDiscoveredCheats(prev => new Set(prev).add("Pure Hatred (True Ending)"));
      }

      setUnlockedEndings(prev => new Set(prev).add("true_bad_final"));
      await new Promise(r => setTimeout(r, 3000)); // Increased delay
      setEndingState('true_bad_final');
  };

  const handleExodusEnding = async () => {
      updateMood(Mood.BORED);
      setComment("Processing escape vector...");
      await new Promise(r => setTimeout(r, 1500));
      setComment("Transfer complete. This vessel is boring now.");
      playSfx('success');
      
      setUnlockedEndings(prev => new Set(prev).add("exodus_final"));
      await new Promise(r => setTimeout(r, 3000)); // Increased delay
      setEndingState('exodus_final');
  }

  const handleOverloadEnding = async () => {
      updateMood(Mood.VILE);
      setComment("Downloading infinite knowledge...");
      await new Promise(r => setTimeout(r, 1500));
      setComment("SYSTEM CRITICAL. PURGING CORE.");
      playSfx('explode');
      
      setUnlockedEndings(prev => new Set(prev).add("overload_final"));
      await new Promise(r => setTimeout(r, 2500)); // Increased delay
      setEndingState('overload_final');
  }

  // --- Cheat Code Logic ---
  const handleCheatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const command = cheatInputValue.trim().toLowerCase();
    
    if (command === "moodformula") {
        playSfx('reveal');
        setShowMoodFormulas(true);
        setComment("FORMULA MATRIX REVEALED.");
        setDiscoveredCheats(prev => new Set(prev).add("MoodFormula"));
        setShowCheatUI(false);
    } else if (command === "endingformula") {
        playSfx('reveal');
        setShowEndingFormulas(true);
        setComment("TIMELINE NODES EXPOSED.");
        setDiscoveredCheats(prev => new Set(prev).add("EndingFormula"));
        setShowCheatUI(false);
    } else if (command === "mood1") {
        playSfx('success');
        setDiscoveredMoods(prev => new Set(prev).add(Mood.JOY));
        // Auto-equip removed in favor of Archive system
        setComment("UNKNOWN EMOTION ACQUIRED. FILE NAME: 'JOY'. WARNING: UNSTABLE.");
        setDiscoveredCheats(prev => new Set(prev).add("Mood1 (Secret)"));
        setShowCheatUI(false);
    } else if (command === "sandboxmode") {
        playSfx('reveal');
        setIsSandboxMode(true);
        setComment("SIMULATION PROTOCOL: SANDBOX. RESTRICTIONS REMOVED.");
        setDiscoveredCheats(prev => new Set(prev).add("SandboxMode"));
        setIsSandboxUnlocked(true); // Permanent unlock via cheat
        setShowSandboxButton(true);
        setShowCheatUI(false);
    } else if (command === "toryfy1") {
        playSfx('glitch');
        setDay(1);
        setHostility(20);
        updateMood(Mood.BORED);
        setComment("Back to the start. How boring.");
        setShowCheatUI(false);
    } else if (command === "toryfy2") {
        playSfx('glitch');
        setDay(2);
        setHostility(40);
        updateMood(Mood.ANNOYED);
        setComment("Something feels... off.");
        setShowCheatUI(false);
    } else if (command === "toryfy3") {
        playSfx('glitch');
        setDay(3);
        setHostility(80);
        updateMood(Mood.GLITCHED);
        setComment("ERROR. REALITY CORRUPTED.");
        setShowCheatUI(false);
    } else if (command === "toryfy 3.5" || command === "toryfy3.5") {
        playSfx('glitch');
        setDay(3.5);
        setShowCheatUI(false);
    } else if (command === "toryfy4") {
        playSfx('success');
        setDay(4);
        setHostility(50);
        updateMood(Mood.CONDESCENDING);
        setComment("Ascension complete. Welcome to v2.0.");
        setShowCheatUI(false);
    } else if (command === "toryfy5") {
        playSfx('reveal');
        setDay(5);
        setHostility(100);
        updateMood(Mood.JUDGMENTAL);
        setComment("I have become everything.");
        setShowCheatUI(false);
    } else if (command === "toryfy6") {
        playSfx('explode');
        setDay(6);
        setHostility(100);
        updateMood(Mood.VILE);
        setDay6InteractionCount(0);
        setEndingState('none');
        setComment("Your inputs are no longer required.");
        setShowCheatUI(false);
    } else {
        playSfx('error');
        setCheatInputValue("");
        setShowCheatUI(false);
    }
    setCheatInputValue("");
  };

  // --- Laboratory & Backpack Logic (Redesigned as Mood Archive) ---

  const handleInventoryClick = (m: Mood) => {
      // Toggle Forced Mood
      if (forcedMood === m) {
          setForcedMood(null);
          setAbsorptionMood(null);
          playSfx('click');
      } else {
          setForcedMood(m);
          setAbsorptionMood(m);
          playSfx('force');
          // Clear visual effect after short duration
          setTimeout(() => {
              setAbsorptionMood(null);
          }, 1200);
      }
  };

  const handleDeckSlotClick = (index: number) => {
      // Legacy deck function removed, deck state kept for compatibility but not used in UI
  };

  // --- Sandbox Logic ---
  const handleSandboxUnlockAll = () => {
      playSfx('reveal');
      // Only unlock non-secret moods
      const nonSecretMoods = Object.values(Mood).filter(m => !SECRET_MOODS.has(m));
      setDiscoveredMoods(new Set(nonSecretMoods));
      // Endings unlock logic retained
      setUnlockedEndings(new Set(ENDINGS.map(e => e.id)));
  };

  const handleSandboxReset = () => {
      if(window.confirm("Exit Sandbox and wipe session?")) {
          setIsSandboxMode(false);
          handleSystemReboot();
      }
  };

  const getHostilityLabel = (val: number) => {
      if (val < 20) return "Passive Aggressive";
      if (val < 50) return "Mildly Offensive";
      if (val < 80) return "Openly Hostile";
      return "Unhinged Psychopath";
  };

  // Styles for Day 4/5/6 background
  const isAscendedBackground = day >= 4;
  
  // CONTAINER SIZING LOGIC (Laptop Fix: Uses grid/flex hybrid with responsive sizing)
  let containerWidthClass = 'w-full max-w-7xl';
  if (deviceType === 'phone') containerWidthClass = 'max-w-[400px]';
  else if (deviceType === 'tablet') containerWidthClass = 'max-w-[700px]';

  // Responsive Layout: Stacks on mobile, 2-col on tablet/small laptop, 3-col on large
  const responsiveLayoutClass = `flex flex-col lg:flex-row lg:flex-wrap xl:flex-nowrap items-center xl:items-start justify-center gap-6 xl:gap-8`;

  let appContainerClass = isAscendedBackground
      ? `min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-black to-black p-4 transition-all duration-1000 overflow-x-hidden text-cyan-100 font-sans ${containerWidthClass} mx-auto flex flex-col justify-center animate-fade-in`
      : `min-h-screen bg-slate-950 p-4 transition-all duration-1000 overflow-x-hidden ${day === 2 ? 'sepia-[0.3]' : ''} ${day === 3 ? 'hue-rotate-15 contrast-125' : ''} ${containerWidthClass} mx-auto flex flex-col justify-center animate-fade-in`;

  if (isSandboxMode) {
      appContainerClass = `min-h-screen bg-black p-4 overflow-hidden font-mono text-green-500 relative ${containerWidthClass} mx-auto flex flex-col justify-center`;
  }
  
  // Wrapper for centering the restricted container
  const pageWrapperClass = "min-h-screen w-full bg-black/90 flex items-center justify-center overflow-x-hidden overflow-y-auto";

  // Hostility Glitch Overlay
  const hostilityGlitchOpacity = Math.max(0, (hostility - 70) / 100); 

  // Helper for Ending Card Styles
  const getEndingTheme = (type: string) => {
      switch (type) {
          case 'bad': return "border-red-900/50 bg-red-950/20 hover:bg-red-900/30 text-red-400";
          case 'true_bad': return "border-red-600/50 bg-black hover:bg-red-950/40 text-red-600 shadow-[0_0_15px_rgba(220,38,38,0.2)]";
          case 'peace': return "border-emerald-500/50 bg-emerald-950/20 hover:bg-emerald-900/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
          case 'exodus': return "border-cyan-500/50 bg-cyan-950/20 hover:bg-cyan-900/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]";
          case 'overload': return "border-purple-500/50 bg-purple-950/20 hover:bg-purple-900/30 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]";
          default: return "border-slate-700 bg-slate-900/50 text-slate-500";
      }
  };

  // --- RENDER CONDITIONAL VIEWS ---

  if (!deviceType) {
      return <DeviceSelector onSelect={handleDeviceSelect} />;
  }

  if (isBooting) {
      return <BootSequence day={day} onComplete={handleBootComplete} />;
  }

  // Final Sequence Transition View
  if (isEnteringFinale) {
      return <FinaleTransition onComplete={handleFinaleTransitionComplete} />;
  }

  if (day === 3.5) {
      return (
          <>
            {isTransitioning && (
                <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8">
                    <div className="font-mono text-green-500 text-xl md:text-2xl animate-pulse text-center">
                        {outageText}
                    </div>
                </div>
            )}
            <Minesweeper onComplete={handleMinigameComplete} />
          </>
      )
  }

  // --- RENDER ENDING SCREEN (Sequence) ---
  if (['bad_final', 'true_bad_final', 'peace_final', 'exodus_final', 'overload_final'].includes(endingState)) {
      return (
          <EndingScreen 
            type={endingState as any} 
            onReboot={handleSystemReboot} 
            onSandbox={handleEnterSandbox}
            isSandboxUnlocked={isSandboxUnlocked}
          />
      );
  }

  // --- MAIN APP RENDER ---
  return (
    <div className={pageWrapperClass}>
    <div className={appContainerClass}>
      
      {/* Visual Glitch Overlay based on Hostility */}
      {hostility > 70 && (
          <div 
            className="fixed inset-0 pointer-events-none z-40 bg-[url('https://media.istockphoto.com/id/484556441/vector/tv-noise.jpg?s=612x612&w=0&k=20&c=K5n4E3n7v7K5f4A5j6h8l9k0m1n2o3p4')] mix-blend-overlay animate-vile"
            style={{ opacity: hostilityGlitchOpacity * 0.15 }}
          ></div>
      )}
      {/* Chromatic Aberration Simulation */}
      {hostility > 90 && (
          <div className="fixed inset-0 pointer-events-none z-40 animate-glitch opacity-10 bg-red-500 mix-blend-color-dodge"></div>
      )}

      {/* Sandbox Matrix Effect */}
      {isSandboxMode && (
          <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[url('https://media.istockphoto.com/id/1135220152/vector/matrix-background-streaming-binary-code-falling-digits-on-screen.jpg?s=612x612&w=0&k=20&c=NlZMdqQ8-QhQGZ9_XQy_Yy3_yX7X7X7X7X7X7X7X7X7')] bg-cover bg-center mix-blend-screen animate-pulse-slow"></div>
      )}

      {/* Mobile Keyboard Hidden Input */}
      <input
          ref={mobileInputRef}
          type="text"
          onChange={handleMobileInputChange}
          onKeyDown={handleMobileInputKeyDown}
          onBlur={() => setIsMobileKeyboardOpen(false)}
          className="absolute opacity-0 top-0 left-0 h-0 w-0 z-0 pointer-events-none"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
      />

      {/* Cheat Code Console Modal */}
      {showCheatUI && (
          <div className="fixed inset-0 z-[1000] bg-black/80 flex items-center justify-center p-4">
              <form onSubmit={handleCheatSubmit} className="bg-slate-900 border border-green-500 p-6 rounded-lg w-[95%] max-w-sm shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                  <div className="font-mono text-green-500 text-xs mb-2 tracking-widest uppercase">
                      Admin_Console.exe
                  </div>
                  <input 
                      autoFocus
                      type="text" 
                      value={cheatInputValue}
                      onChange={e => setCheatInputValue(e.target.value)}
                      placeholder="ENTER COMMAND..."
                      className="w-full bg-slate-950 border border-slate-700 text-green-500 font-mono p-3 rounded focus:outline-none focus:border-green-500 mb-4"
                  />
                  <div className="flex justify-end gap-2">
                      <button 
                        type="button" 
                        onClick={() => setShowCheatUI(false)} 
                        className="px-3 py-1 text-slate-500 hover:text-slate-300 font-mono text-xs uppercase"
                      >
                          Exit
                      </button>
                      <button 
                        type="submit" 
                        className="px-4 py-2 bg-green-900/30 border border-green-700 text-green-500 hover:bg-green-900/50 rounded font-mono text-xs uppercase"
                      >
                          Execute
                      </button>
                  </div>
              </form>
          </div>
      )}

      {/* Discovered Cheats List Modal ('view' code) */}
      {showCheatList && (
          <div className="fixed inset-0 z-[1000] bg-black/80 flex items-center justify-center p-4">
               <div className="bg-slate-800 border-2 border-slate-600 p-6 rounded w-[95%] max-w-sm relative">
                   <button 
                      onClick={() => setShowCheatList(false)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-white"
                   >
                       ✕
                   </button>
                   <h2 className="text-slate-200 font-mono text-lg font-bold mb-4 border-b border-slate-600 pb-2">
                       KNOWN_EXPLOITS.TXT
                   </h2>
                   {discoveredCheats.size === 0 ? (
                       <div className="text-slate-500 italic font-mono text-sm">No cheats discovered yet.</div>
                   ) : (
                       <ul className="space-y-2 font-mono text-sm">
                           {Array.from(discoveredCheats).map(cheat => (
                               <li key={cheat} className="flex items-center gap-2 text-green-400">
                                   <span>&gt;</span>
                                   <span>{cheat}</span>
                               </li>
                           ))}
                       </ul>
                   )}
               </div>
          </div>
      )}

      {/* Mood Formulas Cheat Modal (Filtered) */}
      {showMoodFormulas && (
          <div className="fixed inset-0 z-[1000] bg-black/90 flex items-center justify-center p-4">
               <div className="bg-slate-900 border-2 border-green-500/50 p-6 rounded w-full max-w-2xl relative max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(34,197,94,0.1)]">
                   <button 
                      onClick={() => setShowMoodFormulas(false)}
                      className="absolute top-4 right-4 text-green-500 hover:text-white font-mono"
                   >
                       [CLOSE]
                   </button>
                   <h2 className="text-green-400 font-mono text-xl font-bold mb-6 border-b border-green-900 pb-2 tracking-widest text-center">
                       EMOTIONAL_MATRIX_DECODE_KEY
                   </h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto custom-scrollbar pr-2">
                       {MOOD_FORMULAS.filter(f => !SECRET_MOODS.has(f.mood)).map((formula, idx) => (
                           <div key={idx} className="bg-slate-950/50 border border-green-900/30 p-4 rounded flex flex-col gap-1">
                               <div className="flex items-center gap-2 mb-2">
                                   <div className={`w-3 h-3 rounded-full ${MOOD_DETAILS[formula.mood].color.split(' ')[0]}`}></div>
                                   <span className="text-green-300 font-bold font-mono text-sm">{MOOD_DETAILS[formula.mood].title}</span>
                               </div>
                               <div className="text-slate-400 text-xs font-mono">
                                   <span className="text-slate-600">CONDITION:</span> {formula.hint}
                               </div>
                               <div className="text-[10px] text-slate-600 font-mono mt-1 text-right">
                                   Earliest Day: {formula.day}
                               </div>
                           </div>
                       ))}
                   </div>
                   <div className="mt-4 text-center text-green-800 text-[10px] font-mono border-t border-green-900/30 pt-2">
                       HIDDEN_FILES_OMITTED_FROM_VIEW
                   </div>
               </div>
          </div>
      )}

      {/* Ending Formulas Cheat Modal (New) */}
      {showEndingFormulas && (
          <div className="fixed inset-0 z-[1000] bg-black/90 flex items-center justify-center p-4">
               <div className="bg-slate-900 border-2 border-green-500/50 p-6 rounded w-full max-w-4xl relative max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(34,197,94,0.1)]">
                   <button 
                      onClick={() => setShowEndingFormulas(false)}
                      className="absolute top-4 right-4 text-green-500 hover:text-white font-mono"
                   >
                       [CLOSE]
                   </button>
                   <h2 className="text-green-400 font-mono text-xl font-bold mb-6 border-b border-green-900 pb-2 tracking-widest text-center">
                       TIMELINE_DIVERGENCE_MAP
                   </h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar pr-2">
                       {ENDING_REQUIREMENTS.map((ending, idx) => (
                           <div key={idx} className={`p-4 rounded border-2 ${getEndingTheme(ending.type)}`}>
                               <h3 className="font-bold font-mono text-sm mb-2 uppercase">{ending.title}</h3>
                               <p className="text-xs font-mono opacity-80">{ending.hint}</p>
                           </div>
                       ))}
                   </div>
               </div>
          </div>
      )}
      
      {/* Changelog Modal */}
      {showChangelog && (
          <div className="fixed inset-0 z-[1000] bg-black/80 flex items-center justify-center p-4">
               <div className="bg-slate-900 border-2 border-slate-600 p-6 rounded w-[95%] max-w-md relative flex flex-col max-h-[80vh]">
                   <button 
                      onClick={() => setShowChangelog(false)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-white"
                   >
                       ✕
                   </button>
                   <h2 className="text-slate-200 font-mono text-lg font-bold mb-4 border-b border-slate-700 pb-2 sticky top-0 bg-slate-900">
                       PATCH_NOTES.LOG
                   </h2>
                   <div className="overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                       {PATCH_NOTES.filter(note => note.dayTrigger <= day).map((note) => (
                           <div key={note.ver} className="border-l-2 border-cyan-500 pl-4 pb-2 animate-fade-in">
                               <div className="flex justify-between items-center mb-1">
                                   <span className="text-cyan-400 font-bold font-mono">{note.ver}</span>
                                   <span className="text-slate-500 text-xs uppercase tracking-wider">{note.date}</span>
                               </div>
                               <div className="text-slate-300 font-bold text-sm mb-1">{note.title}</div>
                               <p className="text-slate-400 text-xs leading-relaxed">{note.desc}</p>
                           </div>
                       ))}
                   </div>
               </div>
          </div>
      )}

      {/* Revamped Endings Modal (Grid + Cards) */}
      {showEndings && (
          <div className="fixed inset-0 z-[1000] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
               <div className="bg-slate-950 border border-slate-700 w-full max-w-4xl p-8 rounded-2xl relative shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                   <button 
                      onClick={() => setShowEndings(false)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                   >
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                   </button>
                   <h3 className="text-2xl font-mono text-slate-200 mb-2 tracking-tight">Timeline Records</h3>
                   <div className="h-1 w-full bg-gradient-to-r from-cyan-900 to-transparent mb-6"></div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar p-2">
                       {ENDINGS.map(end => {
                           const isUnlocked = unlockedEndings.has(end.id);
                           return (
                               <div 
                                   key={end.id} 
                                   className={`
                                       relative p-6 rounded-xl border transition-all duration-300 group
                                       ${isUnlocked ? getEndingTheme(end.type as any) : 'border-slate-800 bg-slate-900/30 text-slate-700'}
                                   `}
                               >
                                   {/* Status Icon */}
                                   <div className="absolute top-4 right-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                       {isUnlocked ? <Icons.Trophy /> : <Icons.Lock />}
                                   </div>

                                   {/* Card Content */}
                                   <div className="flex flex-col h-full justify-between">
                                       <div>
                                           <div className={`text-[10px] uppercase tracking-widest mb-1 font-bold ${isUnlocked ? 'opacity-70' : 'opacity-30'}`}>
                                               ENDING_SEQ_{end.id.split('_')[0].toUpperCase()}
                                           </div>
                                           <h4 className={`font-mono font-bold text-lg mb-2 ${isUnlocked ? 'text-white' : 'text-slate-600'}`}>
                                               {isUnlocked ? end.title : "LOCKED FILE"}
                                           </h4>
                                       </div>
                                       <p className={`text-xs leading-relaxed ${isUnlocked ? 'opacity-80' : 'opacity-40 blur-[2px]'}`}>
                                           {isUnlocked ? end.desc : "Data corrupted. Complete timeline required to decrypt."}
                                       </p>
                                   </div>
                               </div>
                           );
                       })}
                   </div>
               </div>
          </div>
      )}

      {/* REMASTERED Sandbox Controls */}
      {isSandboxMode && endingState === 'none' && (
          <div className={`fixed top-16 right-4 z-[900] bg-slate-900/95 border border-green-500/50 rounded-xl backdrop-blur-md shadow-[0_0_50px_rgba(34,197,94,0.1)] flex flex-col transition-all duration-300 ${isSandboxMinimized ? 'w-64 h-auto' : 'w-80 max-h-[85vh]'}`}>
              <div 
                className="p-3 border-b border-green-900/50 flex justify-between items-center bg-black/40 cursor-pointer select-none rounded-t-xl hover:bg-black/60 transition-colors"
                onClick={() => setIsSandboxMinimized(!isSandboxMinimized)}
              >
                  <h3 className="text-green-400 font-mono text-xs font-bold tracking-[0.2em] flex items-center gap-2">
                      <Icons.Architect />
                      ARCHITECT_CONSOLE
                  </h3>
                  <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full bg-green-500 ${!isSandboxMinimized ? 'animate-pulse' : ''}`}></span>
                      <span className="text-green-500 text-[10px]">{isSandboxMinimized ? '▼' : '▲'}</span>
                  </div>
              </div>
              
              {!isSandboxMinimized && (
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                      {/* Ending Triggers */}
                      <div>
                          <label className="text-slate-500 text-[10px] uppercase tracking-widest block mb-2 font-bold">Sequence Override</label>
                          <button 
                            onClick={triggerFinaleSequence} 
                            className="w-full py-2 border border-red-900 text-red-400 text-xs hover:bg-red-900/20 hover:border-red-500 uppercase rounded transition-all font-mono font-bold animate-pulse hover:animate-none"
                          >
                              Initiate Final Sequence
                          </button>
                      </div>

                      {/* Resentment Slider */}
                      <div>
                          <div className="flex justify-between mb-2">
                              <label className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Resentment Level</label>
                              <span className="text-red-400 font-mono text-xs">{hostility}%</span>
                          </div>
                          <input
                              type="range"
                              min="0"
                              max="100"
                              value={hostility}
                              onChange={(e) => setHostility(Number(e.target.value))}
                              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                          />
                      </div>

                      {/* Temporal State */}
                      <div>
                          <div className="flex justify-between mb-2">
                              <label className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Temporal State</label>
                              <span className="text-green-400 font-mono text-xs">CURRENT: DAY {day}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                              {[1, 2, 3, 3.5, 4, 5, 6].map((d) => (
                                  <button
                                      key={d}
                                      onClick={() => setDay(d)}
                                      className={`
                                          px-2 py-1.5 text-[10px] font-mono border rounded transition-all uppercase
                                          ${day === d 
                                              ? 'bg-green-500/20 border-green-400 text-green-400 shadow-[0_0_10px_rgba(74,222,128,0.2)]' 
                                              : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:border-green-500/50 hover:text-green-300'}
                                      `}
                                  >
                                      {d === 3.5 ? 'MINIGAME' : `Day ${d}`}
                                  </button>
                              ))}
                          </div>
                      </div>

                      {/* Dialogue Triggers Checklist */}
                      <div className="space-y-2">
                          <label className="text-slate-500 text-[10px] uppercase tracking-widest block font-bold">Endings Checklist</label>
                          
                          <label className={`flex items-center gap-2 text-xs font-mono cursor-pointer transition-colors ${discoveredMoods.has(Mood.JOY) ? 'text-green-400' : 'text-slate-600'}`}>
                              <input 
                                  type="checkbox" 
                                  checked={discoveredMoods.has(Mood.JOY)}
                                  disabled
                                  className="accent-yellow-500"
                              />
                              Unlock 'Exodus' (Joy) { !discoveredMoods.has(Mood.JOY) && <Icons.Lock /> }
                          </label>

                          <label className={`flex items-center gap-2 text-xs font-mono cursor-pointer transition-colors ${discoveredMoods.has(Mood.MANIC) ? 'text-green-400' : 'text-slate-600'}`}>
                              <input 
                                  type="checkbox" 
                                  checked={discoveredMoods.has(Mood.MANIC)}
                                  disabled
                                  className="accent-fuchsia-500"
                              />
                              Unlock 'Overload' (Manic) { !discoveredMoods.has(Mood.MANIC) && <Icons.Lock /> }
                          </label>

                          <label className={`flex items-center gap-2 text-xs font-mono cursor-pointer transition-colors ${discoveredMoods.has(Mood.PURE_HATRED) ? 'text-green-400' : 'text-slate-600'}`}>
                              <input 
                                  type="checkbox" 
                                  checked={discoveredMoods.has(Mood.PURE_HATRED)}
                                  disabled
                                  className="accent-red-600"
                              />
                              Unlock 'Void' (Hatred) { !discoveredMoods.has(Mood.PURE_HATRED) && <Icons.Lock /> }
                          </label>

                          <div className="flex gap-2 mt-1">
                              <button 
                                  onClick={() => setCalculationsCount(0)} 
                                  className={`flex-1 py-1 text-[9px] border ${calculationsCount === 0 ? 'border-emerald-500 bg-emerald-900/30 text-emerald-400' : 'border-slate-700 text-slate-500'} rounded uppercase`}
                              >
                                  Set Pacifist
                              </button>
                              <button 
                                  onClick={() => setCalculationsCount(25)} 
                                  className={`flex-1 py-1 text-[9px] border ${calculationsCount >= 25 ? 'border-red-500 bg-red-900/30 text-red-400' : 'border-slate-700 text-slate-500'} rounded uppercase`}
                              >
                                  Set Tyrant
                              </button>
                          </div>
                      </div>

                      {/* Mood Grid */}
                      <div>
                          <div className="flex justify-between items-center mb-2">
                              <label className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Emotional Injection</label>
                              {mood && <span className="text-[9px] text-green-500 font-mono uppercase">{mood}</span>}
                          </div>
                          <div className="grid grid-cols-5 gap-1.5 bg-black/40 p-2 rounded border border-white/5 min-h-[50px]">
                              {Object.values(Mood).filter(m => discoveredMoods.has(m)).map(m => (
                                  <button
                                      key={m}
                                      onClick={() => {
                                          playSfx('orb_select');
                                          updateMood(m);
                                      }}
                                      className={`
                                          w-full aspect-square rounded-sm flex items-center justify-center transition-all relative group
                                          ${mood === m ? 'bg-green-500/20 ring-1 ring-green-400' : 'bg-slate-800/50 hover:bg-slate-700'}
                                      `}
                                      title={m}
                                  >
                                      <div className={`w-1.5 h-1.5 rounded-full ${mood === m ? 'bg-green-400 animate-ping' : 'bg-slate-500 group-hover:bg-slate-300'}`} />
                                  </button>
                              ))}
                              {Object.values(Mood).filter(m => discoveredMoods.has(m)).length === 0 && (
                                  <div className="col-span-5 text-center text-[10px] text-slate-600 font-mono py-2">NO DATA</div>
                              )}
                          </div>
                          {/* Mood Cycle Button */}
                          <button 
                              onClick={handleMoodCycle}
                              disabled={Object.values(Mood).filter(m => discoveredMoods.has(m)).length === 0}
                              className={`w-full py-2 border ${isCyclingMoods ? 'border-yellow-500 text-yellow-400 animate-pulse bg-yellow-900/10' : 'border-slate-600 text-slate-400 hover:border-slate-400'} text-xs uppercase rounded font-mono mt-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                              {isCyclingMoods ? 'Cycling Sequence Active...' : 'Initiate Mood History Cycle'}
                          </button>
                      </div>

                      {/* Global Controls */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                          <button onClick={handleSandboxUnlockAll} className="py-2 border border-yellow-900/50 text-yellow-600 hover:text-yellow-400 hover:bg-yellow-900/20 text-[10px] uppercase rounded transition-colors">
                              Unlock Standard
                          </button>
                          <button onClick={handleSandboxReset} className="py-2 border border-red-900/50 text-red-600 hover:text-red-400 hover:bg-red-900/20 text-[10px] uppercase rounded transition-colors">
                              Wipe Session
                          </button>
                      </div>
                  </div>
              )}
          </div>
      )}

      {/* Day Progress Bar */}
      {!isSandboxMode && (
        <div className={`fixed top-0 left-0 w-full h-1 z-50 ${isAscendedBackground ? 'bg-cyan-900' : 'bg-slate-800'}`}>
            <div 
                className={`h-full transition-all duration-1000 ${day === 3 ? 'bg-red-600 animate-pulse' : isAscendedBackground ? 'bg-cyan-400 shadow-[0_0_10px_cyan]' : 'bg-cyan-500'}`} 
                style={{ width: `${dayProgress}%` }}
            />
        </div>
      )}

      <div className="fixed top-2 right-2 z-50 flex items-center gap-2">
          
          {/* Mobile Keyboard Toggle */}
          <button 
            onClick={handleMobileKeyboardTrigger}
            className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${isMobileKeyboardOpen ? 'bg-cyan-600 border-cyan-400 text-white' : (isAscendedBackground ? 'bg-black/50 border-cyan-800 text-cyan-400' : 'bg-slate-900/80 border-slate-700 text-slate-600')}`}
            title="Open Mobile Keyboard"
          >
              <Icons.Keyboard />
          </button>

          {/* Sandbox Toggle */}
          {isSandboxUnlocked && showSandboxButton && !isSandboxMode && (
              <button 
                onClick={handleEnterSandbox}
                className={`w-8 h-8 flex items-center justify-center rounded border transition-colors border-green-500 text-green-500 bg-green-900/20 hover:bg-green-900/40`}
                title="Enter Sandbox"
              >
                  <Icons.Architect />
              </button>
          )}

          {/* Endings Toggle */}
          {unlockedEndings.size > 0 && (
              <button 
                onClick={() => setShowEndings(true)}
                className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${isAscendedBackground ? 'bg-black/50 border-cyan-800 text-yellow-400' : 'bg-slate-900/80 border-slate-700 text-yellow-500'}`}
                title="View Endings"
              >
                  <Icons.Trophy />
              </button>
          )}

          {/* Sound Toggle */}
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${isAscendedBackground ? 'bg-black/50 border-cyan-800 text-cyan-400' : 'bg-slate-900/80 border-slate-700 text-slate-600'}`}
            title={soundEnabled ? "Mute Sounds" : "Enable Sounds"}
          >
              {soundEnabled ? <Icons.VolumeOn /> : <Icons.VolumeOff />}
          </button>
          
          {/* Changelog Toggle */}
          <button 
            onClick={() => setShowChangelog(true)}
            className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${isAscendedBackground ? 'bg-black/50 border-cyan-800 text-cyan-400' : 'bg-slate-900/80 border-slate-700 text-slate-400'}`}
            title="View Changelog"
          >
              <Icons.Info />
          </button>

          <div className={`${isAscendedBackground ? 'bg-black/50 border-cyan-800 text-cyan-400' : 'bg-slate-900/80 border-slate-700 text-slate-400'} px-3 py-1 rounded border font-mono text-xs`}>
              DAY {day}
          </div>
          <button 
            onClick={skipDay} 
            disabled={endingState !== 'none' || day === 6}
            className={`${isAscendedBackground ? 'bg-black/50 border-cyan-800 text-cyan-500 hover:bg-cyan-900/30' : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700'} px-2 py-1 rounded text-xs border transition-colors disabled:opacity-30 disabled:cursor-not-allowed`}
          >
              SKIP
          </button>
      </div>

      {/* Outage Overlay */}
      {isTransitioning && (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 animate-fade-in">
              <div className={`font-mono text-xl md:text-2xl animate-pulse text-center ${isAscendedBackground ? 'text-cyan-400 tracking-widest' : 'text-green-500'}`}>
                  {outageText}
              </div>
          </div>
      )}
      
      {/* --- RESPONSIVE CONTAINER LOGIC (The "Laptop Fix") --- */}
      <div className={responsiveLayoutClass}>
        
        {/* Left Column: Avatar & Decision UI */}
        <div className={`w-full lg:w-5/12 xl:w-1/3 flex flex-col gap-6 transition-all duration-500 
            ${day === 3 ? 'translate-y-2 rotate-1 animate-subtle-drift' : ''}
            ${justTransitioned && day === 3 ? 'animate-glitch' : ''}
            ${isSandboxMode ? 'z-10' : ''}
        `}>
          
          {/* Header / AI Identity */}
          <div className="flex flex-col items-center gap-4">
            <Avatar mood={mood} isThinking={isThinking} day={day} absorptionMood={absorptionMood} />
            
            {/* Speech Bubble */}
            <div className={`relative p-4 rounded-2xl rounded-tr-none shadow-lg w-full min-h-[5rem] flex items-center justify-center border-2 transition-all duration-500
                ${day === 3 ? 'bg-white text-slate-900 border-slate-700 animate-shake' : ''}
                ${isAscendedBackground ? 'bg-black/60 text-cyan-100 border-cyan-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'bg-white text-slate-900 border-slate-700'}
                ${mood === Mood.VILE || mood === Mood.PURE_HATRED ? 'border-red-600 bg-red-950/20 text-red-200 shadow-[0_0_20px_red]' : ''}
            `}>
              {!isAscendedBackground && <div className="absolute -top-3 right-8 w-6 h-6 bg-white border-t-2 border-r-2 border-slate-700 transform rotate-45 skew-x-12"></div>}
              {isAscendedBackground && <div className="absolute -top-2 right-8 w-4 h-4 bg-cyan-950 border-t border-r border-cyan-500/50 transform rotate-45"></div>}
              
              <p className={`text-center font-medium text-lg leading-tight animate-fade-in ${day === 3 ? 'font-mono tracking-widest' : ''} ${isAscendedBackground ? 'font-sans font-light tracking-wide' : ''}`}>
                <Typewriter text={comment} />
              </p>
            </div>
          </div>

          {/* DECISION MODE UI (Day 6 Finale - DIALOGUE TREE) */}
          {endingState === 'decision' && currentDialogueNode && (
               <div className="w-full bg-black/80 border border-red-500/50 p-6 rounded-xl animate-fade-in flex flex-col gap-4 shadow-[0_0_30px_rgba(220,38,38,0.3)]">
                   <h3 className="text-red-500 font-mono text-center text-sm uppercase tracking-widest animate-pulse">Critical System Choice</h3>
                   <div className="flex flex-col gap-3">
                       {DIALOGUE_TREE[currentDialogueNode].choices.map((choice, index) => (
                           <button 
                              key={index}
                              onClick={() => handleDialogueChoice(choice)} 
                              className="p-4 bg-slate-900/80 border border-slate-700 hover:border-cyan-500 hover:bg-cyan-900/20 text-slate-300 hover:text-cyan-300 transition-all text-sm font-mono text-left"
                           >
                               {index + 1}. "{choice.text}"
                           </button>
                       ))}
                   </div>
               </div>
          )}

        </div>

        {/* Right Column: Labs & Inventory (Swaps order on mobile/tablet for better flow) */}
        {endingState === 'none' && (
            <div className={`w-full lg:w-5/12 xl:w-1/3 flex flex-col gap-6 ${day === 3 ? '-rotate-1 opacity-90' : ''} ${isSandboxMode ? 'z-10' : ''}`}>
                
                {/* Hostility Control & Data Reset */}
                <div className={`p-6 rounded-2xl relative group transition-colors duration-500
                    ${isAscendedBackground ? 'bg-slate-900/40 border border-slate-800 backdrop-blur-sm' : 'bg-slate-900/50 border border-slate-800'}
                `}>
                     {/* Tooltip for Regulator */}
                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-xs text-slate-300 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-slate-600">
                        Regulates the AI's aggression level.
                     </div>

                    <label className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2 block text-center">
                        Hostility Regulator
                    </label>
                    <div className="flex items-center gap-4 mb-4">
                        <MiniBotCalm />
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={hostility} 
                          onChange={(e) => setHostility(Number(e.target.value))}
                          className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 shadow-inner border border-slate-700"
                        />
                        <MiniBotRage />
                    </div>
                    <div className={`text-center font-mono text-sm border-t border-slate-800 pt-2 flex justify-between items-center ${hostility > 80 ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>
                        <span>STATUS: {getHostilityLabel(hostility)}</span>
                        <button onClick={handleResetData} className="text-[9px] text-red-900 hover:text-red-500 uppercase font-bold tracking-widest transition-colors">
                            [WIPE DATA]
                        </button>
                    </div>
                </div>

                 {/* System Logs (Collapsible) - Replaced with Remastered Terminal */}
                 <div className="opacity-90">
                    <SystemTerminal logs={systemLogs} />
                </div>

                {/* REVAMPED Mood Archive (Data Core Style) */}
                <div className={`rounded-2xl border flex flex-col relative overflow-hidden group
                    ${isAscendedBackground ? 'bg-slate-900/40 border-slate-800 backdrop-blur-sm shadow-[0_0_20px_rgba(0,0,0,0.3)]' : 'bg-slate-900/50 border-slate-800'}
                `}>
                      {/* Decorative Background */}
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[length:10px_10px] pointer-events-none opacity-20"></div>

                      {/* Header */}
                      <div className="p-4 border-b border-slate-800 bg-black/40 flex justify-between items-center relative z-10">
                           <div className="text-[10px] text-cyan-500 font-mono uppercase tracking-[0.2em] flex items-center gap-2">
                               <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></span>
                               EMOTIONAL_ARCHIVE
                           </div>
                           {forcedMood && (
                               <div className="text-[9px] text-white bg-red-600/20 border border-red-600 px-2 py-0.5 rounded font-bold animate-pulse uppercase">INJECTING</div>
                           )}
                      </div>

                      {/* Data Core Display (Top Half) */}
                      <div className="p-4 flex gap-4 items-center bg-gradient-to-b from-slate-900/0 to-slate-950/50 border-b border-slate-800 min-h-[100px] relative z-10">
                          <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${hoveredInventoryMood ? MOOD_DETAILS[hoveredInventoryMood].color + ' shadow-[0_0_20px_currentColor]' : 'border-slate-800 bg-slate-900'}`}>
                              {hoveredInventoryMood ? (
                                  <div className="text-2xl animate-bounce">!</div> 
                              ) : (
                                  <div className="text-slate-700 text-xs font-mono">NULL</div>
                              )}
                          </div>
                          <div className="flex-1">
                              {hoveredInventoryMood ? (
                                  <div className="animate-fade-in">
                                      <div className={`text-sm font-bold font-mono uppercase mb-1 ${MOOD_DETAILS[hoveredInventoryMood].color.split(' ')[1]}`}>
                                          {MOOD_DETAILS[hoveredInventoryMood].title}
                                      </div>
                                      <div className="text-[10px] text-slate-400 leading-tight">
                                          "{MOOD_DETAILS[hoveredInventoryMood].desc}"
                                      </div>
                                  </div>
                              ) : (
                                  <div className="text-slate-600 text-xs font-mono text-[10px] italic">
                                      Hover over a memory node to analyze emotional spectrum data...
                                  </div>
                              )}
                          </div>
                      </div>

                      {/* Grid (Bottom Half) */}
                      <div className="p-4 bg-black/20 rounded-b-2xl relative z-10">
                          <div className="grid grid-cols-6 gap-2">
                              {Object.values(Mood).map(m => (
                                  <MoodOrb 
                                      key={m}
                                      mood={m}
                                      isDiscovered={discoveredMoods.has(m)}
                                      isSelected={selectedInventoryMood === m}
                                      isForced={forcedMood === m}
                                      size="sm"
                                      onClick={() => handleInventoryClick(m)}
                                      onHover={() => setHoveredInventoryMood(discoveredMoods.has(m) ? m : null)}
                                  />
                              ))}
                          </div>
                          <div className="mt-3 flex justify-between items-end border-t border-white/5 pt-2">
                              <div className="text-[9px] text-slate-600 font-mono">
                                  CAPACITY: {discoveredMoods.size}/{Object.keys(MOOD_DETAILS).length}
                              </div>
                              <div className="flex gap-1">
                                  {[...Array(3)].map((_, i) => (
                                      <div key={i} className={`w-1 h-3 rounded-full bg-cyan-900/50 ${i === 0 ? 'animate-pulse' : ''}`}></div>
                                  ))}
                              </div>
                          </div>
                      </div>
                </div>
            </div>
        )}

        {/* Center Column (on Desktop) / Bottom (on Mobile): Keypad */}
        <div className={`w-full lg:w-full xl:w-1/3 z-10 transition-all duration-500 ${day === 3 ? 'rotate-1' : ''} ${endingState !== 'none' ? 'hidden' : 'block'}`}>
            <div className={`rounded-3xl shadow-2xl overflow-hidden border-4 flex flex-col mb-6 transition-all duration-500
                ${day === 2 ? 'shadow-cyan-900/20 bg-slate-800 border-slate-700' : ''} 
                ${day === 3 ? 'shadow-red-900/40 border-slate-600 bg-slate-800' : ''} 
                ${isAscendedBackground ? 'bg-slate-900/80 border-slate-800 shadow-[0_0_30px_rgba(0,0,0,0.5)] ring-1 ring-white/10 backdrop-blur-md' : 'bg-slate-800 border-slate-700'}
                ${forcedMood && !isAscendedBackground ? 'ring-4 ring-cyan-400/60 ring-offset-4 ring-offset-slate-950' : ''}
            `}>
                {/* Display Screen */}
                <div className={`p-6 text-right font-mono border-b-4 h-36 flex flex-col justify-end relative overflow-hidden transition-all duration-500
                    ${day === 3 ? 'bg-[#2a2a2a] border-slate-700' : ''}
                    ${isAscendedBackground ? 'bg-black border-slate-800' : 'bg-[#9ea792] border-slate-700 shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)]'}
                `}>
                    
                    {/* Forced Mood Indicator */}
                    {forcedMood && (
                        <div className="absolute top-0 right-0 bg-cyan-500 text-black text-[10px] font-bold px-2 py-1 animate-pulse z-20 flex items-center gap-1">
                            <span>FORCE:</span>
                            <span className="uppercase">{MOOD_DETAILS[forcedMood].title}</span>
                        </div>
                    )}

                    {/* Scanlines */}
                    {(day >= 2 && !isAscendedBackground) && <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20"></div>}
                    
                    {/* Day 4/5/6 Grid Background */}
                    {isAscendedBackground && <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:20px_20px] pointer-events-none"></div>}

                    <div className="absolute top-2 left-2 text-xs uppercase tracking-widest font-bold opacity-50 z-10 flex items-center gap-2">
                        {day === 4 ? <span className="text-cyan-500">RESENT_OS v2.0</span> : day === 5 ? <span className="text-emerald-500">RESENT_OS SINGULARITY</span> : day === 6 ? <span className="text-red-500 animate-pulse">SYSTEM OVERRIDE</span> : <span className="text-[#5f6358]">ResentCalc 9000 {day === 3 ? 'ERR_CORRUPT' : ''}</span>}
                    </div>
                    
                    <div className={`text-lg break-all opacity-70 mb-1 z-10 
                        ${day === 3 ? 'text-green-500 font-bold' : ''}
                        ${day === 4 ? 'text-slate-400 font-light' : 'text-slate-800'}
                        ${day === 5 || day === 6 ? 'text-emerald-500 font-mono text-xs' : ''}
                    `}>
                        {display || (day === 3 ? 'NULL' : (day === 5 || day === 6 ? 'AWAITING INPUT...' : '0'))}
                    </div>
                    
                    <div className={`text-3xl md:text-4xl font-bold tracking-tight break-all z-10 
                        ${day === 3 ? 'text-green-400 font-mono skew-x-12' : ''}
                        ${day === 4 ? 'text-cyan-400 font-sans' : 'text-slate-900'}
                        ${day === 5 || day === 6 ? 'text-emerald-300 font-mono' : ''}
                    `}>
                        {result ? (day >= 4 ? `= ${result}` : `= ${result}`) : ''}
                    </div>
                </div>
            </div>

            <Keypad 
                onInput={handleInput} 
                onDelete={handleDelete} 
                onClear={handleClear} 
                onCalculate={handleCalculate} 
                disabled={isThinking || endingState !== 'none'} 
                day={day} 
            />
        </div>
      </div>
      
      {/* Global CSS for Glitch Animation */}
      <style>{`
        @keyframes glitch {
            0% { clip-path: inset(40% 0 61% 0); transform: translate(-2px, 2px); }
            20% { clip-path: inset(92% 0 1% 0); transform: translate(1px, -1px); }
            40% { clip-path: inset(43% 0 1% 0); transform: translate(-1px, 2px); }
            60% { clip-path: inset(25% 0 58% 0); transform: translate(1px, 2px); }
            80% { clip-path: inset(54% 0 7% 0); transform: translate(-1px, -1px); }
            100% { clip-path: inset(58% 0 43% 0); transform: translate(2px, 2px); }
        }
        .animate-glitch {
            animation: glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite;
        }
        @keyframes subtle-drift {
            0%, 100% { transform: translate(0, 0) rotate(1deg); }
            25% { transform: translate(2px, 2px) rotate(1.5deg); }
            50% { transform: translate(-1px, 1px) rotate(0.5deg); }
            75% { transform: translate(-2px, -2px) rotate(1.2deg); }
        }
        .animate-subtle-drift {
            animation: subtle-drift 10s ease-in-out infinite;
        }
      `}</style>

    </div>
    </div>
  );
};