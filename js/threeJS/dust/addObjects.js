import * as THREE from 'three';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import gsap from "gsap";
import fragment from '../glsl/dust/fragment.js';
import vertex from '../glsl/dust/vertex.js';

gsap.registerPlugin(ScrollTrigger);

export default function addObjects(context) {
    const colorParams = { particleColor: '#d0e2eb' };
    const fogColorParams = { uFogColor: '#ffffff' };

    context.material = new THREE.ShaderMaterial({
        extensions: { derivatives: "#extension GL_OES_standard_derivatives : enable" },
        uniforms: {
            time: { value: 0 },
            uPositions: { value: context.fbo.texture },
            uMouse: { value: new THREE.Vector2() },
            uMousePrev: { value: new THREE.Vector2() },
            iResolution: { value: new THREE.Vector2(context.width, context.height) },
            uScrollProgress: { value: 0.0 },
            uOpacity: { value: 0.0 },
            uCameraPos: { value: new THREE.Vector3() },
            uColor: { value: new THREE.Color(colorParams.particleColor) },
            uFogColor: { value: new THREE.Color(fogColorParams.uFogColor) },
            uFooter: { value: 0.0 },
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
        }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 4));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geometry.setAttribute('aIndex', new THREE.BufferAttribute(indices, 2));

    context.points = new THREE.Points(geometry, context.material);
    context.points.layers.set(context.PARTICLE_LAYER);
    context.points.frustumCulled = false;
    context.points.renderOrder = 3;
    context.scene.add(context.points);

    const glassGeometry = new THREE.IcosahedronGeometry(0.22, 22);
    context.glassMaterial = new THREE.MeshPhysicalMaterial({
        thickness: 0.3,
        roughness: 0.1,
        metalness: .5,
        opacity: 0.0,
        envMapIntensity: 1.5,
        transparent: true,
        color: new THREE.Color(0xF0F2F2),
        emissive: new THREE.Color(0x616161),
        transparent: true,
        depthWrite: false,
        depthTest: true
    });

    context.glassBall = new THREE.Mesh(glassGeometry, context.glassMaterial);
    context.glassBall.position.set(0, 0, 0);
    context.glassBall.layers.set(context.SPHERE_LAYER);
    context.scene.add(context.glassBall);

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
        end: "60% top",
        scrub: true,
        onEnterBack: () => {
            context.chromaticBendPass.uniforms.offset.value.set(0.001, 0.001);
        },
        onUpdate: self => {
            context.glassMaterial.opacity = 1 - self.progress;
            context.glassMaterial.needsUpdate = true;
            context.material.uniforms.uScrollProgress.value = self.progress;
        },
        onLeave: () => {
            context.chromaticBendPass.uniforms.offset.value.set(0.000, 0.000);
            context.glassMaterial.opacity = 0
        },
    });

    ScrollTrigger.create({
        trigger: ".footer",
        start: "center 90%",
        end: "bottom bottom",
        scrub: true,
        scroller: document.body,
        onUpdate: (self) => {
            context.glassMaterial.opacity = self.progress;
            context.glassMaterial.needsUpdate = true;

            context.material.uniforms.uScrollProgress.value = 1 - self.progress;
            context.material.uniforms.uFooter.value = self.progress;


            context.fboMaterial.uniforms.uFooter.value = self.progress;


            context.glassMaterial.roughness = Math.min(
                0.4,
                Math.max(0.1, self.progress - 0.6)
            );

            context.glassMaterial.thickness = Math.min(
                0.5,
                Math.max(0.3, self.progress - 0.5)
            );

            if (!context.isTouchDevice() || !context.bounceTween) return;

            const dir = self.progress > 0 ? 'x' : 'y';
            if (context.bounceDirection !== dir) {
                gsap.set(context.targetPositionSphre, dir === 'x' ? { y: 0 } : { x: 0 });
                context.startBounce(context, dir, dir === 'x' ? 1.5 : 2, 5);
            }
        },
        onLeaveBack: () => {
            context.fboMaterial.uniforms.uFooter.value = 0;
        }
    });
}