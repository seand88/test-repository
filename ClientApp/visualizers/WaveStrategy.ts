import * as THREE from 'three';
import { IVisualizerStrategy } from './IVisualizerStrategy.js';

export class WaveStrategy implements IVisualizerStrategy {
    private line: THREE.Line | null = null;
    private readonly segments = 128; // Must be more than FFT size / 2

    init(scene: THREE.Scene): void {
        const material = new THREE.LineBasicMaterial({ color: 0x00ffff });
        const points = [];
        for (let i = 0; i < this.segments; i++) {
            points.push(new THREE.Vector3(-10 + (i * 0.16), 0, 0));
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        this.line = new THREE.Line(geometry, material);
        scene.add(this.line);
    }

    update(analyser: THREE.AudioAnalyser | null): void {
        if (!this.line) return;

        const positions = this.line.geometry.attributes.position;
        const zeroLevel = 0; // The Y position for a flat line

        if (analyser) {
            const data = analyser.getFrequencyData();
            const maxWaveHeight = 2; // Max height for the wave

            for (let i = 0; i < this.segments; i++) {
                const dataIndex = Math.floor(i / (this.segments / data.length));
                const value = data[dataIndex] || 0;
                const y = (value / 255) * maxWaveHeight - (maxWaveHeight / 2); // Center the wave
                positions.setY(i, y);
            }
        } else {
            // If no analyser, set to a flat line
            for (let i = 0; i < this.segments; i++) {
                positions.setY(i, zeroLevel);
            }
        }

        positions.needsUpdate = true;
    }

    dispose(scene: THREE.Scene): void {
        if (this.line) {
            scene.remove(this.line);
            this.line.geometry.dispose();
            (this.line.material as THREE.Material).dispose();
            this.line = null;
        }
    }
}
