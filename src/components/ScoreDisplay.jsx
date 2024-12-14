import { useEffect, useRef } from 'react';

// Global singleton to hold score update function
let globalScoreUpdater = null;

/**
 * Circular Progress Bar Component with smooth animation
 * Uses direct DOM manipulation - never re-renders
 */
function CircularProgressBar({ size = 32, strokeWidth = 3, className = "" }) {
    const circleRef = useRef(null);
    const textRef = useRef(null);

    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    useEffect(() => {
        // Register global updater function
        globalScoreUpdater = (percentage) => {
            if (circleRef.current && textRef.current) {
                const strokeDashoffset = circumference - ((percentage || 0) / 100) * circumference;
                circleRef.current.style.strokeDashoffset = strokeDashoffset;
                textRef.current.textContent = `${Math.round(percentage || 0)}%`;
            }
        };

        return () => {
            globalScoreUpdater = null;
        };
    }, [circumference]);

    return (
        <div className={`relative ${className}`} style={{ width: size, height: size }}>
            <svg
                width={size}
                height={size}
                className="transform -rotate-90"
                style={{ overflow: 'visible' }}
            >
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    className="opacity-20"
                />
                {/* Progress circle - direct DOM manipulation, CSS transition */}
                <circle
                    ref={circleRef}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference}
                    strokeLinecap="round"
                    style={{
                        transition: 'stroke-dashoffset 0.8s ease-in-out',
                    }}
                />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center">
                <span ref={textRef} className="text-[8px] font-medium">0%</span>
            </div>
        </div>
    );
}

/**
 * Global function to update score from anywhere
 */
export function updateScore(completed, total) {
    const event = new CustomEvent('scoreUpdate', {
        detail: { completed, total }
    });
    window.dispatchEvent(event);
}

/**
 * ScoreDisplay component - mounted once in Toolbar, receives updates via events
 */
export function ScoreDisplay() {
    const scoreTextRef = useRef(null);

    useEffect(() => {
        // Listen for score update events
        const handleScoreUpdate = (event) => {
            const { completed, total } = event.detail;
            const completionRate = total > 0 ? (completed / total) * 100 : 0;

            // Update progress bar via global function
            if (globalScoreUpdater) {
                globalScoreUpdater(completionRate);
            }

            // Update score text directly
            if (scoreTextRef.current) {
                scoreTextRef.current.textContent = `${completed}/${total}`;
            }
        };

        window.addEventListener('scoreUpdate', handleScoreUpdate);

        // Request initial update after mount
        setTimeout(() => {
            const initEvent = new CustomEvent('requestScoreUpdate');
            window.dispatchEvent(initEvent);
        }, 100);

        return () => window.removeEventListener('scoreUpdate', handleScoreUpdate);
    }, []);

    return (
        <div className="flex items-center gap-3 text-sm">
            <CircularProgressBar size={32} strokeWidth={3} />
            <span ref={scoreTextRef} className="font-medium hidden">0/0</span>
        </div>
    );
}