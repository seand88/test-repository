import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FolderPicker } from './FolderPicker';
import { StorageItemType } from '../models/Storage';

describe('FolderPicker', () => {
    let container: HTMLElement;
    let mockStorageService: any;
    let onSelect: any;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        onSelect = vi.fn();
        mockStorageService = {
            browse: vi.fn()
        };
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('should show loading initially when loadPath is called', async () => {
        mockStorageService.browse.mockReturnValue(new Promise(() => {})); // Never resolves
        const picker = new FolderPicker(mockStorageService, onSelect);
        picker.mount(container);
        picker.loadPath('test');
        
        expect(container.textContent).toContain('Loading...');
    });

    it('should filter items to only show folders', async () => {
        const mockData = {
            currentPath: 'test',
            items: [
                { name: 'folder1', relativePath: 'test/folder1', type: StorageItemType.Folder, size: 0, lastModified: '', extension: '' },
                { name: 'file1', relativePath: 'test/file1', type: StorageItemType.File, size: 100, lastModified: '', extension: '.txt' }
            ]
        };
        mockStorageService.browse.mockResolvedValue(mockData);
        
        const picker = new FolderPicker(mockStorageService, onSelect);
        picker.mount(container);
        await picker.loadPath('test');
        
        expect(container.textContent).toContain('folder1');
        expect(container.textContent).not.toContain('file1');
    });

    it('should call onSelect with current path when button clicked', async () => {
        mockStorageService.browse.mockResolvedValue({ currentPath: 'test/deep', items: [] });
        const picker = new FolderPicker(mockStorageService, onSelect);
        picker.mount(container);
        await picker.loadPath('test/deep');
        
        const btn = container.querySelector('.btn-select-folder') as HTMLElement;
        btn.click();
        
        expect(onSelect).toHaveBeenCalledWith('test/deep');
    });

    it('should navigate when breadcrumb link clicked', async () => {
        mockStorageService.browse.mockResolvedValue({ currentPath: 'a/b', items: [] });
        const picker = new FolderPicker(mockStorageService, onSelect);
        picker.mount(container);
        await picker.loadPath('a/b');
        
        const rootLink = container.querySelector('.picker-nav-link[data-path=""]') as HTMLElement;
        rootLink.click();
        
        expect(mockStorageService.browse).toHaveBeenCalledWith('');
    });
});
