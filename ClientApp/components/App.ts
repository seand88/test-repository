import { Component } from '../core/Component.js';
import { StorageService } from '../services/StorageService.js';
import { Breadcrumbs } from './Breadcrumbs.js';
import { SearchBar } from './SearchBar.js';
import { FileList } from './FileList.js';
import { StorageContent } from '../models/Storage.js';

export class App extends Component<{}> {
    private storageService: StorageService;
    private breadcrumbs: Breadcrumbs;
    private searchBar: SearchBar;
    private fileList: FileList;

    private currentPath: string = '';
    private searchQuery: string = '';

    constructor() {
        super({});
        this.storageService = new StorageService();

        // Initialize sub-components with their callbacks
        this.breadcrumbs = new Breadcrumbs((path) => this.navigateTo(path, ''));
        this.searchBar = new SearchBar((query) => this.navigateTo(this.currentPath, query));
        this.fileList = new FileList(
            (path) => this.navigateTo(path, ''),
            () => this.loadData(),
            (path) => this.storageService.getDownloadUrl(path)
        );

        this.initializeRouting();
    }

    private initializeRouting() {
        this.parseUrl();
        window.addEventListener('popstate', () => {
            this.parseUrl();
        });
    }

    private parseUrl() {
        const params = new URLSearchParams(window.location.search);
        this.currentPath = params.get('path') || '';
        this.searchQuery = params.get('search') || '';

        this.loadData();
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
        
        this.currentPath = path;
        this.searchQuery = search;
        this.loadData();
    }

    private async loadData() {
        // Update children to reflect loading state
        this.breadcrumbs.updatePath(this.currentPath);
        this.searchBar.updateQuery(this.searchQuery);
        this.fileList.updateData(null, true, null);

        try {
            let content: StorageContent;
            if (this.searchQuery) {
                content = await this.storageService.search(this.searchQuery, this.currentPath);
            } else {
                content = await this.storageService.browse(this.currentPath);
            }
            
            // Pass the loaded data to the FileList component
            this.fileList.updateData(content, false, null);
        } catch (err: any) {
            this.fileList.updateData(null, false, err.message || 'An error occurred');
        }
    }

    protected render(): string {
        // App is now just a static layout shell
        return `
            <div class="browser-container">
                <div class="toolbar" id="toolbar-container"></div>
                <div id="file-list-container"></div>
            </div>
        `;
    }

    protected addEventListeners(): void {
        // Mount sub-components into the newly rendered shell
        const toolbarContainer = this.element.querySelector('#toolbar-container');
        const fileListContainer = this.element.querySelector('#file-list-container');

        if (toolbarContainer && fileListContainer) {
            this.breadcrumbs.mount(toolbarContainer as HTMLElement);
            this.searchBar.mount(toolbarContainer as HTMLElement);
            this.fileList.mount(fileListContainer as HTMLElement);
        }
    }
}
