export abstract class Component<TState = {}> {
    protected state: TState;
    public element: HTMLElement;

    constructor(initialState?: TState) {
        this.state = initialState || {} as TState;
        this.element = document.createElement('div');
    }

    /**
     * Updates the state and re-renders the component.
     */
    protected setState(newState: Partial<TState>) {
        this.state = { ...this.state, ...newState };
        this.update();
    }

    /**
     * Mounts the component into a given DOM element.
     */
    public mount(container: HTMLElement) {
        container.appendChild(this.element);
        this.update();
    }

    /**
     * Re-renders the inner HTML and reapplies events.
     */
    protected update() {
        this.element.innerHTML = this.render();
        this.addEventListeners();
    }

    /**
     * Returns the HTML string representation of the component.
     */
    protected abstract render(): string;

    /**
     * Attach DOM event listeners after rendering. 
     * Always override this if your component has interaction.
     */
    protected addEventListeners(): void {
        // Default: no-op
    }
}
