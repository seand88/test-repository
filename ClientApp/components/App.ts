import { Component } from '../core/Component.js';
import { StorageService } from '../services/StorageService.js';
import { Breadcrumbs } from './Breadcrumbs.js';
import { SearchBar } from './SearchBar.js';
import { FileList } from './FileList.js';
import { UploadForm } from './UploadForm.js';
import { Dialog } from './Dialog.js';
import { FolderPicker } from './FolderPicker.js';
import { AudioPlayer } from './AudioPlayer.js';
import { StorageContent } from '../models/Storage.js';

export class App extends Component<{}> {
    private storageService: StorageService;
    private breadcrumbs: Breadcrumbs;
    private searchBar: SearchBar;
    private fileList: FileList;
    private uploadForm: UploadForm;
    private dialog: Dialog;
    private audioPlayer: AudioPlayer;

    private currentPath: string = '';
    private searchQuery: string = '';

    constructor() {
        super({});
        this.storageService = new StorageService();

        this.dialog = new Dialog('', () => {});
        this.audioPlayer = new AudioPlayer();

        // Initialize sub-components with their callbacks
        this.breadcrumbs = new Breadcrumbs((path) => this.navigateTo(path, ''));
        this.searchBar = new SearchBar((query) => this.navigateTo(this.currentPath, query));
        this.fileList = new FileList(
            (path) => this.navigateTo(path, ''),
            (path) => this.handleMoveRequest(path),
            async (path) => {
                await this.storageService.delete(path);
                this.loadData();
            },
            (path, name) => {
                const url = this.storageService.getDownloadUrl(path);
                this.audioPlayer.play(url, name);
            },
            () => this.loadData(),
            (path) => this.storageService.getDownloadUrl(path)
        );
        this.uploadForm = new UploadForm(async (file) => {
            await this.storageService.upload(this.currentPath, file);
            this.loadData();
        });

        this.initializeRouting();
    }

    private handleMoveRequest(sourcePath: string) {
        const folderPicker = new FolderPicker(this.storageService, async (destinationPath) => {
            try {
                await this.storageService.move(sourcePath, destinationPath);
                this.dialog.close();
                this.loadData();
            } catch (err: any) {
                alert(err.message || 'Failed to move item.');
            }
        });

        this.dialog.setContent(folderPicker);
        const itemName = sourcePath.split('/').pop() || sourcePath;
        this.dialog.open(`Move '${itemName}'`);
        
        folderPicker.loadPath(''); 
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
            
            this.fileList.updateData(content, false, null);
        } catch (err: any) {
            this.fileList.updateData(null, false, err.message || 'An error occurred');
        }
    }

    protected render(): string {
        return `
            <div class="browser-container">
                <div class="toolbar" id="toolbar-container"></div>
                <div class="action-bar" id="action-bar-container"></div>
                <div id="file-list-container"></div>
                <div id="dialog-container"></div>
                <div id="audio-player-footer"></div>
            </div>
        `;
    }

    protected addEventListeners(): void {
        const toolbarContainer = this.element.querySelector('#toolbar-container');
        const actionBarContainer = this.element.querySelector('#action-bar-container');
        const fileListContainer = this.element.querySelector('#file-list-container');
        const dialogContainer = this.element.querySelector('#dialog-container');
        const audioPlayerFooter = this.element.querySelector('#audio-player-footer');

        if (toolbarContainer && actionBarContainer && fileListContainer && dialogContainer && audioPlayerFooter) {
            this.breadcrumbs.mount(toolbarContainer as HTMLElement);
            this.searchBar.mount(toolbarContainer as HTMLElement);
            this.uploadForm.mount(actionBarContainer as HTMLElement);
            this.fileList.mount(fileListContainer as HTMLElement);
            this.dialog.mount(dialogContainer as HTMLElement);
            this.audioPlayer.mount(audioPlayerFooter as HTMLElement);
        }
    }
}
