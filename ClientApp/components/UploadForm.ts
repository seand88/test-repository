import { Component } from '../core/Component.js';

interface UploadFormState {
    isUploading: boolean;
    error: string | null;
}

export class UploadForm extends Component<UploadFormState> {
    private onUpload: (file: File) => Promise<void>;

    constructor(onUpload: (file: File) => Promise<void>) {
        super({ isUploading: false, error: null });
        this.onUpload = onUpload;
        this.element.className = 'upload-form';
    }

    protected render(): string {
        const errorHtml = this.state.error ? `<div class="upload-error">${this.state.error}</div>` : '';
        
        if (this.state.isUploading) {
            return `
                <div class="upload-area uploading">
                    <span>Uploading... Please wait.</span>
                </div>
            `;
        }

        return `
            <div class="upload-area">
                <input type="file" id="file-upload-input" style="display: none;" />
                <button id="btn-select-file" class="btn-primary">Upload File</button>
                <span class="upload-status">No file selected</span>
                ${errorHtml}
            </div>
        `;
    }

    protected addEventListeners(): void {
        const fileInput = this.element.querySelector('#file-upload-input') as HTMLInputElement;
        const btnSelectFile = this.element.querySelector('#btn-select-file');

        if (btnSelectFile && fileInput) {
            btnSelectFile.addEventListener('click', () => {
                fileInput.click();
            });
        }

        if (fileInput) {
            fileInput.addEventListener('change', async (e) => {
                const target = e.target as HTMLInputElement;
                if (target.files && target.files.length > 0) {
                    const file = target.files[0];
                    
                    this.setState({ isUploading: true, error: null });
                    
                    try {
                        await this.onUpload(file);
                        this.setState({ isUploading: false, error: null });
                        // Reset the input
                        target.value = '';
                    } catch (error: any) {
                        this.setState({ isUploading: false, error: error.message || 'Upload failed.' });
                    }
                }
            });
        }
    }
}
