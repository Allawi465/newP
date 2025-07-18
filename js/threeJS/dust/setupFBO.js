import * as THREE from 'three';
import simFragment from '../glsl/dust/simFragment.js';
import simVertex from '../glsl/dust/simVertex.js';

function getRenderTarget() {
    const renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
    });
    return renderTarget;
}

export default function setupFBO(context) {
    context.size = 1024;
    context.fbo = getRenderTarget();
    context.fbo1 = getRenderTarget();

    context.fboScene = new THREE.Scene();
    context.fboCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
    context.fboCamera.position.set(0, 0, 0.5);
    context.fboCamera.lookAt(0, 0, 0);

    const geometry = new THREE.PlaneGeometry(2, 2);
    context.data = new Float32Array(context.size * context.size * 4);

    for (let i = 0; i < context.size; i++) {
        for (let j = 0; j < context.size; j++) {
            const index = (i + j * context.size) * 4;
            const r = yN(0, 0, 0, 0.5 + Math.random() * 0.2);

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
            uMouse: { value: new THREE.Vector2(0, 0) },
            uRandom: { value: 0 },
            uRandom2: { value: 0 },
            resolution: { value: new THREE.Vector2(context.width, context.height) },
            uPositions: { value: context.fboTexture },
            uSpherePos: { value: new THREE.Vector3(0, 0, 0) },
            uDelta: { value: 0. },
        },
        vertexShader: simVertex,
        fragmentShader: simFragment,
        depthWrite: false,
        depthTest: false,
        blending: THREE.NoBlending,
        transparent: true
    });

    context.infoArray = new Float32Array(context.size * context.size * 4);
    context.info = new THREE.DataTexture(context.infoArray, context.size, context.size, THREE.RGBAFormat, THREE.FloatType);

    context.info.magFilter = THREE.NearestFilter;
    context.info.minFilter = THREE.NearestFilter;
    context.info.needsUpdate = true;

    context.fboMesh = new THREE.Mesh(geometry, context.fboMaterial);
    context.fboScene.add(context.fboMesh);

    context.renderer.setRenderTarget(context.fbo);
    context.renderer.render(context.fboScene, context.fboCamera);
    context.renderer.setRenderTarget(context.fbo1);
    context.renderer.render(context.fboScene, context.fboCamera);

}

function yN(e, t, n, i) {
    var r = Math.random();
    var a = Math.random();
    var s = 2 * Math.PI * r;
    var o = Math.acos(2 * a - 1);
    var l = e + i * Math.sin(o) * Math.cos(s);
    var c = t + i * Math.sin(o) * Math.sin(s);
    var u = n + i * Math.cos(o);

    return [l, c, u];
}