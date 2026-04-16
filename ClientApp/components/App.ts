import { Component } from '../core/Component.js';
import { StorageService } from '../services/StorageService.js';
import { StorageContent, StorageItem, StorageItemType } from '../models/Storage.js';

interface AppState {
    currentPath: string;
    searchQuery: string;
    content: StorageContent | null;
    isLoading: boolean;
    error: string | null;
}

export class App extends Component<AppState> {
    private storageService: StorageService;

    constructor() {
        super({
            currentPath: '',
            searchQuery: '',
            content: null,
            isLoading: true,
            error: null
        });
        
        this.storageService = new StorageService();
        this.initializeRouting();
    }

    private initializeRouting() {
        // Read initial state from URL
        this.parseUrl();

        // Listen for back/forward browser navigation
        window.addEventListener('popstate', () => {
            this.parseUrl();
        });
    }

    private parseUrl() {
        const params = new URLSearchParams(window.location.search);
        const path = params.get('path') || '';
        const search = params.get('search') || '';

        this.setState({ currentPath: path, searchQuery: search, isLoading: true });
        this.loadData(path, search);
    }

    private navigateTo(path: string, search: string = '') {
        const url = new URL(window.location.href);
        
        if (path) {
            url.searchParams.set('path', path);
        } else {
            url.searchParams.delete('path');
        }

        if (search) {
            url.searchParams.set('search', search);
        } else {
            url.searchParams.delete('search');
        }

        window.history.pushState({}, '', url.toString());
        this.setState({ currentPath: path, searchQuery: search, isLoading: true });
        this.loadData(path, search);
    }

    private async loadData(path: string, search: string) {
        try {
            let content: StorageContent;
            if (search) {
                content = await this.storageService.search(search, path);
            } else {
                content = await this.storageService.browse(path);
            }
            this.setState({ content, isLoading: false, error: null });
        } catch (err: any) {
            this.setState({ isLoading: false, error: err.message || 'An error occurred' });
        }
    }

    private formatSize(bytes: number): string {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    private renderBreadcrumbs(): string {
        if (!this.state.currentPath) return `<span>/ (Root)</span>`;

        const parts = this.state.currentPath.split('/');
        let breadcrumbsHtml = `<a href="#" data-path="" class="nav-link">Root</a>`;
        
        let currentBuildPath = '';
        for (let i = 0; i < parts.length; i++) {
            currentBuildPath += (i === 0 ? '' : '/') + parts[i];
            breadcrumbsHtml += ` / <a href="#" data-path="${currentBuildPath}" class="nav-link">${parts[i]}</a>`;
        }

        return breadcrumbsHtml;
    }

    private renderItems(): string {
        if (!this.state.content || this.state.content.items.length === 0) {
            return `<div class="empty-state">No files or folders found.</div>`;
        }

        // Sort: Folders first, then alphabetical
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
                        ${!isFolder ? `<a href="${this.storageService.getDownloadUrl(item.relativePath)}" target="_blank">⬇️</a>` : ''}
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
            <div class="browser-container">
                <div class="toolbar">
                    <div class="breadcrumbs">${this.renderBreadcrumbs()}</div>
                    <div class="search-box">
                        <input type="text" id="search-input" placeholder="Search..." value="${this.state.searchQuery}">
                        <button id="btn-search">Search</button>
                    </div>
                </div>

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
            </div>
        `;
    }

    protected addEventListeners(): void {
        // Navigation links (Breadcrumbs & Folders)
        const navLinks = this.element.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const path = (e.currentTarget as HTMLElement).getAttribute('data-path') || '';
                this.navigateTo(path, ''); // Clear search on normal navigation
            });
        });

        // Search
        const btnSearch = this.element.querySelector('#btn-search');
        const searchInput = this.element.querySelector('#search-input') as HTMLInputElement;

        const performSearch = () => {
            if (searchInput) {
                this.navigateTo(this.state.currentPath, searchInput.value);
            }
        };

        if (btnSearch) {
            btnSearch.addEventListener('click', performSearch);
        }

        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
        }

        // Error retry
        const btnRetry = this.element.querySelector('#btn-retry');
        if (btnRetry) {
            btnRetry.addEventListener('click', () => {
                this.loadData(this.state.currentPath, this.state.searchQuery);
            });
        }
    }
}