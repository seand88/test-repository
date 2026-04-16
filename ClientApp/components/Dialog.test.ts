import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Dialog } from './Dialog';
import { Component } from '../core/Component';

class MockInnerComponent extends Component<{}> {
    protected render(): string {
        return '<div id="inner">Inner Content</div>';
    }
}

describe('Dialog', () => {
    let container: HTMLElement;
    let onClose: any;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        onClose = vi.fn();
        
        // Mock HTMLDialogElement methods as jsdom doesn't support them
        HTMLDialogElement.prototype.showModal = vi.fn(function(this: HTMLDialogElement) {
            this.setAttribute('open', '');
        });
        HTMLDialogElement.prototype.close = vi.fn(function(this: HTMLDialogElement) {
            this.removeAttribute('open');
        });
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('should initialize with title', () => {
        const dialog = new Dialog('Test Dialog', onClose);
        dialog.mount(container);
        expect(container.textContent).toContain('Test Dialog');
    });

    it('should showModal when opened', () => {
        const dialog = new Dialog('Test Dialog', onClose);
        dialog.mount(container);
        dialog.open();
        
        expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
        expect(dialog.element.hasAttribute('open')).toBe(true);
    });

    it('should close and call onClose', () => {
        const dialog = new Dialog('Test Dialog', onClose);
        dialog.mount(container);
        dialog.open();
        dialog.close();
        
        expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();
        expect(dialog.element.hasAttribute('open')).toBe(false);
        expect(onClose).toHaveBeenCalled();
    });

    it('should render inner component when set', () => {
        const dialog = new Dialog('Test Dialog', onClose);
        dialog.mount(container);
        
        const inner = new MockInnerComponent();
        dialog.setContent(inner);
        
        expect(container.querySelector('#inner')).not.toBeNull();
        expect(container.querySelector('#inner')?.textContent).toBe('Inner Content');
    });
});
