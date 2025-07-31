import * as THREE from 'three';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

import simFragment from '../glsl/moon/simFragment.js';
import simVertex from '../glsl/moon/simVertex.js';

export default function setupMoonFBO(context) {
    context.moonSize = 1024;
    context.moonFBO = context.getRenderTarget();
    context.moonFBO1 = context.getRenderTarget();

    context.moonFBOScene = new THREE.Scene();
    context.moonFBOCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
    context.moonFBOCamera.position.set(0, 0, 0.5);
    context.moonFBOCamera.lookAt(0, 0, 0);

    const geometry = new THREE.PlaneGeometry(2, 2);
    context.moonData = new Float32Array(context.moonSize * context.moonSize * 4);

    context.moonInfoArray = new Float32Array(context.moonSize * context.moonSize * 4);
    for (let i = 0; i < context.moonSize; i++) {
        for (let j = 0; j < context.moonSize; j++) {
            const index = (i + j * context.moonSize) * 4;
            context.moonInfoArray[index] = Math.random();
            context.moonInfoArray[index + 1] = Math.random();
            context.moonInfoArray[index + 2] = 1.0;
            context.moonInfoArray[index + 3] = 1.0;
        }
    }

    context.moonTexture = new THREE.DataTexture(
        context.moonData,
        context.moonSize,
        context.moonSize,
        THREE.RGBAFormat,
        THREE.FloatType
    );
    context.moonTexture.magFilter = THREE.NearestFilter;
    context.moonTexture.minFilter = THREE.NearestFilter;
    context.moonTexture.needsUpdate = true;

    const colorParams = { particleColor: '#d0e2eb' };

    context.moonFBOMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            uPositions: { value: context.moonTexture },
            uInfo: { value: null },
            progress: { value: 0 },
            uDelta: { value: 0. },
            uColor: { value: new THREE.Color(colorParams.particleColor) },
        },
        vertexShader: simVertex,
        fragmentShader: simFragment,
        blending: THREE.NoBlending,
    });

    context.moonInfo = new THREE.DataTexture(
        context.moonInfoArray,
        context.moonSize,
        context.moonSize,
        THREE.RGBAFormat,
        THREE.FloatType
    );

    context.moonInfo.magFilter = THREE.NearestFilter;
    context.moonInfo.minFilter = THREE.NearestFilter;
    context.moonInfo.needsUpdate = true;
    context.moonFBOMaterial.uniforms.uInfo.value = context.moonInfo;

    context.moonMesh = new THREE.Mesh(geometry, context.moonFBOMaterial);
    context.moonFBOScene.add(context.moonMesh);

    context.renderer.setRenderTarget(context.moonFBO);
    context.renderer.render(context.moonFBOScene, context.moonFBOCamera);
    context.renderer.setRenderTarget(context.moonFBO1);
    context.renderer.render(context.moonFBOScene, context.moonFBOCamera);

}