import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UploadForm } from './UploadForm';

describe('UploadForm', () => {
    let container: HTMLElement;
    let onUpload: any;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        onUpload = vi.fn().mockResolvedValue(undefined);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('should render initial state', () => {
        const form = new UploadForm(onUpload);
        form.mount(container);
        expect(container.querySelector('#btn-select-file')).not.toBeNull();
        expect(container.textContent).toContain('Upload File');
    });

    it('should trigger file input when button clicked', () => {
        const form = new UploadForm(onUpload);
        form.mount(container);
        
        const fileInput = container.querySelector('#file-upload-input') as HTMLInputElement;
        const clickSpy = vi.spyOn(fileInput, 'click');
        
        const btn = container.querySelector('#btn-select-file') as HTMLElement;
        btn.click();
        
        expect(clickSpy).toHaveBeenCalled();
    });

    it('should call onUpload when file is selected', async () => {
        const form = new UploadForm(onUpload);
        form.mount(container);
        
        const fileInput = container.querySelector('#file-upload-input') as HTMLInputElement;
        const file = new File(['content'], 'test.txt', { type: 'text/plain' });
        
        // Mock files property
        Object.defineProperty(fileInput, 'files', {
            value: [file]
        });
        
        const event = new Event('change');
        fileInput.dispatchEvent(event);
        
        expect(container.textContent).toContain('Uploading...');
        
        // Wait for async onUpload
        await vi.waitFor(() => expect(onUpload).toHaveBeenCalledWith(file));
        await vi.waitFor(() => expect(container.textContent).not.toContain('Uploading...'));
    });

    it('should show error if upload fails', async () => {
        onUpload.mockRejectedValue(new Error('Failed!'));
        const form = new UploadForm(onUpload);
        form.mount(container);
        
        const fileInput = container.querySelector('#file-upload-input') as HTMLInputElement;
        const file = new File(['content'], 'test.txt', { type: 'text/plain' });
        Object.defineProperty(fileInput, 'files', { value: [file] });
        
        fileInput.dispatchEvent(new Event('change'));
        
        await vi.waitFor(() => expect(container.textContent).toContain('Failed!'));
    });
});
