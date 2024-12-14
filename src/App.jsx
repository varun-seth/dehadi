import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HabitList } from '@/components/HabitList';
import { HabitForm } from '@/components/HabitForm';
import { DailyView } from '@/components/DailyView';
import { Toolbar } from '@/components/Toolbar';

export default function App() {
    return (
        <Router>
            <div className="min-h-screen bg-background">
                <Toolbar />
                <main className="container mx-auto pb-8">
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
