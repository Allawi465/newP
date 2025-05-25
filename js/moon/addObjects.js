import * as THREE from 'three';

import fragment from '../glsl/moon/fragment.js';
import vertexParticles from '../glsl/moon/vertexParticles.js';

export function addObjects(context) {
    context.material = new THREE.ShaderMaterial({
        extensions: { derivatives: "#extension GL_OES_standard_derivatives : enable" },
        side: THREE.DoubleSide,
        uniforms: {
            time: { value: 0 },
            uPositions: { value: null },
            resolution: { value: new THREE.Vector4() },
            opacity: { value: 1.0 },
        },
        transparent: true,
        vertexShader: vertexParticles,
        fragmentShader: fragment,
        depthTest: false,
    });

    context.count = context.size ** 2;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(context.count * 3);
    const uv = new Float32Array(context.count * 2);

    for (let i = 0; i < context.size; i++) {
        for (let j = 0; j < context.size; j++) {
            const index = i + j * context.size;
            positions[index * 3] = Math.random();
            positions[index * 3 + 1] = Math.random();
            positions[index * 3 + 2] = 0;
            uv[index * 2] = i / context.size;
            uv[index * 2 + 1] = j / context.size;
        }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));

    context.material.uniforms.uPositions.value = context.fboTexture;

    context.points = new THREE.Points(geometry, context.material);
    context.scene.add(context.points);

    context.points.position.set(4.1, 0.4, 0);
}