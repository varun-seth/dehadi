import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

import { HabitList } from '@/components/HabitList';
import { HabitForm } from '@/components/HabitForm';
import { DailyView } from '@/components/DailyView';

export default function App() {
    return (
        <Router>
            <div className="min-h-screen bg-background">
                {/* Navigation */}
                <nav className="border-b">
                    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                        <Link to="/" className="text-xl font-bold">
                            Dihadi
                        </Link>
                        <div className="space-x-4">
                            <Button variant="outline" asChild>
                                <Link to="/habits">Manage Habits</Link>
                            </Button>
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <main className="container mx-auto px-4 py-8">
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
