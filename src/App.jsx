import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

import { HabitList } from '@/components/HabitList';
import { HabitForm } from '@/components/HabitForm';
import { DailyView } from '@/components/DailyView';

export default function App() {
    return (
        <Router>
            <div className="min-h-screen bg-background">
                <main className="container mx-auto">
                    <Routes>
                        <Route path="/" element={<DailyView />} />
                        <Route path="/habits" element={<HabitList />} />
                        <Route path="/habits/new" element={<HabitForm />} />
                        <Route path="/habits/:id" element={<HabitForm />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}
