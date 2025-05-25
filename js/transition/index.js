import * as THREE from 'three';
import { gsap } from 'gsap';
import transitionFragment from "../glsl/transition/transition_frag.js"
import transitionVertex from '../glsl/transition/transition_frag.js';

export function createLargePlane() {

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
        transparent: true,
        depthWrite: false, // Add this to prevent depth conflicts
        depthTest: true
    });

    const largeGeometry = new THREE.PlaneGeometry(1, 1, 24, 24);
    const largePlane = new THREE.Mesh(largeGeometry, largeShaderMaterial);
    largePlane.position.z = 10;

    gsap.to(largeShaderMaterial.uniforms.progress, {
        value: 1,
        duration: 2,
        ease: 'power2.inOut',
    });

    return largePlane;
}
