import { useState, useEffect, useCallback } from 'react';
import { exportAllData, importAllData } from '@/lib/db';
import dropboxService from '@/lib/dropboxService';
import { formatDistanceToNow } from 'date-fns';

const appSlug = import.meta.env.VITE_APP_SLUG;
const SYNC_KEY = `${appSlug}.connectors.dropbox.synced_at`;

export function useDropboxSync() {
    const [dropboxConnected, setDropboxConnected] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState(null);

    const updateLastSyncTime = useCallback(() => {
        const now = new Date();
        localStorage.setItem(SYNC_KEY, now.toISOString());
        setLastSyncTime(now);
    }, []);

    const silentSync = useCallback(async () => {
        if (!dropboxConnected) {
            console.log('Silent sync: Dropbox not connected, skipping sync');
            return;
        }

        console.log('Silent sync: Starting automatic sync with Dropbox');

        // Step 1: Try to download and import existing data (don't care if it fails)
        try {
            console.log('Silent sync: Attempting to download backup.json from Dropbox');
            const data = await dropboxService.downloadData('backup.json');
            console.log('Silent sync: Successfully downloaded data from Dropbox, importing...');
            await importAllData(data);
            console.log('Silent sync: Successfully imported downloaded data');
        } catch (error) {
            console.log('Silent sync: Download/import failed or file not found (this is normal), continuing to upload');
        }

        // Step 2: Always upload current data (regardless of download success/failure)
        try {
            console.log('Silent sync: Exporting current data for upload');
            const currentData = await exportAllData();
            console.log('Silent sync: Uploading backup.json to Dropbox');

            await dropboxService.uploadData(currentData, 'backup.json');
            console.log('Silent sync: Successfully uploaded data to Dropbox');

            // Update last sync time
            updateLastSyncTime();
            console.log('Silent sync: Sync completed successfully');
        } catch (error) {
            console.error('Silent sync: Upload failed with error:', error);
        }
    }, [dropboxConnected, updateLastSyncTime]);

    // Check Dropbox status and load last sync time on app start
    useEffect(() => {
        const checkDropboxStatus = async () => {
            try {
                if (dropboxService.isAuthenticated) {
                    setDropboxConnected(true);
                }
            } catch (error) {
                console.error('Error checking Dropbox status:', error);
                if (error.message.includes('401') || error.message.includes('invalid_access_token')) {
                    dropboxService.logout();
                }
            }
        };

        const loadLastSyncTime = () => {
            const stored = localStorage.getItem(SYNC_KEY);
            if (stored) {
                setLastSyncTime(new Date(stored));
            }
        };

        checkDropboxStatus();
        loadLastSyncTime();
    }, []);

    // Set up hourly sync when Dropbox is connected
    useEffect(() => {
        if (dropboxConnected) {
            const now = new Date();
            const storedLastSync = localStorage.getItem(SYNC_KEY);
            const lastSync = storedLastSync ? new Date(storedLastSync) : null;
            const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

            let initialTimerId;

            if (!lastSync || (now - lastSync) >= oneHour) {
                // Sync immediately if never synced or more than 1 hour ago
                console.log('Silent sync: Last sync was over 1 hour ago or never synced, syncing now');
                silentSync();
            } else {
                // Set timer for remaining time until next hourly sync
                const timeUntilNextSync = oneHour - (now - lastSync);
                const nextSyncTime = new Date(now.getTime() + timeUntilNextSync);
                console.log(`Silent sync: Next sync ${formatDistanceToNow(nextSyncTime, { addSuffix: true })}`);

                initialTimerId = setTimeout(() => {
                    silentSync();
                }, timeUntilNextSync);
            }

            // Set up the regular hourly interval
            const intervalId = setInterval(silentSync, oneHour);

            return () => {
                clearInterval(intervalId);
                if (initialTimerId) clearTimeout(initialTimerId);
            };
        }
    }, [dropboxConnected, silentSync]); return {
        dropboxConnected,
        lastSyncTime,
        setDropboxConnected,
        updateLastSyncTime
    };
}