import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Breadcrumbs } from './Breadcrumbs';

describe('Breadcrumbs', () => {
    let container: HTMLElement;
    let onNavigate: any;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        onNavigate = vi.fn();
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('should render root when path is empty', () => {
        const breadcrumbs = new Breadcrumbs(onNavigate);
        breadcrumbs.mount(container);
        expect(container.textContent).toContain('Root');
    });

    it('should render parts for nested path', () => {
        const breadcrumbs = new Breadcrumbs(onNavigate);
        breadcrumbs.mount(container);
        breadcrumbs.updatePath('Folder/Subfolder');
        
        expect(container.textContent).toContain('Root');
        expect(container.textContent).toContain('Folder');
        expect(container.textContent).toContain('Subfolder');
        
        const links = container.querySelectorAll('a');
        expect(links.length).toBe(3); // Root, Folder, Subfolder
        expect(links[1].getAttribute('data-path')).toBe('Folder');
        expect(links[2].getAttribute('data-path')).toBe('Folder/Subfolder');
    });

    it('should call onNavigate when a link is clicked', () => {
        const breadcrumbs = new Breadcrumbs(onNavigate);
        breadcrumbs.mount(container);
        breadcrumbs.updatePath('Folder/Subfolder');
        
        const folderLink = container.querySelector('a[data-path="Folder"]') as HTMLElement;
        folderLink.click();
        
        expect(onNavigate).toHaveBeenCalledWith('Folder');
    });
});