import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { useHabits } from '@/lib/hooks';
import * as Icons from '@phosphor-icons/react';
import { DEFAULT_CHECK_ICON } from '@/lib/iconRegistry';
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
    const { habits, swapHabitRanks } = useHabits();
    const [items, setItems] = React.useState([]);
    const listContainerRef = React.useRef(null);
    const scrollPositionRef = React.useRef(0);
    React.useEffect(() => {
        setItems([...habits].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0)).map(h => h.id));
    }, [habits]);
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
    React.useLayoutEffect(() => {
        if (listContainerRef.current && scrollPositionRef.current !== null) {
            listContainerRef.current.scrollTop = scrollPositionRef.current;
        }
    }, [habits]);
    return (
        <div className="space-y-6">
            <div className="px-4 pt-6 space-y-4" ref={listContainerRef} style={{ overflowY: 'auto' }}>
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
                                return habit ? <SortableHabitItem key={habit.id} habit={habit} /> : null;
                            })}
                        </div>
                    </SortableContext>
                </DndContext>
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

function SortableHabitItem({ habit }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: habit.id });
    let IconComponent;
    if (Icons[habit.icon]) {
        IconComponent = Icons[habit.icon];
    } else {
        IconComponent = Icons[DEFAULT_CHECK_ICON];
    }
    const navigate = useNavigate();
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
                className="p-4 hover:border-primary transition-colors cursor-pointer"
                onClick={() => navigate(`/habits/${habit.id}`)}
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