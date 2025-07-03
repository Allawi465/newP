import * as THREE from 'three';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GUI from 'lil-gui';
import fragment from '../glsl/dust/fragment.js';
import vertex from '../glsl/dust/vertex.js';

export default function addObjects(context) {
    const gui = new GUI({ width: 200 }); // Don't reuse any existing instance
    gui.title('Particles Color');

    // Add only one folder
    const colorParams = { particleColor: '#ffffff' };
    const fogColorParams = { uFogColor: '#175454' };

    // Add controls directly to root (not in a folder)
    gui.addColor(colorParams, 'particleColor').onChange((value) => {
        context.material.uniforms.uColor.value.set(new THREE.Color(value));
    });

    gui.addColor(fogColorParams, 'uFogColor').name('Fog Color').onChange((value) => {
        context.material.uniforms.uFogColor.value.set(new THREE.Color(value));
    });

    const glassGeometry = new THREE.IcosahedronGeometry(0.22, 22);
    context.glassMaterial = new THREE.MeshPhysicalMaterial({
        thickness: 0.15,
        roughness: 0.2,
        metalness: 0.35,
        opacity: 0.0,
        envMapIntensity: 10,
        transparent: true,
        color: new THREE.Color(0x141414),
        emissive: new THREE.Color(0x2D3E40),
        depthWrite: false,
        depthTest: true
    });

    context.glassBall = new THREE.Mesh(glassGeometry, context.glassMaterial);
    context.glassBall.position.set(0, 0, 0);
    context.glassBall.layers.set(context.SPHERE_LAYER);
    context.scene.add(context.glassBall);


    context.material = new THREE.ShaderMaterial({
        extensions: { derivatives: "#extension GL_OES_standard_derivatives : enable" },
        uniforms: {
            time: { value: 0 },
            uPositions: { value: context.fboTexture },
            uMouse: { value: new THREE.Vector2() },
            uMousePrev: { value: new THREE.Vector2() },
            iResolution: { value: new THREE.Vector2(context.width, context.height) },
            uScrollProgress: { value: 0.0 },
            uOpacity: { value: 0.0 },
            uCameraPos: { value: new THREE.Vector3() },
            uColor: { value: new THREE.Color(colorParams.particleColor) },
            uFogColor: { value: new THREE.Color(fogColorParams.uFogColor) },
        },
        vertexShader: vertex,
        fragmentShader: fragment,
        blending: THREE.NormalBlending,
        transparent: true,
        depthWrite: false,
        depthTest: true
    });

    context.count = context.size * context.size;
    let geometry = new THREE.BufferGeometry();
    let positions = new Float32Array(context.count * 4);
    let uv = new Float32Array(context.count * 2);
    let indices = new Float32Array(context.count * 2);
    let ids = new Float32Array(context.count * 1);

    for (let i = 0; i < context.size; i++) {
        for (let j = 0; j < context.size; j++) {
            let index = (i * context.size + j);

            positions[index * 4] = (Math.random() - 0.5) * 2;
            positions[index * 4 + 1] = (Math.random() - 0.5) * 2;
            positions[index * 4 + 2] = (Math.random() - 0.5) * 2;
            positions[index * 4 + 3] = 1.0;

            uv[index * 2] = j / context.size;
            uv[index * 2 + 1] = i / context.size;

            indices[index * 2] = j / context.size;
            indices[index * 2 + 1] = i / context.size;

            ids[index] = index;
        }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 4));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geometry.setAttribute('aIndex', new THREE.BufferAttribute(indices, 2));
    geometry.setAttribute('aId', new THREE.BufferAttribute(ids, 1));

    context.points = new THREE.Points(geometry, context.material);
    context.points.layers.set(context.PARTICLE_LAYER);
    context.points.frustumCulled = false;
    context.points.renderOrder = 3;
    context.scene.add(context.points);

    context.cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
        format: THREE.RGBAFormat,
        generateMipmaps: true,
        minFilter: THREE.LinearMipmapLinearFilter
    });
    context.cubeCamera = new THREE.CubeCamera(0.01, 1000, context.cubeRenderTarget);
    context.scene.add(context.cubeCamera);

    context.glassMaterial.envMap = context.cubeRenderTarget.texture;
    context.glassMaterial.needsUpdate = true;

    context.fboMaterial.uniforms.uSpherePos.value = context.glassBall.position;
    ScrollTrigger.create({
        trigger: ".hero",
        start: "top top",
        end: "55% top",
        scrub: true,
        onEnterBack: () => {
            // When scrolling back up to hero
            context.chromaticBendPass.uniforms.offset.value.set(0.0025, 0.0025);
        },
        onUpdate: self => {
            if (context.isLoading) return;
            context.material.uniforms.uScrollProgress.value = self.progress;
            context.glassMaterial.opacity = 1 - self.progress;
            context.glassMaterial.needsUpdate = true;
        },
        onLeave: () => {
            context.material.uniforms.uScrollProgress.value = 1;
            context.chromaticBendPass.uniforms.offset.value.set(0.001, 0.001);
        },
    });
}