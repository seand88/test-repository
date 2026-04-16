import { Component } from '../core/Component.js';

interface AppState {
    count: number;
}

export class App extends Component<AppState> {
    constructor() {
        // Initial state
        super({ count: 0 });
    }

    protected render(): string {
        return `
            <div class="app-container">
                <h1>File Browser Application</h1>
                <p>Welcome to the component-based architecture!</p>
                <button id="increment-btn">Count: ${this.state.count}</button>
            </div>
        `;
    }

    protected addEventListeners(): void {
        // Find the button and attach the click event
        const btn = this.element.querySelector('#increment-btn');
        if (btn) {
            btn.addEventListener('click', () => {
                this.setState({ count: this.state.count + 1 });
            });
        }
    }
}
