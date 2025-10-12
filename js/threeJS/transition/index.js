import * as THREE from 'three';
import transitionFragment from '../glsl/transition/transition_frag.js';
import transitionVertex from '../glsl/transition/transition_vertex.js';
import onWindowResize from '../resize/index.js';

export default function createLargePlane(context) {

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
        depthWrite: true,
        depthTest: true
    });

    const largeGeometry = new THREE.PlaneGeometry(1, 1, 24, 24);
    context.largePlane = new THREE.Mesh(largeGeometry, largeShaderMaterial);
    context.largeShaderMaterial = largeShaderMaterial;


    onWindowResize(context);

    return context.largePlane;
}
