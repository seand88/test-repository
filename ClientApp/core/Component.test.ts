import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Component } from './Component';

describe('Component', () => {
    class TestComponent extends Component<{ count: number }> {
        constructor() {
            super({ count: 0 });
        }

        public increment() {
            this.setState({ count: this.state.count + 1 });
        }

        protected render(): string {
            return `<span id="count">${this.state.count}</span>`;
        }
    }

    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('should initialize with state', () => {
        const component = new TestComponent();
        component.mount(container);
        const countEl = container.querySelector('#count');
        expect(countEl).not.toBeNull();
        expect(countEl?.textContent).toBe('0');
    });

    it('should update state and re-render', () => {
        const component = new TestComponent();
        component.mount(container);
        component.increment();
        const countEl = container.querySelector('#count');
        expect(countEl).not.toBeNull();
        expect(countEl?.textContent).toBe('1');
    });
});
