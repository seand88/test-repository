import { Component } from '../core/Component.js';
import * as THREE from 'three';
import { IVisualizerStrategy } from '../visualizers/IVisualizerStrategy.js';

export class ThreeVisualizer extends Component<{}> {
    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer;
    private analyser: THREE.AudioAnalyser | null = null;
    private isAudioConnected = false;
    private currentStrategy: IVisualizerStrategy | null = null;

    constructor() {
        super({});
        this.element = document.createElement('canvas'); 
        this.element.id = 'three-visualizer-canvas';
        this.element.style.position = 'fixed';
        this.element.style.top = '0';
        this.element.style.left = '0';
        this.element.style.zIndex = '-1';
    }

    protected render(): string { return ``; }

    public mount(container: HTMLElement) {
        container.appendChild(this.element);
        this.initThree();
        this.animate();
    }

    public connectAudio(audioElement: HTMLAudioElement) {
        if (this.isAudioConnected) return;

        const listener = new THREE.AudioListener();
        const audio = new THREE.Audio(listener);
        audio.setMediaElementSource(audioElement);
        this.analyser = new THREE.AudioAnalyser(audio, 32);

        this.isAudioConnected = true;
    }

    public setStrategy(strategy: IVisualizerStrategy) {
        if (this.currentStrategy) {
            this.currentStrategy.dispose(this.scene);
        }
        this.currentStrategy = strategy;

        // If the scene already exists, initialize the new strategy immediately.
        // Otherwise, it will be initialized by initThree().
        if (this.scene) {
            this.currentStrategy.init(this.scene);
        }
    }

    private initThree() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.element as HTMLCanvasElement,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        const ambientLight = new THREE.AmbientLight(0x404040, 1);
        this.scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(2, 3, 4);
        this.scene.add(pointLight);

        // If a strategy was set before we were mounted, initialize it now.
        if (this.currentStrategy) {
            this.currentStrategy.init(this.scene);
        }
    }

    private animate = () => {
        requestAnimationFrame(this.animate);

        // Camera rotation logic: only rotate when audio is playing
        if (this.analyser) { 
            this.camera.position.x = Math.sin(Date.now() * 0.0001) * 10;
            this.camera.position.z = Math.cos(Date.now() * 0.0001) * 10;
            this.camera.lookAt(this.scene.position);
        } else {
            // Reset camera position when no audio is playing
            this.camera.position.set(0, 0, 5);
            this.camera.lookAt(this.scene.position);
        }

        if (this.currentStrategy) {
            this.currentStrategy.update(this.analyser); // Pass analyser or null
        }

        this.renderer.render(this.scene, this.camera);
    }
}
