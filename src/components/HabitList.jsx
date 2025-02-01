import React from 'react';
import { Card } from "@/components/ui/card";
import { useHabits } from '@/lib/hooks';
import { Icons } from '@/lib/iconsSubset.jsx';
import { ICON_SLUG_TO_NAME } from '@/lib/iconRegistry';
import { DEFAULT_CHECK_ICON } from '@/lib/iconRegistry';
import { CycleConfig } from "./CycleConfig";
import { getDefaultCycle } from '@/lib/cycle';
import { formatDistanceToNow, format } from 'date-fns';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { PencilSimple, Trash } from '@phosphor-icons/react';
import { HabitFormDialog } from './HabitFormDialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { subscribe, REORDER_MODE_TOGGLED_EVENT, HABIT_UPDATED_EVENT } from '@/lib/bus';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function HabitList() {
    React.useEffect(() => {
        document.title = `${import.meta.env.VITE_APP_TITLE} - Habits`;
    }, []);
    const { habits, swapHabitRanks, deleteHabit, refresh } = useHabits();
    const [items, setItems] = React.useState([]);
    const listContainerRef = React.useRef(null);
    const scrollPositionRef = React.useRef(0);
    const [editingHabitId, setEditingHabitId] = React.useState(null);
    const [deletingHabitId, setDeletingHabitId] = React.useState(null);
    const [isReorderMode, setIsReorderMode] = React.useState(false);
    React.useEffect(() => {
        setItems([...habits].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0)).map(h => h.id));
    }, [habits]);

    React.useEffect(() => {
        const unsubscribe = subscribe(HABIT_UPDATED_EVENT, () => {
            // Refresh habits data when a habit is created or updated
            refresh();
        });
        return unsubscribe;
    }, []);

    React.useEffect(() => {
        const unsubscribe = subscribe(REORDER_MODE_TOGGLED_EVENT, () => {
            setIsReorderMode(prev => !prev);
        });
        return unsubscribe;
    }, []);
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );
    const sortedHabits = [...habits].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
    const handleDragEnd = async (event) => {
        if (listContainerRef.current) {
            scrollPositionRef.current = listContainerRef.current.scrollTop;
        }
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            const oldIndex = items.indexOf(active.id);
            const newIndex = items.indexOf(over.id);
            setItems(arrayMove(items, oldIndex, newIndex));
            await swapHabitRanks(active.id, over.id);
        }
    };

    // Live rank swapping during drag
    const handleDragOver = async (event) => {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            const oldIndex = items.indexOf(active.id);
            const newIndex = items.indexOf(over.id);
            setItems(arrayMove(items, oldIndex, newIndex));
            await swapHabitRanks(active.id, over.id);
        }
    };
    const handleDeleteConfirm = async () => {
        if (deletingHabitId) {
            try {
                await deleteHabit(deletingHabitId);
                setDeletingHabitId(null);
            } catch (err) {
                console.error('Failed to delete habit:', err);
            }
        }
    };

    const handleEditSuccess = () => {
        setEditingHabitId(null);
        // Force refresh habits data after edit to ensure UI updates
        refresh();
    };
    return (
        <div className="space-y-6">
            <div className="px-4 pt-6 space-y-4" ref={listContainerRef} style={{ overflowY: 'auto' }}>
                {isReorderMode ? (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                    >
                        <SortableContext items={items} strategy={verticalListSortingStrategy}>
                            <div className="flex flex-col gap-4">
                                {items.map(id => {
                                    const habit = habits.find(h => h.id === id);
                                    return habit ? <CompactSortableHabitItem key={habit.id} habit={habit} /> : null;
                                })}
                            </div>
                        </SortableContext>
                    </DndContext>
                ) : (
                    <div className="flex flex-col gap-4">
                        {sortedHabits.map(habit => (
                            <DetailedHabitItem key={habit.id} habit={habit} onEdit={setEditingHabitId} onDelete={setDeletingHabitId} />
                        ))}
                    </div>
                )}
                {habits.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No habits yet. Create your first habit to get started!</p>
                        <p className="text-sm text-muted-foreground mt-2">Click "New Habit" in the toolbar above.</p>
                    </div>
                )}
            </div>
            <HabitFormDialog
                open={editingHabitId !== null}
                onOpenChange={(open) => !open && setEditingHabitId(null)}
                habitId={editingHabitId}
                onSuccess={handleEditSuccess}
            />
            <Dialog open={deletingHabitId !== null} onOpenChange={(open) => !open && setDeletingHabitId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Habit</DialogTitle>
                        <DialogDescription asChild>
                            <div>
                                <p className="mb-3">Are you sure you want to delete this habit? This action cannot be undone.</p>
                                {deletingHabitId && (() => {
                                    const habit = habits.find(h => h.id === deletingHabitId);
                                    if (habit) {
                                        let IconComponent;
                                        const iconName = ICON_SLUG_TO_NAME[habit.icon];
                                        if (iconName && Icons[iconName]) {
                                            IconComponent = Icons[iconName];
                                        } else {
                                            IconComponent = Icons[DEFAULT_CHECK_ICON];
                                        }
                                        return (
                                            <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                                                {IconComponent && (
                                                    <IconComponent
                                                        className="w-6 h-6"
                                                        style={{ color: habit.color || '#838383ff' }}
                                                    />
                                                )}
                                                <span className="font-medium">{habit.name}</span>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletingHabitId(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function DetailedHabitItem({ habit, onEdit, onDelete }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: habit.id });
    // Convert habit.icon (slug) to iconName
    let IconComponent;
    const iconName = ICON_SLUG_TO_NAME[habit.icon];
    if (iconName && Icons[iconName]) {
        IconComponent = Icons[iconName];
    } else {
        IconComponent = Icons[DEFAULT_CHECK_ICON];
    }
    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                opacity: isDragging ? 0.5 : 1
            }}
            {...attributes}
            {...listeners}
        >
            <Card className="p-6 cursor-default">
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
                        <h3 className="text-xl font-bold">{habit.name}</h3>
                    </div>
                    {habit.description && (
                        <p className="text-muted-foreground ml-11">{habit.description}</p>
                    )}
                </div>

                <CycleConfig cycle={habit.cycle ?? getDefaultCycle()} setCycle={() => { }} editable={false} />

                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(habit.id);
                            }}
                        >
                            <PencilSimple className="h-4 w-4 mr-1" />
                            Edit
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(habit.id);
                            }}
                        >
                            <Trash className="h-4 w-4 mr-1" />
                            Delete
                        </Button>
                    </div>
                    {habit.updated_at && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="text-sm text-muted-foreground">
                                        Updated {formatDistanceToNow(new Date(habit.updated_at), { addSuffix: true })}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{format(new Date(habit.updated_at), 'PPpp')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            </Card>
        </div>
    );
}

function CompactSortableHabitItem({ habit }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: habit.id });
    // Convert habit.icon (slug) to iconName
    let IconComponent;
    const iconName = ICON_SLUG_TO_NAME[habit.icon];
    if (iconName && Icons[iconName]) {
        IconComponent = Icons[iconName];
    } else {
        IconComponent = Icons[DEFAULT_CHECK_ICON];
    }
    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                opacity: isDragging ? 0.5 : 1
            }}
            {...attributes}
            {...listeners}
        >
            <Card
                className="p-4 hover:border-primary transition-colors cursor-default"
            >
                <div className="flex items-center space-x-4">
                    {habit.icon && IconComponent && (
                        <div className="w-8 h-8 flex items-center justify-center rounded bg-transparent">
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
        </div>
    );
}