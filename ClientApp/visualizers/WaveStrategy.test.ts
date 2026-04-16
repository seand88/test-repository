import { describe, it, expect, vi } from 'vitest';
import * as THREE from 'three';
import { WaveStrategy } from './WaveStrategy';

vi.mock('three', async (importOriginal) => {
    const original = await importOriginal<typeof THREE>();
    return {
        ...original,
        BufferGeometry: class {
            setFromPoints = vi.fn().mockReturnThis();
            attributes = {
                position: {
                    setY: vi.fn(),
                    needsUpdate: false
                }
            };
            dispose = vi.fn();
        },
        LineBasicMaterial: class {
            dispose = vi.fn();
        },
        Line: class {
            constructor(public geometry: any, public material: any) {}
            position = { y: 0 };
        },
        Scene: class {
            add = vi.fn();
            remove = vi.fn();
        }
    };
});

describe('WaveStrategy', () => {
    it('should initialize wave line in the scene', () => {
        const scene = new THREE.Scene();
        const strategy = new WaveStrategy();
        
        strategy.init(scene as any);
        
        expect(scene.add).toHaveBeenCalled();
    });

    it('should update line positions based on audio data', () => {
        const scene = new THREE.Scene();
        const strategy = new WaveStrategy();
        strategy.init(scene as any);
        
        const mockAnalyser = {
            getFrequencyData: vi.fn(() => new Uint8Array(128).fill(255))
        };
        
        strategy.update(mockAnalyser as any);
    });

    it('should dispose correctly', () => {
        const scene = new THREE.Scene();
        const strategy = new WaveStrategy();
        strategy.init(scene as any);
        strategy.dispose(scene as any);
        
        expect(scene.remove).toHaveBeenCalled();
    });
});
