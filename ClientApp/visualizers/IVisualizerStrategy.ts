import * as THREE from 'three';

export interface IVisualizerStrategy {
    /**
     * Called when the strategy is first set. Use this to add objects to the scene.
     * @param scene The Three.js scene to add objects to.
     */
    init(scene: THREE.Scene): void;

    /**
     * Called on every animation frame. Use this to update the visualizer based on audio data.
     * @param analyser The Three.js AudioAnalyser providing the frequency data, or null if no audio is connected.
     */
    update(analyser: THREE.AudioAnalyser | null): void;

    /**
     * Called when the strategy is being switched out. Use this to remove objects from the scene.
     * @param scene The Three.js scene to remove objects from.
     */
    dispose(scene: THREE.Scene): void;
}
