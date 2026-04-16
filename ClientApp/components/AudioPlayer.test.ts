import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AudioPlayer } from './AudioPlayer';

describe('AudioPlayer', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('should be empty initially', () => {
        const player = new AudioPlayer();
        player.mount(container);
        expect(container.innerHTML).toContain('<!-- No track selected -->');
    });

    it('should render audio element when playing', () => {
        const player = new AudioPlayer();
        player.mount(container);
        player.play('test.mp3', 'Test File');
        
        expect(container.textContent).toContain('Now Playing: Test File');
        const audio = container.querySelector('audio');
        expect(audio).not.toBeNull();
        expect(audio?.getAttribute('src')).toBe('test.mp3');
    });

    it('should return audio element', () => {
        const player = new AudioPlayer();
        player.mount(container);
        player.play('test.mp3', 'Test File');
        
        const audio = player.getAudioElement();
        expect(audio).not.toBeNull();
        expect(audio?.tagName).toBe('AUDIO');
    });

    it('should clear when stopped', () => {
        const player = new AudioPlayer();
        player.mount(container);
        player.play('test.mp3', 'Test File');
        player.stop();
        
        expect(container.innerHTML).toContain('<!-- No track selected -->');
    });
});