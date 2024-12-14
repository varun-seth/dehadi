import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHabits } from '@/lib/hooks';
import { getHabit } from '@/lib/db';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { IconPicker } from './IconPicker';
import { Toolbar } from './Toolbar';
import * as Icons from 'lucide-react';
import {
    Dumbbell,
    BookOpen,
    Brain,
    Heart,
    Phone,
    Bath,
    Languages,
    PenLine,
    Puzzle,
    Footprints,
    Apple,
    Users,
    Coffee,
    Moon,
    Sun,
    Utensils,
    Bed,
    Music,
    Camera,
    Droplet,
    Smile,
    Bike,
    Clipboard,
    Home,
    Leaf,
    MessageCircle,
    ShoppingCart,
    Sparkles,
    Target,
    Zap,
    Wind,
    Trophy,
    Timer,
    Briefcase,
    Palette,
    Waves,
    Lightbulb,
    Laptop,
    Pill,
    Dog,
    Flower,
    TreePine,
    Cookie,
    Salad
} from 'lucide-react';

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

export const ICONS = [
    { name: 'Dumbbell', component: Dumbbell },
    { name: 'Footprints', component: Footprints },
    { name: 'Bath', component: Bath },
    { name: 'BookOpen', component: BookOpen },
    { name: 'Languages', component: Languages },
    { name: 'Brain', component: Brain },
    { name: 'Puzzle', component: Puzzle },
    { name: 'PenLine', component: PenLine },
    { name: 'Apple', component: Apple },
    { name: 'Heart', component: Heart },
    { name: 'Users', component: Users },
    { name: 'Phone', component: Phone },
    { name: 'Coffee', component: Coffee },
    { name: 'Moon', component: Moon },
    { name: 'Sun', component: Sun },
    { name: 'Utensils', component: Utensils },
    { name: 'Bed', component: Bed },
    { name: 'Music', component: Music },
    { name: 'Camera', component: Camera },
    { name: 'Droplet', component: Droplet },
    { name: 'Smile', component: Smile },
    { name: 'Bike', component: Bike },
    { name: 'Clipboard', component: Clipboard },
    { name: 'Home', component: Home },
    { name: 'Leaf', component: Leaf },
    { name: 'MessageCircle', component: MessageCircle },
    { name: 'ShoppingCart', component: ShoppingCart },
    { name: 'Sparkles', component: Sparkles },
    { name: 'Target', component: Target },
    { name: 'Zap', component: Zap },
    { name: 'Wind', component: Wind },
    { name: 'Trophy', component: Trophy },
    { name: 'Timer', component: Timer },
    { name: 'Briefcase', component: Briefcase },
    { name: 'Palette', component: Palette },
    { name: 'Waves', component: Waves },
    { name: 'Lightbulb', component: Lightbulb },
    { name: 'Laptop', component: Laptop },
    { name: 'Pill', component: Pill },
    { name: 'Dog', component: Dog },
    { name: 'Flower', component: Flower },
    { name: 'TreePine', component: TreePine },
    { name: 'Cookie', component: Cookie },
    { name: 'Salad', component: Salad }
];

export function HabitForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { createHabit, updateHabit, loading, error } = useHabits();
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        icon: ICONS[0].name
    });

    useEffect(() => {
        if (id) {
            // Load habit data if editing
            const loadHabit = async () => {
                try {
                    const habit = await getHabit(id);
                    if (habit) {
                        setFormData(habit);
                    }
                } catch (err) {
                    console.error('Failed to load habit:', err);
                }
            };
            loadHabit();
        }
    }, [id]);

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
    };

    const IconComponent = Icons[formData.icon];

    return (
        <div className="space-y-6">
            <Toolbar>
                <span className="text-sm text-muted-foreground">
                    {id ? 'Edit Habit' : 'New Habit'}
                </span>
            </Toolbar>

            <div className="max-w-2xl mx-auto px-4">
                <Card className="p-6">
                    <h1 className="text-2xl font-bold mb-6">
                        {id ? 'Edit Habit' : 'New Habit'}
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <div className="flex items-center gap-3">
                                {/* Clickable Icon */}
                                <button
                                    type="button"
                                    className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer shadow-sm"
                                    style={{ backgroundColor: formData.color }}
                                    onClick={() => setIsIconPickerOpen(true)}
                                    title="Click to change icon and color"
                                >
                                    {IconComponent && <IconComponent className="w-7 h-7 text-white" />}
                                </button>

                                {/* Name Input */}
                                <Input
                                    id="name"
                                    className="flex-1"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="flex justify-end space-x-4">
                            <Button type="button" variant="outline" onClick={() => navigate('/habits')}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {id ? 'Update' : 'Create'} Habit
                            </Button>
                        </div>
                    </form>

                    {/* Icon & Color Picker Modal */}
                    <IconPicker
                        open={isIconPickerOpen}
                        onOpenChange={setIsIconPickerOpen}
                        currentIcon={formData.icon}
                        currentColor={formData.color}
                        onSelect={handleIconColorSelect}
                    />
                </Card>
            </div>
        </div>
    );
}