import { Component } from '../core/Component.js';

interface SearchBarState {
    searchQuery: string;
}

export class SearchBar extends Component<SearchBarState> {
    private onSearch: (query: string) => void;

    constructor(onSearch: (query: string) => void) {
        super({ searchQuery: '' });
        this.onSearch = onSearch;
        this.element.className = 'search-box';
    }

    public updateQuery(query: string) {
        if (this.state.searchQuery !== query) {
            this.setState({ searchQuery: query });
        }
    }

    protected render(): string {
        return `
            <input type="text" id="search-input" placeholder="Search..." value="${this.state.searchQuery}">
            <button id="btn-search">Search</button>
        `;
    }

    protected addEventListeners(): void {
        const btnSearch = this.element.querySelector('#btn-search');
        const searchInput = this.element.querySelector('#search-input') as HTMLInputElement;

        const performSearch = () => {
            if (searchInput) {
                this.onSearch(searchInput.value);
            }
        };

        if (btnSearch) {
            btnSearch.addEventListener('click', performSearch);
        }

        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
        }
    }
}
