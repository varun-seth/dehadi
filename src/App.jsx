import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HabitList } from '@/components/HabitList';
import { HabitDetail } from '@/components/HabitDetail';
import { DailyView } from '@/components/DailyView';
import { LandingPage } from '@/components/LandingPage';
import { DataManagement } from '@/components/DataManagement';
import { Toolbar } from '@/components/Toolbar';

function RootRoute() {
    const hash = window.location.hash;

    if (hash === '#/' || hash === '#') {
        return <Navigate to="/actions" replace />;
    }

    return <LandingPage />;
}

export default function App() {
    return (
        <Router>
            <div className="flex flex-col h-screen bg-background">
                <Toolbar />
                <main className="flex-1 overflow-y-auto">
                    <Routes>
                        <Route path="/" element={<RootRoute />} />
                        <Route path="/actions" element={<div className="container mx-auto pb-8"><DailyView /></div>} />
                        <Route path="/habits" element={<div className="container mx-auto pb-8"><HabitList /></div>} />
                        <Route path="/habits/:id" element={<div className="container mx-auto pb-8"><HabitDetail /></div>} />
                        <Route path="/data" element={<div className="container mx-auto pb-8"><DataManagement /></div>} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}
