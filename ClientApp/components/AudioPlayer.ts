import { Component } from '../core/Component.js';

interface AudioPlayerState {
    sourceUrl: string | null;
    fileName: string;
}

export class AudioPlayer extends Component<AudioPlayerState> {

    constructor() {
        super({ sourceUrl: null, fileName: '' });
        this.element.className = 'audio-player-container';
    }

    public play(url: string, fileName: string) {
        this.setState({ sourceUrl: url, fileName: fileName });
    }

    public stop() {
        this.setState({ sourceUrl: null, fileName: '' });
    }

    protected render(): string {
        if (!this.state.sourceUrl) {
            return `<!-- No track selected -->`;
        }

        return `
            <div class="audio-player">
                <span class="track-info">Now Playing: ${this.state.fileName}</span>
                <audio controls autoplay src="${this.state.sourceUrl}" style="width: 100%;">
                    Your browser does not support the audio element.
                </audio>
            </div>
        `;
    }
}
