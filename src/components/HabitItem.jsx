import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import * as Icons from 'lucide-react';

const HabitItem = React.memo(({ habit, isCompleted, onToggle }) => {
    const IconComponent = Icons[habit.icon];
    const [isOptimisticallyCompleted, setIsOptimisticallyCompleted] = useState(isCompleted);
    const [isAnimating, setIsAnimating] = useState(false);

    React.useEffect(() => {
        setIsOptimisticallyCompleted(isCompleted);
    }, [isCompleted]);

    const handleToggle = useCallback(async (e) => {
        if (e) {
            e.stopPropagation();
        }

        setIsOptimisticallyCompleted(prev => !prev);
        setIsAnimating(true);

        try {
            await onToggle(habit.id);
        } catch (error) {
            setIsOptimisticallyCompleted(isCompleted);
            console.error('Failed to toggle habit:', error);
        } finally {
            setTimeout(() => setIsAnimating(false), 300);
        }
    }, [habit.id, onToggle, isCompleted]);

    const habitColor = habit.color || '#838383ff';

    return (
        <div
            className={cn(
                "flex items-center gap-3 p-4 rounded-lg",
                "transition-all duration-300 ease-out",
                "cursor-pointer",
                "active:scale-[0.98]",
                "shadow-sm",
                isAnimating && "animate-pulse"
            )}
            style={{
                backgroundColor: isOptimisticallyCompleted ? habitColor : 'white'
            }}
            onClick={handleToggle}
        >
            <div className="flex items-center gap-3 flex-1 min-w-0">
                {habit.icon && IconComponent && (
                    <div
                        className={cn(
                            "w-10 h-10 flex items-center justify-center rounded-md",
                            "transition-all duration-300 ease-out"
                        )}
                    >
                        <IconComponent
                            className="w-6 h-6 transition-all duration-300 ease-out"
                            style={{
                                color: isOptimisticallyCompleted ? 'white' : habitColor
                            }}
                        />
                    </div>
                )}
                <span
                    className={cn(
                        "text-base font-medium leading-snug flex-1",
                        "transition-all duration-300 ease-out"
                    )}
                    style={{
                        color: isOptimisticallyCompleted ? 'white' : 'inherit'
                    }}
                >
                    {habit.name}
                </span>
            </div>
        </div>
    );
});

HabitItem.displayName = 'HabitItem';

export default HabitItem;