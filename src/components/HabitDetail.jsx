import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getHabit } from '@/lib/db';
import { Card } from "@/components/ui/card";
import { CycleConfig } from "./CycleConfig";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import * as Icons from 'lucide-react';
import { ICON_PAIRS } from '@/lib/iconRegistry';
import { formatDistanceToNow, format } from 'date-fns';
import { subscribe, HABIT_UPDATED_EVENT } from '@/lib/bus';

export function HabitDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [habit, setHabit] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadHabit = async () => {
        try {
            const habitData = await getHabit(id);
            if (habitData) {
                setHabit(habitData);
            } else {
                navigate('/habits');
            }
        } catch (err) {
            console.error('Failed to load habit:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHabit();
        const unsubscribe = subscribe(HABIT_UPDATED_EVENT, (payload) => {
            if (payload.id === id) {
                loadHabit();
            }
        });
        return unsubscribe;
    }, [id]);

    if (loading) {
        return <div className="p-4">Loading...</div>;
    }

    if (!habit) {
        return <div className="p-4">Habit not found</div>;
    }

    const hasPairedIcon = ICON_PAIRS[habit.icon];
    const IconComponent = hasPairedIcon
        ? Icons[ICON_PAIRS[habit.icon]]
        : Icons[habit.icon];

    return (
        <div className="space-y-6">
            <div className="max-w-2xl mx-auto px-4 pt-6">
                <Card className="p-6">
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-3">
                            {habit.icon && IconComponent && (
                                <div className="flex items-center justify-center">
                                    <IconComponent
                                        className="w-8 h-8"
                                        style={{ color: habit.color || '#838383ff' }}
                                    />
                                </div>
                            )}
                            <h1 className="text-2xl font-bold">{habit.name}</h1>
                        </div>
                        {habit.description && (
                            <p className="text-muted-foreground ml-11">{habit.description}</p>
                        )}
                    </div>

                    <CycleConfig cycle={habit.cycle} setCycle={() => { }} editable={false} />

                    <TooltipProvider>
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="inline-block">
                                        Created {formatDistanceToNow(new Date(habit.created_at), { addSuffix: true })}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{format(new Date(habit.created_at), 'PPpp')}</p>
                                </TooltipContent>
                            </Tooltip>

                            {habit.updated_at && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="inline-block">
                                            Updated {formatDistanceToNow(new Date(habit.updated_at), { addSuffix: true })}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{format(new Date(habit.updated_at), 'PPpp')}</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                    </TooltipProvider>
                </Card>
            </div>
        </div>
    );
}
