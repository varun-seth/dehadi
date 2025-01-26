import { useState, useEffect, useRef } from 'react';
import { FileArrowDown, SpinnerGap, Cloud, CloudArrowUp, CloudArrowDown, CheckCircle, XCircle, ArrowsClockwise, Trash } from '@phosphor-icons/react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { exportAllData, importAllData, getTotalHabitsCount, getTotalActionsCount } from '@/lib/db';
import { ImportStatsDialog } from '@/components/ImportStatsDialog';
import dropboxService from '@/lib/dropboxService';
import { formatDistanceToNow } from 'date-fns';

export function DataManagement({ dropboxConnected, lastSyncTime, onDropboxStatusChange, onSyncTimeUpdate }) {
    useEffect(() => {
        document.title = `${import.meta.env.VITE_APP_TITLE} - Manage Data`;
    }, []);
    const appTitle = import.meta.env.VITE_APP_TITLE;
    const DROPBOX_BACKUP_FILENAME = 'backup.json';
    const fileInputRef = useRef(null);
    const [habitsCount, setHabitsCount] = useState(0);
    const [actionsCount, setActionsCount] = useState(0);
    const [showImportStats, setShowImportStats] = useState(false);
    const [importStats, setImportStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dropboxLoading, setDropboxLoading] = useState(false);
    const [dropboxAccount, setDropboxAccount] = useState(null);
    const [uploadStatus, setUploadStatus] = useState(null); // null, 'loading', 'success', 'error'
    const [downloadStatus, setDownloadStatus] = useState(null); // null, 'loading', 'success', 'error'
    const [errorDialog, setErrorDialog] = useState({ open: false, title: '', message: '' });

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

    useEffect(() => {
        loadStats();
        checkDropboxStatus();
    }, []); const checkDropboxStatus = async () => {
        // Check if we're returning from OAuth
        const wasCallback = dropboxService.checkAuthCallback();

        try {
            if (dropboxService.isAuthenticated) {
                const account = await dropboxService.getAccountInfo();
                setDropboxAccount(account);
                onDropboxStatusChange(true);
            }
        } catch (error) {
            console.error('Error checking Dropbox status:', error);
            // If token is invalid, clear it
            if (error.message.includes('401') || error.message.includes('invalid_access_token')) {
                dropboxService.logout();
            }
        }

        // If we just completed auth, show a success message
        if (wasCallback) {
            // Could show a toast notification here
            console.log('Successfully connected to Dropbox');
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
            const isoDate = new Date().toISOString().slice(0, 10);
            link.download = `${appTitle}-${isoDate}.json`;
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

    const handleDropboxConnect = async () => {
        try {
            setDropboxLoading(true);
            await dropboxService.authenticate();
        } catch (error) {
            console.error('Error connecting to Dropbox:', error);
            alert(`Failed to connect to Dropbox: ${error.message}`);
        } finally {
            setDropboxLoading(false);
        }
    };

    const handleDropboxUpload = async () => {
        try {
            setUploadStatus('loading');
            const data = await exportAllData();
            await dropboxService.uploadData(data, DROPBOX_BACKUP_FILENAME);
            setUploadStatus('success');
            // Clear success status after 3 seconds
            setTimeout(() => setUploadStatus(null), 3000);
        } catch (error) {
            console.error('Error uploading to Dropbox:', error);
            setUploadStatus('error');
            setErrorDialog({
                open: true,
                title: 'Upload Failed',
                message: error.message
            });
            // Clear error status after showing dialog
            setTimeout(() => setUploadStatus(null), 5000);
        }
    };

    const handleDropboxDownload = async () => {
        try {
            setDownloadStatus('loading');
            const data = await dropboxService.downloadData(DROPBOX_BACKUP_FILENAME);
            const result = await importAllData(data);
            setImportStats(result);
            setShowImportStats(true);
            setDownloadStatus('success');
            // Clear success status after 3 seconds
            setTimeout(() => setDownloadStatus(null), 5000);
        } catch (error) {
            console.error('Error downloading from Dropbox:', error);
            setDownloadStatus('error');
            setErrorDialog({
                open: true,
                title: 'Download Failed',
                message: error.message
            });
            // Clear error status after showing dialog
            setTimeout(() => setDownloadStatus(null), 5000);
        }
    };

    const handleDropboxDisconnect = () => {
        dropboxService.logout();
        onDropboxStatusChange(false);
        setDropboxAccount(null);
    };

    return (
        <TooltipProvider>
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
                            <FileArrowDown className="h-8 w-8" />
                            <span className="text-sm font-medium">Download Backup</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="flex flex-col gap-3 h-auto py-6"
                            onClick={handleImportData}
                        >
                            <SpinnerGap className="h-8 w-8" />
                            <span className="text-sm font-medium">Restore</span>
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Cloud className="h-5 w-5" />
                            <h3 className="text-lg font-medium">Cloud Backup (Dropbox)</h3>
                        </div>

                        {!dropboxConnected ? (
                            <div className="space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={handleDropboxConnect}
                                    disabled={dropboxLoading}
                                >
                                    {dropboxLoading ? 'Connecting...' : 'Connect to Dropbox'}
                                </Button>
                                <p className="text-sm text-muted-foreground">
                                    Connect your Dropbox account to enable cloud backup and sync.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>Connected as {dropboxAccount?.name?.display_name || dropboxAccount?.email}</span>

                                    {lastSyncTime && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>synced {formatDistanceToNow(lastSyncTime, { addSuffix: false })} ago</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleDropboxDisconnect}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Delete connection</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>


                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        variant="outline"
                                        className="flex flex-col gap-3 h-auto py-6"
                                        onClick={handleDropboxUpload}
                                        disabled={uploadStatus === 'loading'}
                                    >
                                        {uploadStatus === 'loading' ? (
                                            <ArrowsClockwise className="h-8 w-8 animate-spin" />
                                        ) : uploadStatus === 'success' ? (
                                            <CheckCircle className="h-8 w-8 text-green-600" />
                                        ) : uploadStatus === 'error' ? (
                                            <XCircle className="h-8 w-8 text-red-600" />
                                        ) : (
                                            <CloudArrowUp className="h-8 w-8" />
                                        )}
                                        <span className="text-sm font-medium">
                                            {uploadStatus === 'loading' ? 'Uploading...' : 'Upload to Dropbox'}
                                        </span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex flex-col gap-3 h-auto py-6"
                                        onClick={handleDropboxDownload}
                                        disabled={downloadStatus === 'loading'}
                                    >
                                        {downloadStatus === 'loading' ? (
                                            <ArrowsClockwise className="h-8 w-8 animate-spin" />
                                        ) : downloadStatus === 'success' ? (
                                            <CheckCircle className="h-8 w-8 text-green-600" />
                                        ) : downloadStatus === 'error' ? (
                                            <XCircle className="h-8 w-8 text-red-600" />
                                        ) : (
                                            <CloudArrowDown className="h-8 w-8" />
                                        )}
                                        <span className="text-sm font-medium">
                                            {downloadStatus === 'loading' ? 'Downloading...' : 'Download from Dropbox'}
                                        </span>
                                    </Button>
                                </div>

                            </div>
                        )}
                    </div>

                    <p className="text-sm text-muted-foreground">
                        You can download all your data into a file and keep it as backup. You can also restore a new device by uploading the backup file.
                        For cloud backup, connect your Dropbox account to sync your data across devices.
                        Since this application works entirely offline, it is your responsibility to keep backups of your data.
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

                <Dialog open={errorDialog.open} onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{errorDialog.title}</DialogTitle>
                            <DialogDescription>{errorDialog.message}</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button onClick={() => setErrorDialog({ ...errorDialog, open: false })}>
                                OK
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    );
}
