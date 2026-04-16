import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FileList } from './FileList';
import { StorageItemType } from '../models/Storage';

describe('FileList', () => {
    let container: HTMLElement;
    let mocks: any;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        mocks = {
            onNavigate: vi.fn(),
            onMove: vi.fn(),
            onDelete: vi.fn().mockResolvedValue(undefined),
            onPlay: vi.fn(),
            onRetry: vi.fn(),
            getDownloadUrl: vi.fn(path => `/api/files/download?path=${path}`)
        };
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('should show loading state', () => {
        const fileList = new FileList(mocks.onNavigate, mocks.onMove, mocks.onDelete, mocks.onPlay, mocks.onRetry, mocks.getDownloadUrl);
        fileList.mount(container);
        expect(container.textContent).toContain('Loading...');
    });

    it('should render items when data is provided', () => {
        const fileList = new FileList(mocks.onNavigate, mocks.onMove, mocks.onDelete, mocks.onPlay, mocks.onRetry, mocks.getDownloadUrl);
        fileList.mount(container);
        
        fileList.updateData({
            currentPath: 'test',
            items: [
                { name: 'folder1', relativePath: 'test/folder1', type: StorageItemType.Folder, size: 0, lastModified: new Date().toISOString(), extension: '' },
                { name: 'file1.mp3', relativePath: 'test/file1.mp3', type: StorageItemType.File, size: 1024, lastModified: new Date().toISOString(), extension: '.mp3' }
            ],
            folderCount: 1,
            fileCount: 1,
            totalSize: 1024
        }, false, null);

        expect(container.textContent).toContain('folder1');
        expect(container.textContent).toContain('file1.mp3');
        expect(container.querySelector('.btn-play')).not.toBeNull();
    });

    it('should call onNavigate when folder is clicked', () => {
        const fileList = new FileList(mocks.onNavigate, mocks.onMove, mocks.onDelete, mocks.onPlay, mocks.onRetry, mocks.getDownloadUrl);
        fileList.mount(container);
        
        fileList.updateData({
            currentPath: 'test',
            items: [{ name: 'folder1', relativePath: 'test/folder1', type: StorageItemType.Folder, size: 0, lastModified: new Date().toISOString(), extension: '' }],
            folderCount: 1, fileCount: 0, totalSize: 0
        }, false, null);

        const link = container.querySelector('.nav-link') as HTMLElement;
        link.click();
        expect(mocks.onNavigate).toHaveBeenCalledWith('test/folder1');
    });

    it('should call onPlay when play button is clicked', () => {
        const fileList = new FileList(mocks.onNavigate, mocks.onMove, mocks.onDelete, mocks.onPlay, mocks.onRetry, mocks.getDownloadUrl);
        fileList.mount(container);
        
        fileList.updateData({
            currentPath: 'test',
            items: [{ name: 'file1.mp3', relativePath: 'test/file1.mp3', type: StorageItemType.File, size: 1024, lastModified: new Date().toISOString(), extension: '.mp3' }],
            folderCount: 0, fileCount: 1, totalSize: 1024
        }, false, null);

        const playBtn = container.querySelector('.btn-play') as HTMLElement;
        playBtn.click();
        expect(mocks.onPlay).toHaveBeenCalledWith('test/file1.mp3', 'file1.mp3');
    });

    it('should show error and handle retry', () => {
        const fileList = new FileList(mocks.onNavigate, mocks.onMove, mocks.onDelete, mocks.onPlay, mocks.onRetry, mocks.getDownloadUrl);
        fileList.mount(container);
        
        fileList.updateData(null, false, 'Some error');
        
        expect(container.textContent).toContain('Some error');
        const retryBtn = container.querySelector('#btn-retry') as HTMLElement;
        retryBtn.click();
        expect(mocks.onRetry).toHaveBeenCalled();
    });
});