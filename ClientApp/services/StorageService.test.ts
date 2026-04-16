import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StorageService } from './StorageService';

describe('StorageService', () => {
    let service: StorageService;

    beforeEach(() => {
        service = new StorageService();
        global.fetch = vi.fn();
    });

    it('browse should fetch and return data', async () => {
        const mockData = { currentPath: 'test', items: [] };
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => mockData
        });

        const result = await service.browse('test');
        
        expect(global.fetch).toHaveBeenCalledWith('/api/files/browse?path=test');
        expect(result).toEqual(mockData);
    });

    it('browse should throw error on failure', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false
        });

        await expect(service.browse('test')).rejects.toThrow('Failed to browse path: test');
    });

    it('search should fetch and return data', async () => {
        const mockData = { currentPath: '', items: [] };
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => mockData
        });

        const result = await service.search('query', 'path');
        
        expect(global.fetch).toHaveBeenCalledWith('/api/files/search?query=query&path=path');
        expect(result).toEqual(mockData);
    });

    it('move should send POST request', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true });

        await service.move('src', 'dest');
        
        expect(global.fetch).toHaveBeenCalledWith('/api/files/move?sourcePath=src&destinationPath=dest', {
            method: 'POST'
        });
    });

    it('delete should send DELETE request', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true });

        await service.delete('path');
        
        expect(global.fetch).toHaveBeenCalledWith('/api/files?path=path', {
            method: 'DELETE'
        });
    });

    it('upload should send POST request with FormData', async () => {
        (global.fetch as any).mockResolvedValue({ ok: true });
        const file = new File(['content'], 'test.txt', { type: 'text/plain' });

        await service.upload('path', file);
        
        expect(global.fetch).toHaveBeenCalledWith('/api/files/upload?path=path', expect.objectContaining({
            method: 'POST',
            body: expect.any(FormData)
        }));
    });
});
