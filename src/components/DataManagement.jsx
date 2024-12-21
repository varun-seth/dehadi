import { useState, useEffect, useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { exportAllData, importAllData, getTotalHabitsCount, getTotalActionsCount } from '@/lib/db';
import { ImportStatsDialog } from '@/components/ImportStatsDialog';

export function DataManagement() {
    const fileInputRef = useRef(null);
    const [habitsCount, setHabitsCount] = useState(0);
    const [actionsCount, setActionsCount] = useState(0);
    const [showImportStats, setShowImportStats] = useState(false);
    const [importStats, setImportStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [habits, actions] = await Promise.all([
                getTotalHabitsCount(),
                getTotalActionsCount()
            ]);
            setHabitsCount(habits);
            setActionsCount(actions);
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportData = async () => {
        try {
            const data = await exportAllData();

            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            link.download = `dihadi-export-${timestamp}.json`;
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting data:', error);
        }
    };

    const handleImportData = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            const result = await importAllData(data);

            event.target.value = '';

            setImportStats(result);
            setShowImportStats(true);
        } catch (error) {
            console.error('Error importing data:', error);
            alert(`Import failed: ${error.message}`);
            event.target.value = '';
        }
    };

    return (
        <div className="container mx-auto px-4 pt-6 pb-8 max-w-2xl">
            <div className="space-y-8">
                <div>
                    <p className="text-base text-muted-foreground">
                        {isLoading ? (
                            'Loading...'
                        ) : (
                            `There are ${habitsCount} habits and ${actionsCount} actions recorded.`
                        )}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Button
                        variant="outline"
                        className="flex flex-col gap-3 h-auto py-6"
                        onClick={handleExportData}
                    >
                        <Download className="h-8 w-8" />
                        <span className="text-sm font-medium">Export Data</span>
                    </Button>
                    <Button
                        variant="outline"
                        className="flex flex-col gap-3 h-auto py-6"
                        onClick={handleImportData}
                    >
                        <Upload className="h-8 w-8" />
                        <span className="text-sm font-medium">Import Data</span>
                    </Button>
                </div>

                <p className="text-sm text-muted-foreground">
                    You can export all your data and import it into a new device. Make sure to try importing it in incognito in the current device to make sure that the exported data has all the records.
                </p>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>

            <ImportStatsDialog
                open={showImportStats}
                onOpenChange={setShowImportStats}
                stats={importStats}
            />
        </div>
    );
}
