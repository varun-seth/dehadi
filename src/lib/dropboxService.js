import { Dropbox } from 'dropbox';

// Dropbox app configuration
const DROPBOX_APP_KEY = import.meta.env.VITE_DROPBOX_APP_KEY;
const appSlug = import.meta.env.VITE_APP_SLUG;

const TOKEN_KEY = `${appSlug}.connectors.dropbox.access_token`;

// Dropbox service class
class DropboxService {
    constructor() {
        this.dbx = null;
        this.accessToken = null;
        this.isAuthenticated = false;
    }

    // Initialize Dropbox client
    init() {
        this.accessToken = localStorage.getItem(TOKEN_KEY);
        if (this.accessToken) {
            this.dbx = new Dropbox({ accessToken: this.accessToken });
            this.isAuthenticated = true;
        } else {
            // Try to get token from URL hash (after redirect)
            this.checkAuthCallback();
        }
    }

    // Check if we're returning from OAuth (implicit grant flow)
    checkAuthCallback() {
        const hash = window.location.hash.substring(1);
        const urlParams = new URLSearchParams(hash);
        const accessToken = urlParams.get('access_token');
        const state = urlParams.get('state'); // This contains our original route path (e.g., "/data")

        if (accessToken) {
            this.accessToken = accessToken;
            localStorage.setItem(TOKEN_KEY, this.accessToken);
            this.dbx = new Dropbox({ accessToken: this.accessToken });
            this.isAuthenticated = true;

            // Restore the original route from state, or default to home
            const targetRoute = state ? '#' + state : '#/';
            window.location.hash = targetRoute;

            return true;
        }

        return false;
    }

    // Start OAuth flow using Dropbox SDK's built-in method
    async authenticate() {
        if (!DROPBOX_APP_KEY) {
            throw new Error('Dropbox integration is not available. Please contact support for assistance.');
        }

        // Get current route from hash router (e.g., "#/data") and extract the path part
        const currentHash = window.location.hash || '#/';
        const currentRoute = currentHash.substring(1) || '/';
        // Dynamically calculate redirect URI
        const redirectUri = window.location.origin;

        // Use Dropbox SDK's built-in authentication with state parameter
        const dbx = new Dropbox({ clientId: DROPBOX_APP_KEY });
        const authUrl = await dbx.auth.getAuthenticationUrl(redirectUri, currentRoute);

        window.location.href = authUrl;
    }

    // Logout
    logout() {
        this.accessToken = null;
        this.dbx = null;
        this.isAuthenticated = false;
        localStorage.removeItem(TOKEN_KEY);
    }

    // Upload data to Dropbox
    async uploadData(data, filename = 'backup.json') {
        if (!this.isAuthenticated || !this.dbx) {
            throw new Error('Not authenticated with Dropbox');
        }

        const jsonString = JSON.stringify(data, null, 2);
        const uploadPath = `/${filename}`;

        try {
            const response = await this.dbx.filesUpload({
                path: uploadPath,
                contents: jsonString,
                mode: { '.tag': 'overwrite' },
                autorename: false,
                mute: false,
            });
            return response;
        } catch (error) {
            console.error('Upload failed:', error);
            throw new Error(`Failed to upload to Dropbox: ${error.message}`);
        }
    }

    // Download data from Dropbox
    async downloadData(filename = 'backup.json') {
        if (!this.isAuthenticated || !this.dbx) {
            throw new Error('Not authenticated with Dropbox');
        }

        const downloadPath = `/${filename}`;

        try {
            const response = await this.dbx.filesDownload({ path: downloadPath });
            const blob = response.result.fileBlob;
            const text = await blob.text();
            return JSON.parse(text);
        } catch (error) {
            if (error.status === 409) {
                throw new Error('Backup file not found in Dropbox');
            }
            console.error('Download failed:', error);
            throw new Error(`Failed to download from Dropbox: ${error.message}`);
        }
    }

    // List files in app folder
    async listFiles() {
        if (!this.isAuthenticated || !this.dbx) {
            throw new Error('Not authenticated with Dropbox');
        }

        try {
            const response = await this.dbx.filesListFolder({ path: '' });
            return response.result.entries;
        } catch (error) {
            console.error('List files failed:', error);
            throw new Error(`Failed to list Dropbox files: ${error.message}`);
        }
    }

    // Get account info
    async getAccountInfo() {
        if (!this.isAuthenticated || !this.dbx) {
            throw new Error('Not authenticated with Dropbox');
        }

        try {
            const response = await this.dbx.usersGetCurrentAccount();
            return response.result;
        } catch (error) {
            console.error('Get account info failed:', error);
            throw new Error(`Failed to get Dropbox account info: ${error.message}`);
        }
    }
}

// Create singleton instance
const dropboxService = new DropboxService();
dropboxService.init();

export default dropboxService;