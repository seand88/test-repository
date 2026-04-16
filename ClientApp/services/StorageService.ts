import { StorageContent } from '../models/Storage.js';

export class StorageService {
    private baseUrl = '/api/files';

    public async browse(path: string = ''): Promise<StorageContent> {
        const response = await fetch(`${this.baseUrl}/browse?path=${encodeURIComponent(path)}`);
        if (!response.ok) {
            throw new Error(`Failed to browse path: ${path}`);
        }
        return await response.json();
    }

    public async search(query: string, path: string = ''): Promise<StorageContent> {
        const response = await fetch(`${this.baseUrl}/search?query=${encodeURIComponent(query)}&path=${encodeURIComponent(path)}`);
        if (!response.ok) {
            throw new Error(`Failed to search for: ${query}`);
        }
        return await response.json();
    }

    public async delete(path: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}?path=${encodeURIComponent(path)}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error(`Failed to delete: ${path}`);
        }
    }

    public getDownloadUrl(path: string): string {
        return `${this.baseUrl}/download?path=${encodeURIComponent(path)}`;
    }

    public async upload(path: string, file: File): Promise<void> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${this.baseUrl}/upload?path=${encodeURIComponent(path)}`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Failed to upload file: ${file.name}`);
        }
    }
}
