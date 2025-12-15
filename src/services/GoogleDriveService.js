/* eslint-disable no-undef */

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let tokenClient;
let gapiInited = false;
let gisInited = false;

// Create script tag helper
const loadScript = (src, id) => {
    return new Promise((resolve, reject) => {
        if (document.getElementById(id)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.id = id;
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
    });
};

export const driveService = {
    init: async (clientId) => {
        if (!clientId) throw new Error("Client ID required");

        await Promise.all([
            loadScript('https://apis.google.com/js/api.js', 'gapi-script'),
            loadScript('https://accounts.google.com/gsi/client', 'gis-script')
        ]);

        await new Promise((resolve) => gapi.load('client', resolve));
        await gapi.client.init({
            discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;

        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: SCOPES,
            callback: '', // defined at request time
        });
        gisInited = true;
        return true;
    },

    signIn: () => {
        return new Promise((resolve, reject) => {
            if (!gisInited) return reject("Drive service not initialized");

            tokenClient.callback = async (resp) => {
                if (resp.error) {
                    reject(resp);
                    return;
                }
                resolve(resp);
            };

            // Request permission to create files
            tokenClient.requestAccessToken({ prompt: 'consent' });
        });
    },

    listBackups: async () => {
        try {
            const response = await gapi.client.drive.files.list({
                'pageSize': 10,
                'fields': "nextPageToken, files(id, name, createdTime)",
                'q': "name = 'easeNotes_backup.json' and trashed = false"
            });
            return response.result.files;
        } catch (err) {
            console.error("List backups failed", err);
            throw err;
        }
    },

    uploadBackup: async (content) => {
        // 1. Check if exists
        const files = await driveService.listBackups();
        const existingFile = files.length > 0 ? files[0] : null;

        const fileContent = new Blob([content], { type: 'application/json' });
        const metadata = {
            'name': 'easeNotes_backup.json',
            'mimeType': 'application/json',
        };

        const accessToken = gapi.client.getToken().access_token;
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', fileContent);

        let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
        let method = 'POST';

        if (existingFile) {
            url = `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart`;
            method = 'PATCH';
        }

        const response = await fetch(url, {
            method: method,
            headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
            body: form,
        });

        return await response.json();
    },

    downloadBackup: async (fileId) => {
        const response = await gapi.client.drive.files.get({
            fileId: fileId,
            alt: 'media'
        });
        return response.body; // In gapi client, body is the content for alt=media? Verify.
        // Actually gapi.client.drive.files.get with alt=media returns body in result usually
        // Let's use fetch for download to be safe and consistent with JSON parsing
    },

    // Improved download using fetch to avoid gapi parsing quirks for JSON
    fetchBackupContent: async (fileId) => {
        const accessToken = gapi.client.getToken().access_token;
        const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
            headers: { 'Authorization': 'Bearer ' + accessToken }
        });
        return await response.json();
    }
};
