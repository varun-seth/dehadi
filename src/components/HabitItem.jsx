import React, { useState, useCallback } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from '@/lib/utils';
import * as Icons from 'lucide-react';

const HabitItem = React.memo(({ habit, isCompleted, onToggle }) => {
    const IconComponent = Icons[habit.icon];
    // Optimistic UI state for smooth animations
    const [isOptimisticallyCompleted, setIsOptimisticallyCompleted] = useState(isCompleted);
    const [isAnimating, setIsAnimating] = useState(false);

    // Update local state when prop changes
    React.useEffect(() => {
        setIsOptimisticallyCompleted(isCompleted);
    }, [isCompleted]);

    const handleToggle = useCallback(async (e) => {
        // Prevent event bubbling to avoid double toggle
        if (e) {
            e.stopPropagation();
        }

        // Optimistic update for immediate feedback
        setIsOptimisticallyCompleted(prev => !prev);
        setIsAnimating(true);

        try {
            await onToggle(habit.id);
        } catch (error) {
            // Revert on error
            setIsOptimisticallyCompleted(isCompleted);
            console.error('Failed to toggle habit:', error);
        } finally {
            setTimeout(() => setIsAnimating(false), 300);
        }
    }, [habit.id, onToggle, isCompleted]);

    return (
        <div
            className={cn(
                "flex items-center gap-3 p-3 rounded-lg",
                "transition-all duration-200 ease-out",
                "hover:bg-accent/50 cursor-pointer",
                "active:scale-[0.98]"
            )}
            onClick={handleToggle}
        >
            <Checkbox
                checked={isOptimisticallyCompleted}
                onCheckedChange={handleToggle}
                id={`habit-${habit.id}`}
                className={cn(
                    "transition-all duration-300 ease-out",
                    "data-[state=checked]:scale-110",
                    isAnimating && "animate-pulse"
                )}
                onClick={(e) => e.stopPropagation()}
            />
            
            <div className="flex items-center gap-3 flex-1 min-w-0">
                {habit.icon && IconComponent && (
                    <div
                        className={cn(
                            "w-9 h-9 flex items-center justify-center rounded-md shadow-sm",
                            "transition-all duration-300 ease-out"
                        )}
                        style={{ backgroundColor: habit.color || '#e5e7eb' }}
                    >
                        <IconComponent className="w-5 h-5 text-white" />
                    </div>
                )}
                <span
                    className={cn(
                        "text-sm font-medium leading-snug flex-1",
                        "transition-all duration-300 ease-out"
                    )}
                >
                    {habit.name}
                </span>
            </div>
        </div>
    );
});

HabitItem.displayName = 'HabitItem';

export default HabitItem;