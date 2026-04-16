import { describe, it, expect, vi } from 'vitest';
import * as THREE from 'three';
import { BarStrategy } from './BarStrategy';

// Mock THREE
vi.mock('three', async (importOriginal) => {
    const original = await importOriginal<typeof THREE>();
    return {
        ...original,
        BoxGeometry: class {},
        MeshStandardMaterial: class {},
        Mesh: class {
            position = { x: 0, y: 0, z: 0 };
            scale = { y: 1 };
        },
        Scene: class {
            add = vi.fn();
            remove = vi.fn();
        }
    };
});

describe('BarStrategy', () => {
    it('should initialize cubes in the scene', () => {
        const scene = new THREE.Scene();
        const strategy = new BarStrategy();
        
        strategy.init(scene as any);
        
        expect(scene.add).toHaveBeenCalledTimes(16);
    });

    it('should update cube scales based on audio data', () => {
        const scene = new THREE.Scene();
        const strategy = new BarStrategy();
        strategy.init(scene as any);
        
        const mockAnalyser = {
            getFrequencyData: vi.fn(() => new Uint8Array(16).fill(128))
        };
        
        strategy.update(mockAnalyser as any);
    });

    it('should dispose correctly', () => {
        const scene = new THREE.Scene();
        const strategy = new BarStrategy();
        strategy.init(scene as any);
        strategy.dispose(scene as any);
        
        expect(scene.remove).toHaveBeenCalledTimes(16);
    });
});
