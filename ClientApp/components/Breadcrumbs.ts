import { Component } from '../core/Component.js';

interface BreadcrumbsState {
    currentPath: string;
}

export class Breadcrumbs extends Component<BreadcrumbsState> {
    private onNavigate: (path: string) => void;

    constructor(onNavigate: (path: string) => void) {
        super({ currentPath: '' });
        this.onNavigate = onNavigate;
        this.element.className = 'breadcrumbs';
    }

    public updatePath(path: string) {
        this.setState({ currentPath: path });
    }

    protected render(): string {
        if (!this.state.currentPath) return `<span>/ (Root)</span>`;

        const parts = this.state.currentPath.split('/');
        let breadcrumbsHtml = `<a href="#" data-path="" class="nav-link">Root</a>`;
        
        let currentBuildPath = '';
        for (let i = 0; i < parts.length; i++) {
            currentBuildPath += (i === 0 ? '' : '/') + parts[i];
            breadcrumbsHtml += ` / <a href="#" data-path="${currentBuildPath}" class="nav-link">${parts[i]}</a>`;
        }

        return breadcrumbsHtml;
    }

    protected addEventListeners(): void {
        const navLinks = this.element.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const path = (e.currentTarget as HTMLElement).getAttribute('data-path') || '';
                this.onNavigate(path);
            });
        });
    }
}
