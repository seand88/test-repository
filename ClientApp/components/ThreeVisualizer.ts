import { Component } from '../core/Component.js';
import * as THREE from 'three';

export class ThreeVisualizer extends Component<{}> {
    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer;
    private cubes: THREE.Mesh[] = [];
    private analyser: THREE.AudioAnalyser | null = null;
    private isAudioConnected = false;

    constructor() {
        super({});
        this.element = document.createElement('canvas'); 
        this.element.id = 'three-visualizer-canvas';
        this.element.style.position = 'fixed';
        this.element.style.top = '0';
        this.element.style.left = '0';
        this.element.style.zIndex = '-1';
    }

    // We don't render HTML, we mount a canvas
    protected render(): string {
        return ``; 
    }

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
        this.analyser = new THREE.AudioAnalyser(audio, 32); // 32 is the FFT size (must be power of 2)

        this.isAudioConnected = true;
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

        const gridSize = 16; // Corresponds to half the FFT size (32 / 2)
        const cubeSize = 0.5;
        const spacing = 0.2;
        const totalWidth = (gridSize * (cubeSize + spacing)) - spacing;
        const startX = -totalWidth / 2;

        const geometry = new THREE.BoxGeometry(cubeSize, 1, cubeSize);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x00ff99,
            emissive: 0x00ff99,
            emissiveIntensity: 0.5
        });

        for (let i = 0; i < gridSize; i++) {
            const cube = new THREE.Mesh(geometry, material);
            cube.position.x = startX + i * (cubeSize + spacing);
            this.scene.add(cube);
            this.cubes.push(cube);
        }
    }

    private animate = () => {
        requestAnimationFrame(this.animate);

        const minScale = 0.1;
        const maxHeight = 5;

        if (this.analyser) {
            const data = this.analyser.getFrequencyData();
            this.cubes.forEach((cube, i) => {
                const value = data[i];
                const scale = Math.max(minScale, (value / 255) * maxHeight);
                cube.scale.y = scale;
                cube.position.y = scale / 2 - (maxHeight / 2) + 0.5; 
            });
        } else {
            // If no audio is playing, set to the "zero" state.
            this.cubes.forEach(cube => {
                const scale = minScale;
                cube.scale.y = scale;
                cube.position.y = scale / 2 - (maxHeight / 2) + 0.5;
            });
        }

        this.renderer.render(this.scene, this.camera);
    }
}
