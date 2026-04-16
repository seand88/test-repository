import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VisualizerSwitcher } from './VisualizerSwitcher';

describe('VisualizerSwitcher', () => {
    let container: HTMLElement;
    let onSwitch: any;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        onSwitch = vi.fn();
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('should render switcher with options', () => {
        const switcher = new VisualizerSwitcher(onSwitch);
        switcher.mount(container);
        
        const select = container.querySelector('#viz-select') as HTMLSelectElement;
        expect(select).not.toBeNull();
        expect(select.options.length).toBe(2);
        expect(select.value).toBe('bars');
    });

    it('should call onSwitch when selection changes', () => {
        const switcher = new VisualizerSwitcher(onSwitch);
        switcher.mount(container);
        
        const select = container.querySelector('#viz-select') as HTMLSelectElement;
        select.value = 'wave';
        select.dispatchEvent(new Event('change'));
        
        expect(onSwitch).toHaveBeenCalledWith('wave');
    });
});
