import { Component } from '../core/Component.js';
import { StorageService } from '../services/StorageService.js';
import { StorageContent, StorageItemType } from '../models/Storage.js';

interface FolderPickerState {
    currentPath: string;
    content: StorageContent | null;
    isLoading: boolean;
    error: string | null;
}

export class FolderPicker extends Component<FolderPickerState> {
    private storageService: StorageService;
    private onSelect: (destinationPath: string) => void;

    constructor(storageService: StorageService, onSelect: (destinationPath: string) => void) {
        super({ currentPath: '', content: null, isLoading: true, error: null });
        this.storageService = storageService;
        this.onSelect = onSelect;
        this.element.className = 'folder-picker';
    }

    public async loadPath(path: string) {
        this.setState({ currentPath: path, isLoading: true, error: null });
        try {
            const content = await this.storageService.browse(path);
            // Filter out files, we only want folders
            content.items = content.items.filter(item => item.type === StorageItemType.Folder);
            this.setState({ content, isLoading: false, error: null });
        } catch (err: any) {
            this.setState({ isLoading: false, error: err.message || 'Failed to load folders.' });
        }
    }

    private renderBreadcrumbs(): string {
        if (!this.state.currentPath) return `<span class="picker-breadcrumb">Root</span>`;

        const parts = this.state.currentPath.split('/');
        let html = `<a href="#" class="picker-nav-link" data-path="">Root</a>`;
        
        let buildPath = '';
        for (let i = 0; i < parts.length; i++) {
            buildPath += (i === 0 ? '' : '/') + parts[i];
            html += ` / <a href="#" class="picker-nav-link" data-path="${buildPath}">${parts[i]}</a>`;
        }
        return html;
    }

    private renderFolders(): string {
        if (!this.state.content || this.state.content.items.length === 0) {
            return `<div class="empty-state">No subfolders.</div>`;
        }

        const sortedFolders = [...this.state.content.items].sort((a, b) => a.name.localeCompare(b.name));

        return sortedFolders.map(folder => `
            <div class="picker-folder-item">
                <span class="icon">📁</span>
                <a href="#" class="picker-nav-link" data-path="${folder.relativePath}">${folder.name}</a>
            </div>
        `).join('');
    }

    protected render(): string {
        if (this.state.error) {
            return `<div class="error-container">${this.state.error}</div>`;
        }

        return `
            <div class="picker-breadcrumbs-container">${this.renderBreadcrumbs()}</div>
            <div class="picker-list-container">
                ${this.state.isLoading ? '<div class="loading">Loading...</div>' : this.renderFolders()}
            </div>
            <div class="picker-footer">
                <button class="btn-primary btn-select-folder">Move Here</button>
            </div>
        `;
    }

    protected addEventListeners(): void {
        const navLinks = this.element.querySelectorAll('.picker-nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const path = (e.currentTarget as HTMLElement).getAttribute('data-path') || '';
                this.loadPath(path);
            });
        });

        const btnSelect = this.element.querySelector('.btn-select-folder');
        if (btnSelect) {
            btnSelect.addEventListener('click', () => {
                this.onSelect(this.state.currentPath);
            });
        }
    }
}
