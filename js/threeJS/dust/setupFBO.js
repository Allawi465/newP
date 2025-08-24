import * as THREE from 'three';
import simFragment from '../glsl/dust/simFragment.js';
import simVertex from '../glsl/dust/simVertex.js';

export default function setupFBO(context) {
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
            var r = context.yN(0, 0, 0, 1.0 + Math.random() * 0.2);

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
            uLetterScale: { value: 3. },
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

    const targetsTex = makeTextTargetsSimple("CONNECT", context.size);
    context.fboMaterial.uniforms.uTargets.value = targetsTex;

    context.renderer.setRenderTarget(context.fbo);
    context.renderer.render(context.fboScene, context.fboCamera);
    context.renderer.setRenderTarget(context.fbo1);
    context.renderer.render(context.fboScene, context.fboCamera);
}

function makeTextTargetsSimple(
    text = "Connect",
    size = 256,
    fontFamily = "Poppins, sans-serif",
    fontWeight = 900,
    fontStyle = "normal",
    fontSize = 200,
    canvasW = 1024,
    canvasH = 512,
    step = 1,
) {
    const cvs = document.createElement("canvas");
    cvs.width = canvasW; cvs.height = canvasH;
    const ctx = cvs.getContext("2d");
    ctx.clearRect(0, 0, canvasW, canvasH);
    ctx.fillStyle = "#fff";
    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px '${fontFamily}'`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvasW * 0.5, canvasH * 0.5);

    const img = ctx.getImageData(0, 0, canvasW, canvasH).data;
    const pts = [];
    for (let y = 0; y < canvasH; y += step) {
        for (let x = 0; x < canvasW; x += step) {
            const i = (y * canvasW + x) * 4;
            if (img[i + 3] > 10) {
                const nx = (x - canvasW / 2) / (canvasW / 2);
                const ny = -(y - canvasH / 2) / (canvasH / 2);
                pts.push([nx, ny]);
            }
        }
    }

    const count = size * size;
    const data = new Float32Array(count * 4);
    for (let k = 0; k < count; k++) {
        const p = pts[(k * 1315423911) % pts.length];
        data[k * 4 + 0] = p[0];
        data[k * 4 + 1] = p[1];
        data[k * 4 + 2] = 0.0;
        data[k * 4 + 3] = 1.0;
    }

    const tex = new THREE.DataTexture(
        data,
        size,
        size,
        THREE.RGBAFormat,
        THREE.FloatType
    );
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.needsUpdate = true;
    return tex;
}