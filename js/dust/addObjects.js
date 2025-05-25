import * as THREE from 'three';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import fragment from '../glsl/dust/fragment.js';
import vertex from '../glsl/dust/vertex.js';
import * as dat from 'dat.gui';

export function addObjects(context) {
    /*     const gui = new dat.GUI();
        const PartFolder = gui.addFolder('Particles'); */
    const glassGeometry = new THREE.IcosahedronGeometry(0.22, 22);
    context.glassMaterial = new THREE.MeshPhysicalMaterial({
        thickness: 0.1,
        roughness: 0.1,
        metalness: 0.2,
        opacity: 0.0,
        envMapIntensity: 10,
        transparent: true,
        color: new THREE.Color(0x141414),
        emissive: new THREE.Color(0x141414),
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
        },
        vertexShader: vertex,
        fragmentShader: fragment,
        blending: THREE.NormalBlending,
        transparent: true,
        depthWrite: false,
        depthTest: true
    });


    /*     PartFolder.add(pointColorParams, 'x', 0, 1).name('Color X').onChange(val => {
            context.material.uniforms.pointColor.value.x = val;
        });
        PartFolder.add(pointColorParams, 'y', 0, 1).name('Color Y').onChange(val => {
            context.material.uniforms.pointColor.value.y = val;
    
        PartFolder.open(); */

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
    context.points.renderOrder = 3;
    context.scene.add(context.points);

    context.cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
        format: THREE.RGBAFormat,
        generateMipmaps: true,
        minFilter: THREE.LinearMipmapLinearFilter
    });
    context.cubeCamera = new THREE.CubeCamera(0.08, 1000, context.cubeRenderTarget);
    context.scene.add(context.cubeCamera);

    context.cubeCamera.layers.disable(context.PLANE_LAYER);
    context.cubeCamera.layers.disable(context.slider_mesh);
    context.cubeCamera.layers.enable(context.PARTICLE_LAYER);

    context.glassMaterial.envMap = context.cubeRenderTarget.texture;
    context.glassMaterial.needsUpdate = true;

    context.fboMaterial.uniforms.uSpherePos.value = context.glassBall.position;
    ScrollTrigger.create({
        trigger: ".hero",
        start: "top top",
        end: "55% top",
        scrub: true,
        onUpdate: self => {
            if (context.isLoading) return;
            context.material.uniforms.uScrollProgress.value = self.progress;
            context.glassMaterial.opacity = 1 - self.progress;
            context.glassMaterial.needsUpdate = true;
        },
        onLeave: () => {
            context.material.uniforms.uScrollProgress.value = 1;
        },
    });
}