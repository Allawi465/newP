import * as THREE from 'three';
import { CSS2DRenderer } from 'three/examples/jsm/Addons.js';

export function setupScene(context) {
    context.scene = new THREE.Scene();
    context.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
    context.camera.position.z = context.defaultCameraZ;

    context.renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: document.getElementById('canvas'),
        alpha: true,
    });
    context.renderer.setPixelRatio(window.devicePixelRatio);
    context.renderer.setSize(window.innerWidth, window.innerHeight);
    context.renderer.setClearColor(0xffffff, 1);
    document.body.appendChild(context.renderer.domElement);

    context.labelRenderer = new CSS2DRenderer();
    context.labelRenderer.setSize(window.innerWidth, window.innerHeight);
    context.labelRenderer.domElement.style.position = 'fixed';
    context.labelRenderer.domElement.style.top = '0px';
    context.labelRenderer.domElement.style.pointerEvents = 'none';
    context.labelRenderer.domElement.style.zIndex = '60';
    document.body.appendChild(context.labelRenderer.domElement);

    context.group = new THREE.Group();
    context.scene.add(context.group);

    context.cssGroup = new THREE.Group();
    context.scene.add(context.cssGroup);
}