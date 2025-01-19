import * as THREE from 'three';

import simFragment from '../glsl/moon/simFragment.js';
import simVertex from '../glsl/moon/simVertex.js';

export function setupFBO(context) {
    context.size = 256;
    context.fbo = context.getRenderTarget();
    context.fbo1 = context.getRenderTarget();

    context.fboScene = new THREE.Scene();
    context.fboCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
    context.fboCamera.position.set(0, 0, 0.5);
    context.fboCamera.lookAt(0, 0, 0);

    const geometry = new THREE.PlaneGeometry(2, 2);
    context.data = new Float32Array(context.size * context.size * 4);

    context.infoArray = new Float32Array(context.size * context.size * 4);
    for (let i = 0; i < context.size; i++) {
        for (let j = 0; j < context.size; j++) {
            const index = (i + j * context.size) * 4;
            context.infoArray[index] = 0.5 * Math.random();
            context.infoArray[index + 1] = 0.5 * Math.random();
            context.infoArray[index + 2] = 1.0;
            context.infoArray[index + 3] = 1.0;
        }
    }

    context.fboTexture = new THREE.DataTexture(
        context.data,
        context.size,
        context.size,
        THREE.RGBAFormat,
        THREE.FloatType
    );
    context.fboTexture.magFilter = THREE.NearestFilter;
    context.fboTexture.minFilter = THREE.NearestFilter;
    context.fboTexture.needsUpdate = true;

    context.fboMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            uPositions: { value: context.fboTexture },
            uInfo: { value: null },
        },
        vertexShader: simVertex,
        fragmentShader: simFragment,
    });

    context.infoArray = new Float32Array(context.size * context.size * 4);
    for (let i = 0; i < context.size; i++) {
        for (let j = 0; j < context.size; j++) {
            const index = (i + j * context.size) * 4;
            context.infoArray[index] = 0.5 * Math.random();
            context.infoArray[index + 1] = 0.5 * Math.random();
            context.infoArray[index + 2] = 1.0;
            context.infoArray[index + 3] = 1.0;
        }
    }

    context.info = new THREE.DataTexture(
        context.infoArray,
        context.size,
        context.size,
        THREE.RGBAFormat,
        THREE.FloatType
    );

    context.info.magFilter = THREE.NearestFilter;
    context.info.minFilter = THREE.NearestFilter;
    context.info.needsUpdate = true;
    context.fboMaterial.uniforms.uInfo.value = context.info;

    context.fboMesh = new THREE.Mesh(geometry, context.fboMaterial);
    context.fboScene.add(context.fboMesh);

    context.overlayRenderer.setRenderTarget(context.fbo);
    context.overlayRenderer.render(context.fboScene, context.fboCamera);
    context.overlayRenderer.setRenderTarget(context.fbo1);
    context.overlayRenderer.render(context.fboScene, context.fboCamera);

    context.fboMesh.visible = false;
}