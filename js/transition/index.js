import * as THREE from 'three';
import { gsap } from 'gsap';
import transitionFragment from "../glsl/transition/transition_frag.js"
import transitionVertex from '../glsl/transition/transition_frag.js';

export function createLargePlane(content) {
    const largeShaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
            width: { value: 5 },
            scaleX: { value: 4.7 },
            scaleY: { value: 2.9 },
            progress: { value: 0 },
            time: { value: 1 }
        },
        vertexShader: transitionVertex,
        fragmentShader: transitionFragment,
        transparent: true
    });

    const largeGeometry = new THREE.PlaneGeometry(1, 1, 24, 24);
    const largePlane = new THREE.Mesh(largeGeometry, largeShaderMaterial);

    gsap.to(largeShaderMaterial.uniforms.progress, {
        value: 1,
        duration: 2,
        ease: 'power2.inOut',
    });

    return largePlane;
}

export function updateLargePlaneGeometry(largePlane, camera, newWidth, newHeight) {
    if (!largePlane) return;  // Add a check to avoid errors if largePlane is null

    const aspect = newWidth / newHeight;
    const planeHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * Math.abs(camera.position.z - largePlane.position.z);
    const planeWidth = planeHeight * aspect;

    largePlane.geometry.dispose();
    largePlane.geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, 24, 24);
}