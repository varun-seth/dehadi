import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import * as Icons from '@phosphor-icons/react';
import { ICON_SLUG_TO_NAME } from '@/lib/iconRegistry';
import * as db from '@/lib/db';
import { ICON_PAIRS, DEFAULT_CHECK_ICON, DEFAULT_EMPTY_ICON, DEFAULT_CHECK_ICON_SLUG, DEFAULT_EMPTY_ICON_SLUG } from '@/lib/iconRegistry';

const HabitActionItem = React.memo(({ habit, date, isPrevCompleted = false, isNextCompleted = false }) => {
    // Convert habit.icon (slug) to iconName
    const habitIconSlug = habit.icon || DEFAULT_CHECK_ICON_SLUG;
    const habitIconName = ICON_SLUG_TO_NAME[habitIconSlug] || DEFAULT_CHECK_ICON;
    let CompletedIconComponent = Icons[habitIconName] || Icons[DEFAULT_CHECK_ICON];
    const hasPairedIcon = ICON_PAIRS[habitIconName];
    let IconComponent;
    if (hasPairedIcon) {
        const pairedIconName = ICON_PAIRS[habitIconName];
        const pairedIconRealName = ICON_SLUG_TO_NAME[pairedIconName] || pairedIconName;
        IconComponent = Icons[pairedIconRealName] || Icons[DEFAULT_EMPTY_ICON];
    } else {
        IconComponent = Icons[habitIconName] || Icons[DEFAULT_CHECK_ICON];
    }

    const [isCompleted, setIsCompleted] = useState(false);
    const [pace, setPace] = useState(null);

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

    useEffect(() => {
        let mounted = true;
        const calculatePace = async () => {
            try {
                const paceValue = await db.calculatePaceForHabit(habit.id);
                if (mounted) {
                    setPace(paceValue);
                }
            } catch (error) {
                console.error('Failed to calculate pace:', error);
            }
        };
        calculatePace();
        const handlePaceUpdate = async (event) => {
            if (event.detail.habitId === habit.id && mounted) {
                const paceValue = await db.calculatePaceForHabit(habit.id);
                setPace(paceValue);
            }
        };
        window.addEventListener('paceUpdate', handlePaceUpdate);
        return () => {
            mounted = false;
            window.removeEventListener('paceUpdate', handlePaceUpdate);
        };
    }, [habit.id]);

    const handleToggle = useCallback(async (e) => {
        if (e) {
            e.stopPropagation();
        }
        const previousState = isCompleted;
        const optimisticState = !isCompleted;
        setIsCompleted(optimisticState);
        try {
            const newState = await db.toggleHabitForDate(habit.id, date);
            if (newState !== optimisticState) {
                setIsCompleted(newState);
            }
            const paceValue = await db.calculatePaceForHabit(habit.id);
            setPace(paceValue);
            const event = new CustomEvent('habitToggled', {
                detail: { habitId: habit.id, date, completed: newState }
            });
            window.dispatchEvent(event);
            const paceUpdateEvent = new CustomEvent('paceUpdate', {
                detail: { habitId: habit.id }
            });
            window.dispatchEvent(paceUpdateEvent);
        } catch (error) {
            setIsCompleted(previousState);
            console.error('Failed to toggle habit:', error);
        }
    }, [habit.id, date, isCompleted]);

    const habitColor = habit.color || '#838383ff';

    return (
        <div
            className={cn(
                "flex items-center gap-3 p-4",
                "transition-all duration-200 ease-out",
                "cursor-pointer",
                "hover:bg-muted/50",
                !isCompleted && "bg-card",
                isCompleted && isPrevCompleted ? "rounded-t-none" : "rounded-t-lg",
                isCompleted && isNextCompleted ? "rounded-b-none" : "rounded-b-lg",
                !isCompleted && "rounded-lg"
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
                        {isCompleted && CompletedIconComponent ? (
                            <CompletedIconComponent
                                className={cn(
                                    "w-6 h-6 transition-all duration-300 ease-out",
                                    "text-background"
                                )}
                                weight="fill"
                            />
                        ) : (
                            <IconComponent
                                className={cn(
                                    "w-6 h-6 transition-all duration-300 ease-out",
                                    isCompleted && "text-background"
                                )}
                                style={{
                                    color: !isCompleted ? habitColor : undefined
                                }}
                            />
                        )}
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
            {pace !== null && (
                <div
                    className={cn(
                        "px-2 py-1 rounded-md text-xs font-semibold shrink-0",
                        "transition-all duration-300 ease-out",
                        isCompleted ? "bg-background/20 text-background" : "bg-muted text-muted-foreground"
                    )}
                >
                    {pace}%
                </div>
            )}
        </div>
    );
});

HabitActionItem.displayName = 'HabitActionItem';

export default HabitActionItem;
