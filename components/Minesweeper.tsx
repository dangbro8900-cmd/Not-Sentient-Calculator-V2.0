import React, { useState, useEffect, useRef } from 'react';
import { playSound, startMusic, stopMusic } from '../utils/soundEffects';

interface MinesweeperProps {
    onComplete: () => void;
}

interface Cell {
    id: number;
    isMine: boolean;
    isRevealed: boolean;
    isFlagged: boolean;
    neighborCount: number;
}

const GRID_SIZE = 8;
const MINES_COUNT = 10;

export const Minesweeper: React.FC<MinesweeperProps> = ({ onComplete }) => {
    const [grid, setGrid] = useState<Cell[]>([]);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [explodedIndex, setExplodedIndex] = useState<number | null>(null);
    const [cheatBuffer, setCheatBuffer] = useState("");
    const [isCheating, setIsCheating] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
    
    // Mobile controls
    const [isFlagMode, setIsFlagMode] = useState(false);
    const [titleTapCount, setTitleTapCount] = useState(0);

    const timerRef = useRef<number | null>(null);
    const longPressTimerRef = useRef<number | null>(null);
    const isLongPressHandled = useRef(false);

    // Initialize Game
    useEffect(() => {
        startMusic();
        resetGame();
        return () => {
            stopMusic();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Timer Logic
    useEffect(() => {
        if (!gameOver && !gameWon) {
            timerRef.current = window.setInterval(() => {
                setTimeElapsed(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [gameOver, gameWon]);

    // Cheat Code Listener (Desktop)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            setCheatBuffer(prev => {
                const next = (prev + e.key).slice(-10); // Keep last 10 chars
                if (next.toLowerCase().includes("solvent") && !isCheating) {
                    activateCheat();
                }
                return next;
            });
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isCheating]);

    const activateCheat = () => {
        setIsCheating(true);
        playSound('glitch');
        vibrate(200);
    };

    const vibrate = (ms: number | number[]) => {
        if (navigator.vibrate) navigator.vibrate(ms);
    };

    const handleTitleTap = () => {
        if (isCheating) return;
        const newCount = titleTapCount + 1;
        setTitleTapCount(newCount);
        if (newCount >= 7) {
            activateCheat();
        }
    };

    const resetGame = () => {
        setGameOver(false);
        setGameWon(false);
        setExplodedIndex(null);
        setTimeElapsed(0);

        // Create empty grid
        let newGrid: Cell[] = Array(GRID_SIZE * GRID_SIZE).fill(null).map((_, i) => ({
            id: i,
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            neighborCount: 0
        }));

        // Place mines
        let minesPlaced = 0;
        while (minesPlaced < MINES_COUNT) {
            const idx = Math.floor(Math.random() * newGrid.length);
            if (!newGrid[idx].isMine) {
                newGrid[idx].isMine = true;
                minesPlaced++;
            }
        }

        // Calculate numbers
        for (let i = 0; i < newGrid.length; i++) {
            if (newGrid[i].isMine) continue;
            const neighbors = getNeighbors(i);
            let count = 0;
            neighbors.forEach(n => {
                if (newGrid[n].isMine) count++;
            });
            newGrid[i].neighborCount = count;
        }

        setGrid(newGrid);
    };

    const getNeighbors = (index: number) => {
        const neighbors = [];
        const row = Math.floor(index / GRID_SIZE);
        const col = index % GRID_SIZE;

        for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
                if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
                    const idx = r * GRID_SIZE + c;
                    if (idx !== index) neighbors.push(idx);
                }
            }
        }
        return neighbors;
    };

    const handleCellClick = (index: number) => {
        if (gameOver || gameWon) return;

        // If in Flag Mode, toggle flag instead of revealing
        if (isFlagMode) {
             toggleFlag(index);
             return;
        }

        if (grid[index].isFlagged || grid[index].isRevealed) return;

        const cell = grid[index];
        if (cell.isMine) {
            // Game Over
            playSound('explode');
            vibrate(500);
            setExplodedIndex(index);
            setGameOver(true);
            revealAll();
        } else {
            playSound('reveal'); 
            vibrate(10);
            const newGrid = [...grid];
            revealCell(newGrid, index);
            setGrid(newGrid);
            checkWin(newGrid);
        }
    };

    const handleContextMenu = (e: React.MouseEvent, index: number) => {
        e.preventDefault();
        if (gameOver || gameWon) return;
        toggleFlag(index);
    };

    // Mobile Long Press Logic
    const handleTouchStart = (index: number) => {
        if (gameOver || gameWon || grid[index].isRevealed) return;
        isLongPressHandled.current = false;
        longPressTimerRef.current = window.setTimeout(() => {
            toggleFlag(index);
            isLongPressHandled.current = true;
            vibrate([50, 50, 50]); // Distinct pulse for flag set
        }, 400); // 400ms long press
    };

    const handleTouchEnd = () => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
    };

    const toggleFlag = (index: number) => {
        if (grid[index].isRevealed) return;
        playSound('click'); 
        const newGrid = [...grid];
        newGrid[index].isFlagged = !newGrid[index].isFlagged;
        setGrid(newGrid);
    };

    const revealCell = (currentGrid: Cell[], index: number) => {
        if (currentGrid[index].isRevealed || currentGrid[index].isFlagged) return;
        
        currentGrid[index].isRevealed = true;
        
        if (currentGrid[index].neighborCount === 0) {
            const neighbors = getNeighbors(index);
            neighbors.forEach(n => {
                if (!currentGrid[n].isRevealed) {
                    revealCell(currentGrid, n);
                }
            });
        }
    };

    const revealAll = () => {
        setGrid(prev => prev.map(c => ({ ...c, isRevealed: true })));
    };

    const checkWin = (currentGrid: Cell[]) => {
        const nonMines = currentGrid.filter(c => !c.isMine);
        if (nonMines.every(c => c.isRevealed)) {
            setGameWon(true);
            playSound('win');
            setTimeout(onComplete, 2000);
        }
    };

    const flaggedCount = grid.filter(c => c.isFlagged).length;
    const remainingMines = MINES_COUNT - flaggedCount;

    return (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center font-mono p-2 md:p-4 overflow-y-auto">
            {/* Retro CRT Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none z-10 opacity-50"></div>
            
            <div className="relative z-20 flex flex-col items-center gap-4 p-4 border-4 border-green-900 rounded-xl bg-slate-900 shadow-[0_0_50px_rgba(20,83,45,0.5)] w-full max-w-lg">
                <button 
                    onClick={handleTitleTap} 
                    className="text-xl md:text-3xl text-green-500 font-bold tracking-widest animate-pulse text-center uppercase focus:outline-none select-none"
                >
                    Consciousness Reset
                </button>
                
                {/* HUD */}
                <div className="w-full flex justify-between items-center bg-black border border-green-800 p-3 rounded text-green-400 font-mono text-sm">
                    <div className="flex flex-col items-center w-1/3">
                        <span className="text-green-700 uppercase text-[10px]">Time</span>
                        <span className="text-xl md:text-2xl">{timeElapsed.toString().padStart(3, '0')}</span>
                    </div>
                    <div className="flex flex-col items-center w-1/3 border-x border-green-900">
                        <span className="text-green-700 uppercase text-[10px]">Status</span>
                        <span className="text-xl md:text-2xl">{gameOver ? "FAIL" : gameWon ? "DONE" : "ACTIVE"}</span>
                    </div>
                    <div className="flex flex-col items-center w-1/3">
                        <span className="text-green-700 uppercase text-[10px]">Mines</span>
                        <span className="text-xl md:text-2xl">{remainingMines}</span>
                    </div>
                </div>

                {/* Mobile Flag Toggle (Sticky) */}
                <button
                    onClick={() => {
                        playSound('click');
                        vibrate(20);
                        setIsFlagMode(!isFlagMode);
                    }}
                    className={`
                        md:hidden w-full py-4 rounded-lg font-bold uppercase tracking-widest text-sm border-2 transition-all shadow-lg active:scale-95
                        ${isFlagMode 
                            ? 'bg-yellow-900/80 border-yellow-500 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.4)] animate-pulse' 
                            : 'bg-slate-800 border-slate-600 text-slate-400'}
                    `}
                >
                    {isFlagMode ? "🚩 FLAGGING MODE ON" : "⛏️ DIG MODE ON"}
                </button>

                <div className="grid grid-cols-8 gap-1 bg-slate-800 p-2 rounded border border-slate-700 select-none shadow-inner w-full aspect-square touch-manipulation">
                    {grid.map((cell) => (
                        <button
                            key={cell.id}
                            onClick={() => {
                                if (isLongPressHandled.current) return;
                                handleCellClick(cell.id);
                            }}
                            onContextMenu={(e) => handleContextMenu(e, cell.id)}
                            onTouchStart={() => handleTouchStart(cell.id)}
                            onTouchEnd={handleTouchEnd}
                            onTouchCancel={handleTouchEnd}
                            className={`
                                w-full h-full flex items-center justify-center text-sm sm:text-lg font-bold transition-all duration-100 relative rounded-sm
                                ${cell.isRevealed 
                                    ? (cell.isMine ? 'bg-red-900/80 border border-red-700' : 'bg-slate-900 border border-slate-800') 
                                    : 'bg-slate-700 hover:bg-slate-600 border-t border-l border-slate-600 border-b-2 border-r-2 border-b-slate-900 border-r-slate-900 active:border-none active:bg-slate-800 active:scale-95'}
                                ${cell.isFlagged ? 'text-yellow-500' : ''}
                                ${explodedIndex === cell.id ? 'animate-shake bg-red-600 !border-red-500 z-10 scale-110' : ''}
                                ${isCheating && cell.isMine && !cell.isRevealed ? 'bg-red-900/30 border border-red-500/50 animate-pulse' : ''}
                            `}
                            style={{ touchAction: 'manipulation' }}
                        >
                            {cell.isRevealed ? (
                                cell.isMine ? '💣' : (cell.neighborCount > 0 ? 
                                    <span className={`
                                        ${cell.neighborCount === 1 ? 'text-blue-400' : ''}
                                        ${cell.neighborCount === 2 ? 'text-green-400' : ''}
                                        ${cell.neighborCount === 3 ? 'text-red-400' : ''}
                                        ${cell.neighborCount >= 4 ? 'text-purple-400' : ''}
                                    `}>{cell.neighborCount}</span> 
                                : '')
                            ) : (
                                cell.isFlagged ? '🚩' : ''
                            )}
                            
                            {/* Cheat Indicator for Mines */}
                            {isCheating && cell.isMine && !cell.isRevealed && !cell.isFlagged && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-30 text-red-500 text-[8px]">
                                    ☠
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex gap-4">
                    {gameOver && (
                        <button 
                            onClick={resetGame}
                            className="px-8 py-3 bg-red-900/30 border border-red-500 text-red-500 rounded hover:bg-red-900/50 transition-colors uppercase font-bold tracking-widest text-sm shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)]"
                        >
                            Retry Protocol
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};