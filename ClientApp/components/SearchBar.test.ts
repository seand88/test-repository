import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
    let container: HTMLElement;
    let onSearch: any;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'test-container';
        document.body.appendChild(container);
        onSearch = vi.fn();
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('should render correctly', () => {
        const searchBar = new SearchBar(onSearch);
        searchBar.mount(container);
        
        expect(container.querySelector('#search-input')).not.toBeNull();
        expect(container.querySelector('#btn-search')).not.toBeNull();
    });

    it('should call onSearch when button is clicked', () => {
        const searchBar = new SearchBar(onSearch);
        searchBar.mount(container);
        
        const input = container.querySelector('#search-input') as HTMLInputElement;
        expect(input).not.toBeNull();
        input.value = 'test query';
        
        const button = container.querySelector('#btn-search') as HTMLElement;
        expect(button).not.toBeNull();
        button.click();
        
        expect(onSearch).toHaveBeenCalledWith('test query');
    });

    it('should call onSearch when Enter is pressed', () => {
        const searchBar = new SearchBar(onSearch);
        searchBar.mount(container);
        
        const input = container.querySelector('#search-input') as HTMLInputElement;
        expect(input).not.toBeNull();
        input.value = 'another query';
        
        const event = new KeyboardEvent('keypress', { key: 'Enter' });
        input.dispatchEvent(event);
        
        expect(onSearch).toHaveBeenCalledWith('another query');
    });

    it('should update query value', () => {
        const searchBar = new SearchBar(onSearch);
        searchBar.mount(container);
        searchBar.updateQuery('new query');
        
        const input = container.querySelector('#search-input') as HTMLInputElement;
        expect(input).not.toBeNull();
        expect(input.value).toBe('new query');
    });
});