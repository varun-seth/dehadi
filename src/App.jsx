import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { HabitList } from '@/components/HabitList';
import { HabitDetail } from '@/components/HabitDetail';
import { DailyView } from '@/components/DailyView';
import { Toolbar } from '@/components/Toolbar';

export default function App() {
    return (
        <Router>
            <div className="flex flex-col h-screen bg-background">
                <Toolbar />
                <main className="flex-1 overflow-y-auto">
                    <div className="container mx-auto pb-8">
                        <Routes>
                            <Route path="/" element={<DailyView />} />
                            <Route path="/habits" element={<HabitList />} />
                            <Route path="/habits/:id" element={<HabitDetail />} />
                        </Routes>
                    </div>
                </main>
            </div>
        </Router>
    );
}
