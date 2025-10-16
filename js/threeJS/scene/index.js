import * as THREE from 'three';

export default function setupScene(context) {
    context.scene = new THREE.Scene();
    const aspect = window.innerWidth / window.innerHeight;
    const viewHeight = context.VIEW_WIDTH / aspect;

    context.camera = new THREE.OrthographicCamera(
        -context.VIEW_WIDTH / 2,
        context.VIEW_WIDTH / 2,
        viewHeight / 2,
        -viewHeight / 2,
        0.01,
        1000
    );
    context.camera.position.z = context.defaultCameraZ;
    context.camera.updateProjectionMatrix();

    const canvas = document.getElementById('canvas');

    context.renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: canvas,
        alpha: true,
    });

    context.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    context.renderer.setSize(window.innerWidth, window.innerHeight);
}