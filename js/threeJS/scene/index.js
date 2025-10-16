import * as THREE from 'three';
import { CSS2DRenderer } from 'three/examples/jsm/Addons.js';

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
    canvas.style.pointerEvents = 'none';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '0';

    context.renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: canvas,
        alpha: true,
        powerPreference: 'high-performance',
        precision: 'highp',
        dithering: true
    });

    context.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    context.renderer.setSize(window.innerWidth, window.innerHeight);
    context.renderer.autoClear = false;

    context.labelRenderer = new CSS2DRenderer();
    context.labelRenderer.setSize(window.innerWidth, window.innerHeight);
    context.labelRenderer.domElement.style.position = 'fixed';
    context.labelRenderer.domElement.style.top = '0px';
    context.labelRenderer.domElement.style.left = '0px';
    context.labelRenderer.domElement.style.pointerEvents = 'none';
    context.labelRenderer.domElement.style.zIndex = '15';
    context.labelRenderer.domElement.style.overflow = 'hidden';
    document.body.appendChild(context.labelRenderer.domElement);

    context.group = new THREE.Group();
    context.scene.add(context.group);

    context.cssGroup = new THREE.Group();
    context.scene.add(context.cssGroup);
}