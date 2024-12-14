import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import * as Icons from 'lucide-react';
import * as db from '@/lib/db';

const HabitItem = React.memo(({ habit, date }) => {
    const IconComponent = Icons[habit.icon];
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        let mounted = true;

        const checkCompletion = async () => {
            try {
                const completed = await db.isHabitCompletedForDate(habit.id, date);
                if (mounted) {
                    setIsCompleted(completed);
                }
            } catch (error) {
                console.error('Failed to check habit completion:', error);
            }
        };

        checkCompletion();

        return () => {
            mounted = false;
        };
    }, [habit.id, date]);

    const handleToggle = useCallback(async (e) => {
        if (e) {
            e.stopPropagation();
        }

        const previousState = isCompleted;
        const optimisticState = !isCompleted;

        // Optimistically update UI
        setIsCompleted(optimisticState);

        try {
            const newState = await db.toggleHabitForDate(habit.id, date);

            if (newState !== optimisticState) {
                setIsCompleted(newState);
            }

            const event = new CustomEvent('habitToggled', {
                detail: { habitId: habit.id, date, completed: newState }
            });
            window.dispatchEvent(event);
        } catch (error) {
            // Revert on error
            setIsCompleted(previousState);
            console.error('Failed to toggle habit:', error);
        }
    }, [habit.id, date, isCompleted]);

    const habitColor = habit.color || '#838383ff';

    return (
        <div
            className={cn(
                "flex items-center gap-3 p-4 rounded-lg",
                "transition-all duration-300 ease-out",
                "cursor-pointer",
                "active:scale-[0.98]",
                "shadow-sm",
                !isCompleted && "bg-card"
            )}
            style={{
                backgroundColor: isCompleted ? habitColor : undefined
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
                            className={cn(
                                "w-6 h-6 transition-all duration-300 ease-out",
                                isCompleted && "text-background"
                            )}
                            style={{
                                color: !isCompleted ? habitColor : undefined
                            }}
                        />
                    </div>
                )}
                <span
                    className={cn(
                        "text-base font-medium leading-snug flex-1",
                        "transition-all duration-300 ease-out",
                        isCompleted && "text-background"
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