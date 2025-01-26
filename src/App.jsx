import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HabitList } from '@/components/HabitList';
import { HabitDetail } from '@/components/HabitDetail';
import { HabitActionList } from '@/components/HabitActionList';
import { LandingPage } from '@/components/LandingPage';
import { DataManagement } from '@/components/DataManagement';
import { Toolbar } from '@/components/Toolbar';

import { useEffect } from 'react';
import { useDropboxSync } from '@/lib/dropboxSync';
function RootRoute() {
    const appTitle = import.meta.env.VITE_APP_TITLE;
    const hash = window.location.hash;

    useEffect(() => {
        document.title = appTitle;
    }, [appTitle]);

    if (hash === '#/' || hash === '#') {
        return <Navigate to="/actions" replace />;
    }

    return <LandingPage />;
}

export default function App() {
    const { dropboxConnected, lastSyncTime, setDropboxConnected, updateLastSyncTime, silentSync } = useDropboxSync();

    return (
        <Router>
            <div className="flex flex-col h-screen bg-background">
                <Toolbar />
                <main className="flex-1 overflow-y-auto">
                    <Routes>
                        <Route path="/" element={<RootRoute />} />
                        <Route path="/actions" element={<div className="container mx-auto pb-8"><HabitActionList /></div>} />
                        <Route path="/habits" element={<div className="container mx-auto pb-8"><HabitList /></div>} />
                        <Route path="/habits/:id" element={<div className="container mx-auto pb-8"><HabitDetail /></div>} />
                        <Route path="/data" element={<div className="container mx-auto pb-8"><DataManagement dropboxConnected={dropboxConnected} lastSyncTime={lastSyncTime} onDropboxStatusChange={setDropboxConnected} onSyncTimeUpdate={updateLastSyncTime} silentSync={silentSync} /></div>} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}
