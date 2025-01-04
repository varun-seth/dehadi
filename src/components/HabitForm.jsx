import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHabits } from '@/lib/hooks';
import { getHabit } from '@/lib/db';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CycleConfig } from "./CycleConfig";
import { Card } from "@/components/ui/card";
import { IconPicker } from './IconPicker';
import * as Icons from 'lucide-react';
import { ICONS, ICON_PAIRS, searchIconForHabit } from '@/lib/iconRegistry';

const COLORS = [
    '#ef4444', // red
    '#f97316', // orange
    '#f59e0b', // amber
    '#84cc16', // lime
    '#10b981', // emerald
    '#06b6d4', // cyan
    '#3b82f6', // blue
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#d946ef', // fuchsia
];

export { ICON_PAIRS, ICONS };

export function HabitForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { createHabit, updateHabit, loading, error } = useHabits();
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
    const [isHabitLoaded, setIsHabitLoaded] = useState(!id);
    const [isIconLocked, setIsIconLocked] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        icon: ICONS[0].name,
        cycle: {
            unit: 'day',
            slots: null,
            leap: 0,
            base: 0
        }
    });

    useEffect(() => {
        if (id) {
            const loadHabit = async () => {
                try {
                    const habit = await getHabit(id);
                    if (habit) {
                        setFormData({
                            ...habit,
                            cycle: habit.cycle || {
                                unit: 'day',
                                slots: null,
                                leap: 0,
                                base: 0
                            }
                        });
                    }
                } catch (err) {
                    console.error('Failed to load habit:', err);
                } finally {
                    setIsHabitLoaded(true);
                }
            };
            loadHabit();
        } else {
            setIsHabitLoaded(true);
        }
        setIsIconLocked(false);
    }, [id]);

    useEffect(() => {
        if (formData.name && !isIconLocked) {
            const suggestedIcon = searchIconForHabit(formData.name);
            if (suggestedIcon) {
                setFormData(prev => ({ ...prev, icon: suggestedIcon }));
            }
        }
    }, [formData.name, isIconLocked]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (id) {
                await updateHabit(id, formData);
            } else {
                await createHabit(formData);
            }
            navigate('/habits');
        } catch (err) {
            console.error('Failed to save habit:', err);
        }
    };

    const handleIconColorSelect = ({ icon, color }) => {
        setFormData({ ...formData, icon, color });
        setIsIconLocked(true);
    };

    const hasPairedIcon = ICON_PAIRS[formData.icon];
    const IconComponent = hasPairedIcon
        ? Icons[ICON_PAIRS[formData.icon]]
        : Icons[formData.icon];

    return (
        <Card className="p-4 max-w-md mx-auto mt-8">
            <div className="border-b py-4 px-4">
                <h1 className="text-xl font-semibold">
                    {id ? 'Edit Habit' : 'New Habit'}
                </h1>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                <Label htmlFor="description">Description</Label>
                <Input id="description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                <Label htmlFor="color">Color</Label>
                <div className="flex gap-2 flex-wrap">
                    {COLORS.map(color => (
                        <button type="button" key={color} className={`w-6 h-6 rounded-full border-2 ${formData.color === color ? 'border-black' : 'border-transparent'}`} style={{ backgroundColor: color }} onClick={() => setFormData({ ...formData, color })} />
                    ))}
                </div>
                <Label htmlFor="icon">Icon</Label>
                <button type="button" className="border rounded px-2 py-1" onClick={() => setIsIconPickerOpen(true)}>
                    <span className="mr-2">{formData.icon}</span>
                    {Icons[formData.icon] ? (
                        <span className="inline-block align-middle">{React.createElement(Icons[formData.icon], { size: 20 })}</span>
                    ) : null}
                </button>
                {isIconPickerOpen && (
                    <IconPicker selectedIcon={formData.icon} onSelect={icon => { setFormData({ ...formData, icon }); setIsIconPickerOpen(false); }} onClose={() => setIsIconPickerOpen(false)} />
                )}
                <hr className="my-6" />
                <CycleConfig cycle={formData.cycle} setCycle={cycle => setFormData({ ...formData, cycle })} editable={true} />
                <div className="flex justify-end gap-2 mt-4">
                    <Button type="submit" disabled={loading}>{id ? 'Update' : 'Create'} Habit</Button>
                    <Button type="button" variant="outline" onClick={() => navigate('/habits')}>Cancel</Button>
                </div>
                {error && <div className="text-red-500 mt-2">{error}</div>}
            </form>
        </Card>
    );
}