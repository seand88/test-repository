import { Component } from '../core/Component.js';

interface DialogState {
    isOpen: boolean;
    title: string;
}

export class Dialog extends Component<DialogState> {
    private innerComponent: Component<any> | null = null;
    private onClose: () => void;

    constructor(title: string, onClose: () => void) {
        super({ isOpen: false, title });
        this.onClose = onClose;
        
        // Use the native HTML5 dialog element for our wrapper
        this.element = document.createElement('dialog');
        this.element.className = 'custom-dialog';
    }

    /**
     * Sets the component to render inside the dialog body.
     */
    public setContent(component: Component<any>) {
        this.innerComponent = component;
        this.update(); // Re-render the dialog shell
    }

    public open(title?: string) {
        if (title) {
            this.setState({ title, isOpen: true });
        } else {
            this.setState({ isOpen: true });
        }
        
        const dialogEl = this.element as HTMLDialogElement;
        if (!dialogEl.open) {
            dialogEl.showModal();
        }
    }

    public close() {
        this.setState({ isOpen: false });
        const dialogEl = this.element as HTMLDialogElement;
        if (dialogEl.open) {
            dialogEl.close();
        }
        this.onClose();
    }

    protected render(): string {
        return `
            <div class="dialog-header">
                <h3>${this.state.title}</h3>
                <button class="btn-close-dialog">&times;</button>
            </div>
            <div class="dialog-body" id="dialog-content-container">
                <!-- Inner component mounts here -->
            </div>
        `;
    }

    protected addEventListeners(): void {
        const dialogEl = this.element as HTMLDialogElement;
        const btnClose = this.element.querySelector('.btn-close-dialog');

        // Close when clicking the "X" button
        if (btnClose) {
            btnClose.addEventListener('click', () => this.close());
        }

        // Mount the inner component if we have one
        const contentContainer = this.element.querySelector('#dialog-content-container');
        if (contentContainer && this.innerComponent) {
            // Because the inner component might have been mounted previously,
            // we clear the container first. The inner component's `mount` method
            // will append its `this.element` to this container.
            contentContainer.innerHTML = '';
            this.innerComponent.mount(contentContainer as HTMLElement);
        }

        // Optional: Close when clicking the backdrop
        dialogEl.addEventListener('click', (e) => {
            const rect = dialogEl.getBoundingClientRect();
            const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
                rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
            if (!isInDialog) {
                this.close();
            }
        });
    }
}
