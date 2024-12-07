import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useHabits, useHabitActions } from '@/lib/hooks';

const formatDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
    }
    
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
};

export function DailyView() {
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today.toISOString().split('T')[0];
    });

    const { habits = [], loading: habitsLoading, error: habitsError } = useHabits();
    const { actions = [], toggleHabit, loading: actionsLoading, error: actionsError } = useHabitActions(selectedDate);

    if (habitsError) return <div>Error loading habits: {habitsError}</div>;
    if (actionsError) return <div>Error loading actions: {actionsError}</div>;
    if (habitsLoading || actionsLoading) return <div>Loading...</div>;

    // Ensure habits is always an array
    const safeHabits = Array.isArray(habits) ? habits : [];

    if (habitsLoading || actionsLoading) return <div>Loading...</div>;

    const isHabitCompleted = (habitId) => {
        return actions.some(action => action[0] === habitId);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Dialog>
                    <DialogTrigger asChild>
                        <div className="flex items-center space-x-2 cursor-pointer hover:opacity-80">
                            <h1 className="text-2xl font-bold">{formatDate(new Date(selectedDate))}</h1>
                            <CalendarIcon className="h-5 w-5" />
                        </div>
                    </DialogTrigger>
                    <DialogContent>
                        <Calendar
                            mode="single"
                            selected={new Date(selectedDate)}
                            onSelect={(date) => date && setSelectedDate(date.toISOString().split('T')[0])}
                        />
                    </DialogContent>
                </Dialog>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            const prevDay = new Date(selectedDate);
                            prevDay.setDate(prevDay.getDate() - 1);
                            setSelectedDate(prevDay.toISOString().split('T')[0]);
                        }}
                    >
                        <ChevronLeftIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            const nextDay = new Date(selectedDate);
                            nextDay.setDate(nextDay.getDate() + 1);
                            setSelectedDate(nextDay.toISOString().split('T')[0]);
                        }}
                    >
                        <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Card className="p-6">
                {safeHabits.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground mb-4">
                            No habits created yet. Start by creating your first habit!
                        </p>
                        <Button asChild>
                            <Link to="/habits/new">Create Habit</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {safeHabits.map((habit) => (
                            <div
                                key={habit.id}
                                className="flex items-center space-x-4 p-2 rounded hover:bg-accent/50 cursor-pointer"
                                onClick={() => toggleHabit(habit.id)}
                            >
                                <Checkbox
                                    checked={isHabitCompleted(habit.id)}
                                    onCheckedChange={() => toggleHabit(habit.id)}
                                    id={`habit-${habit.id}`}
                                    className="pointer-events-none"
                                />
                                <div className="flex items-center space-x-4 flex-1">
                                    {habit.icon && (
                                        <div
                                            className="w-8 h-8 flex items-center justify-center rounded"
                                            style={{ backgroundColor: habit.color || '#e5e7eb' }}
                                        >
                                            {habit.icon}
                                        </div>
                                    )}
                                    <label
                                        htmlFor={`habit-${habit.id}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {habit.name}
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}