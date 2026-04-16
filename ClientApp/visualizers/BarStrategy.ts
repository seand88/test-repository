import * as THREE from 'three';
import { IVisualizerStrategy } from './IVisualizerStrategy.js';

export class BarStrategy implements IVisualizerStrategy {
    private cubes: THREE.Mesh[] = [];
    private readonly gridSize = 16;

    init(scene: THREE.Scene): void {
        const cubeSize = 0.5;
        const spacing = 0.2;
        const totalWidth = (this.gridSize * (cubeSize + spacing)) - spacing;
        const startX = -totalWidth / 2;

        const geometry = new THREE.BoxGeometry(cubeSize, 1, cubeSize);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x00ff99,
            emissive: 0x00ff99,
            emissiveIntensity: 0.5
        });

        for (let i = 0; i < this.gridSize; i++) {
            const cube = new THREE.Mesh(geometry, material);
            cube.position.x = startX + i * (cubeSize + spacing);
            this.cubes.push(cube);
            scene.add(cube);
        }
        this.reset(); // Set initial flat state
    }

    update(analyser: THREE.AudioAnalyser | null): void {
        const minScale = 0.1;
        const maxHeight = 5;

        if (analyser) {
            const data = analyser.getFrequencyData();
            this.cubes.forEach((cube, i) => {
                const value = data[i] || 0;
                const scale = Math.max(minScale, (value / 255) * maxHeight);
                cube.scale.y = scale;
                cube.position.y = scale / 2 - (maxHeight / 2) + 0.5; 
            });
        } else {
            this.reset();
        }
    }

    dispose(scene: THREE.Scene): void {
        this.cubes.forEach(cube => scene.remove(cube));
        this.cubes = [];
    }

    private reset(): void {
        const minScale = 0.1;
        const maxHeight = 5;
        this.cubes.forEach(cube => {
            const scale = minScale;
            cube.scale.y = scale;
            cube.position.y = scale / 2 - (maxHeight / 2) + 0.5;
        });
    }
}
