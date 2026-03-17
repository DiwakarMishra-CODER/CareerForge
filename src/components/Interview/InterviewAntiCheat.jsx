import { useState, useEffect, useRef, useCallback } from 'react';
import { AlertTriangle, ShieldX, Volume2 } from 'lucide-react';

export default function InterviewAntiCheat({
    isActive = true,
    onCheated,
    onWarning
}) {
    const [warningCount, setWarningCount] = useState(0);
    const [showWarning, setShowWarning] = useState(false);
    const [showTerminated, setShowTerminated] = useState(false);

    const handleViolation = useCallback((type) => {
        if (!isActive || showTerminated) return;

        const newWarningCount = warningCount + 1;
        setWarningCount(newWarningCount);

        if (newWarningCount === 1) {
            setShowWarning(true);
            onWarning?.(type);
        } else {
            setShowWarning(false);
            setShowTerminated(true);
            onCheated?.();
        }
    }, [isActive, warningCount, showTerminated, onWarning, onCheated]);

    const handleReturnToFullscreen = useCallback(async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            }
            setShowWarning(false);
        } catch (e) {
            console.error('Failed to enter fullscreen:', e);
        }
    }, []);

    useEffect(() => {
        if (!isActive) return;

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement && isActive && !showTerminated) {
                handleViolation('fullscreen_exit');
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, [isActive, showTerminated, handleViolation]);

    useEffect(() => {
        if (!isActive) return;

        const handleVisibilityChange = () => {
            if (document.hidden && isActive && !showTerminated && !showWarning) {
                handleViolation('tab_switch');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isActive, showTerminated, showWarning, handleViolation]);

    if (showWarning) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-red-900/95 backdrop-blur-md">
                <div className="w-full max-w-2xl mx-4 text-center">
                    <div className="bg-black/50 border-2 border-red-500 rounded-2xl p-8">
                        <h1 className="text-4xl font-black text-red-400 mb-4">⚠️ FINAL WARNING</h1>
                        <p className="text-white text-lg mb-6">You left fullscreen mode or switched tabs!</p>
                        <div className="bg-red-950/50 border border-red-700 rounded-xl p-4 mb-6">
                            <p className="text-red-300">If you do this again, your interview will be <b>TERMINATED</b>.</p>
                        </div>
                        <button
                            onClick={handleReturnToFullscreen}
                            className="w-full py-4 bg-red-600 text-white font-black text-lg rounded-xl flex items-center justify-center gap-3"
                        >
                            <Volume2 className="w-5 h-5" />
                            Return to Fullscreen NOW
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (showTerminated) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/98 backdrop-blur-lg">
                <div className="w-full max-w-xl mx-4 text-center">
                    <div className="bg-black/90 border border-red-900 rounded-2xl p-6">
                        <ShieldX className="w-16 h-16 text-red-500 mx-auto mb-6" />
                        <h1 className="text-2xl font-bold text-red-400 mb-2">Interview Terminated</h1>
                        <p className="text-gray-300 mb-6">You broke the interview rules. This session is now void.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-3 bg-gray-800 text-gray-300 font-bold rounded-lg"
                        >
                            Return to Selection
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
