import { Component } from '../core/Component.js';

export type VisualizerType = 'bars' | 'wave';

export class VisualizerSwitcher extends Component<{}> {
    private onSwitch: (type: VisualizerType) => void;

    constructor(onSwitch: (type: VisualizerType) => void) {
        super({});
        this.onSwitch = onSwitch;
        this.element.className = 'visualizer-switcher';
    }

    protected render(): string {
        return `
            <label for="viz-select">Visualizer:</label>
            <select id="viz-select">
                <option value="bars" selected>Bars</option>
                <option value="wave">Wave</option>
            </select>
        `;
    }

    protected addEventListeners(): void {
        const select = this.element.querySelector('#viz-select') as HTMLSelectElement;
        if (select) {
            select.addEventListener('change', () => {
                this.onSwitch(select.value as VisualizerType);
            });
        }
    }
}
