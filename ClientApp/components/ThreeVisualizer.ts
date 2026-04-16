import { Component } from '../core/Component.js';
import * as THREE from 'three';

export class ThreeVisualizer extends Component<{}> {
    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer;
    private cubes: THREE.Mesh[] = [];

    constructor() {
        super({});
        // We need a <canvas> element, not the default <div> from the base class.
        this.element = document.createElement('canvas'); 
        this.element.id = 'three-visualizer-canvas';
        this.element.style.position = 'fixed';
        this.element.style.top = '0';
        this.element.style.left = '0';
        this.element.style.zIndex = '-1'; // Put it behind all other content
    }

    // We don't render HTML, we mount a canvas
    protected render(): string {
        return ``; 
    }

    public mount(container: HTMLElement) {
        // Override mount to attach our canvas directly
        container.appendChild(this.element);
        this.initThree();
        this.animate();
    }

    private initThree() {
        // Scene
        this.scene = new THREE.Scene();

        // Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.element as HTMLCanvasElement,
            antialias: true,
            alpha: true // Transparent background
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Add some basic lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0xffffff, 0.5);
        pointLight.position.set(2, 3, 4);
        this.scene.add(pointLight);

        // Create a grid of cubes
        const gridSize = 16;
        const cubeSize = 0.5;
        const spacing = 0.1;
        const totalWidth = (gridSize * (cubeSize + spacing)) - spacing;
        const startX = -totalWidth / 2;

        const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });

        for (let i = 0; i < gridSize; i++) {
            const cube = new THREE.Mesh(geometry, material);
            cube.position.x = startX + i * (cubeSize + spacing);
            this.scene.add(cube);
            this.cubes.push(cube);
        }
    }

    // Dummy animation loop for now
    private animate = () => {
        requestAnimationFrame(this.animate);

        // Make the bars go up and down with a sine wave for testing
        const time = Date.now() * 0.001;
        this.cubes.forEach((cube, i) => {
            cube.scale.y = Math.sin(time + i) * 0.5 + 1;
        });

        this.renderer.render(this.scene, this.camera);
    }
}
