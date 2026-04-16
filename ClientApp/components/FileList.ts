import { Component } from '../core/Component.js';
import { StorageContent, StorageItemType } from '../models/Storage.js';

interface FileListState {
    content: StorageContent | null;
    isLoading: boolean;
    error: string | null;
}

export class FileList extends Component<FileListState> {
    private onNavigate: (path: string) => void;
    private onDelete: (path: string) => Promise<void>;
    private onRetry: () => void;
    private getDownloadUrl: (path: string) => string;

    constructor(onNavigate: (path: string) => void, onDelete: (path: string) => Promise<void>, onRetry: () => void, getDownloadUrl: (path: string) => string) {
        super({ content: null, isLoading: true, error: null });
        this.onNavigate = onNavigate;
        this.onDelete = onDelete;
        this.onRetry = onRetry;
        this.getDownloadUrl = getDownloadUrl;
        this.element.className = 'file-list-container';
    }

    public updateData(content: StorageContent | null, isLoading: boolean, error: string | null) {
        this.setState({ content, isLoading, error });
    }

    private formatSize(bytes: number): string {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    private renderItems(): string {
        if (!this.state.content || this.state.content.items.length === 0) {
            return `<div class="empty-state">No files or folders found.</div>`;
        }

        const sortedItems = [...this.state.content.items].sort((a, b) => {
            if (a.type !== b.type) {
                return a.type === StorageItemType.Folder ? -1 : 1;
            }
            return a.name.localeCompare(b.name);
        });

        return sortedItems.map(item => {
            const isFolder = item.type === StorageItemType.Folder;
            const icon = isFolder ? '📁' : '📄';
            const sizeStr = isFolder ? '--' : this.formatSize(item.size);
            const dateStr = new Date(item.lastModified).toLocaleString();

            return `
                <div class="list-item ${isFolder ? 'folder' : 'file'}" data-path="${item.relativePath}">
                    <div class="item-name">
                        <span class="icon">${icon}</span>
                        ${isFolder ? 
                            `<a href="#" class="nav-link" data-path="${item.relativePath}">${item.name}</a>` : 
                            `<span>${item.name}</span>`
                        }
                    </div>
                    <div class="item-size">${sizeStr}</div>
                    <div class="item-date">${dateStr}</div>
                    <div class="item-actions">
                        ${!isFolder ? `<a href="${this.getDownloadUrl(item.relativePath)}" target="_blank" title="Download">⬇️</a>` : ''}
                        <button class="btn-delete" data-path="${item.relativePath}" title="Delete">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    protected render(): string {
        if (this.state.error) {
            return `<div class="error-container"><h2>Error</h2><p>${this.state.error}</p><button id="btn-retry">Retry</button></div>`;
        }

        const stats = this.state.content ? 
            `${this.state.content.folderCount} Folders, ${this.state.content.fileCount} Files (${this.formatSize(this.state.content.totalSize)})` : '';

        return `
            <div class="stats-bar">
                ${this.state.isLoading ? 'Loading...' : stats}
            </div>

            <div class="list-header">
                <div class="item-name">Name</div>
                <div class="item-size">Size</div>
                <div class="item-date">Modified</div>
                <div class="item-actions"></div>
            </div>

            <div class="list-body">
                ${this.state.isLoading ? '<div class="loading">Loading contents...</div>' : this.renderItems()}
            </div>
        `;
    }

    protected addEventListeners(): void {
        const navLinks = this.element.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const path = (e.currentTarget as HTMLElement).getAttribute('data-path') || '';
                this.onNavigate(path);
            });
        });

        const deleteButtons = this.element.querySelectorAll('.btn-delete');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const path = (e.currentTarget as HTMLElement).getAttribute('data-path') || '';
                if (confirm(`Are you sure you want to delete this ${path.includes('.') ? 'file' : 'folder'}?`)) {
                    await this.onDelete(path);
                }
            });
        });

        const btnRetry = this.element.querySelector('#btn-retry');
        if (btnRetry) {
            btnRetry.addEventListener('click', () => {
                this.onRetry();
            });
        }
    }
}
