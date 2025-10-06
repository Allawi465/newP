import * as THREE from 'three';
import simFragment from '../glsl/dust/simFragment.js';
import simVertex from '../glsl/dust/simVertex.js';
import makeTextTargetsSimple from './ctx.js';


export default async function setupFBO(context) {
    await context.loadFont("Space Grotesk", "600", 180);

    context.size = 256;
    context.fbo = context.getRenderTarget();
    context.fbo1 = context.getRenderTarget();

    context.fboScene = new THREE.Scene();
    context.fboCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
    context.fboCamera.position.set(0, 0, 0.5);
    context.fboCamera.lookAt(0, 0, 0);

    const geometry = new THREE.PlaneGeometry(2, 2);
    context.data = new Float32Array(context.size * context.size * 4);

    for (let i = 0; i < context.size; i++) {
        for (let j = 0; j < context.size; j++) {
            const index = (i + j * context.size) * 4;
            const r = context.yN(0, 0, 0, 1.0 + Math.random() * 0.2);
            context.data[index] = r[0];
            context.data[index + 1] = r[1];
            context.data[index + 2] = r[2];
            context.data[index + 3] = Math.random();
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
            uRandom: { value: 0 },
            uRandom2: { value: 0 },
            resolution: { value: new THREE.Vector2(context.width, context.height) },
            uPositions: { value: context.fboTexture },
            uSpherePos: { value: new THREE.Vector3(0, 0, 0) },
            uDelta: { value: 0.0 },
            uReset: { value: 0.0 },
            uFooter: { value: 0.0 },
            uLetterScale: { value: 3.0 },
            uTargets: { value: null },
        },
        vertexShader: simVertex,
        fragmentShader: simFragment,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        blending: THREE.NoBlending,
    });

    context.fboMesh = new THREE.Mesh(geometry, context.fboMaterial);
    context.fboScene.add(context.fboMesh);

    // Generate texture after font is loaded
    const targetsTex = makeTextTargetsSimple("CONNECT", context.size);
    context.fboMaterial.uniforms.uTargets.value = targetsTex;

    // Render to FBOs
    context.renderer.setRenderTarget(context.fbo);
    context.renderer.render(context.fboScene, context.fboCamera);
    context.renderer.setRenderTarget(context.fbo1);
    context.renderer.render(context.fboScene, context.fboCamera);
}