import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { useHabits } from '@/lib/hooks';
import * as Icons from 'lucide-react';
import { ICON_PAIRS } from '@/lib/iconRegistry';

export function HabitList() {
    const { habits, loading, error } = useHabits();

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="space-y-6">
            <div className="px-4 pt-6 space-y-4">
                <div className="flex flex-col gap-4">
                    {habits.map((habit) => {
                        const hasPairedIcon = ICON_PAIRS[habit.icon];
                        const IconComponent = hasPairedIcon
                            ? Icons[ICON_PAIRS[habit.icon]]
                            : Icons[habit.icon];

                        return (
                            <Link key={habit.id} to={`/habits/${habit.id}`}>
                                <Card className="p-4 hover:border-primary transition-colors cursor-pointer">
                                    <div className="flex items-center space-x-4">
                                        {habit.icon && IconComponent && (
                                            <div
                                                className="w-8 h-8 flex items-center justify-center rounded bg-transparent"
                                            >
                                                {React.createElement(IconComponent, { className: 'w-5 h-5', style: { color: habit.color || '#838383ff' } })}
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{habit.name}</h3>
                                            {habit.description && (
                                                <p className="text-sm text-muted-foreground">{habit.description}</p>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        );
                    })}
                </div>

                {habits.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No habits yet. Create your first habit to get started!</p>
                        <p className="text-sm text-muted-foreground mt-2">Click "New Habit" in the toolbar above.</p>
                    </div>
                )}
            </div>
        </div>
    );
}