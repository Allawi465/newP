import * as THREE from 'three';
import onWindowResize from '../resize/index.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import fragment from '../glsl/moon/fragment.js';
import vertexParticles from '../glsl/moon/vertexParticles.js';

gsap.registerPlugin(ScrollTrigger);

export default function addMoonParticles(context) {
    const fogColorParams = { uFogColor: '#ffffff' };
    context.moonParticleMaterial = new THREE.ShaderMaterial({
        extensions: { derivatives: "#extension GL_OES_standard_derivatives : enable" },
        uniforms: {
            time: { value: 0 },
            uPositions: { value: null },
            resolution: { value: new THREE.Vector4() },
            opacity: { value: 0 },
            uFogColor: { value: new THREE.Color(fogColorParams.uFogColor) },
            uCameraPos: { value: new THREE.Vector3() },
        },
        transparent: true,
        vertexShader: vertexParticles,
        fragmentShader: fragment,
        blending: THREE.NormalBlending,
        depthWrite: false,
        depthTest: true,
    });

    context.moonParticleCount = context.moonSize ** 2;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(context.moonParticleCount * 3);
    const uvs = new Float32Array(context.moonParticleCount * 2);

    for (let i = 0; i < context.moonSize; i++) {
        for (let j = 0; j < context.moonSize; j++) {
            const index = i + j * context.moonSize;
            positions[index * 3 + 0] = Math.random();
            positions[index * 3 + 1] = Math.random();
            positions[index * 3 + 2] = 0;
            uvs[index * 2 + 0] = i / context.moonSize;
            uvs[index * 2 + 1] = j / context.moonSize;
        }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

    context.moonParticleMaterial.uniforms.uPositions.value = context.moonSimTexture;

    context.moonParticlePoints = new THREE.Points(geometry, context.moonParticleMaterial);
    context.moonParticlePoints.layers.set(context.MOON_LAYER);
    context.scene.add(context.moonParticlePoints);

    ScrollTrigger.create({
        trigger: ".footer",
        start: "center bottom",
        end: "bottom bottom",
        scrub: true,
        scroller: document.body,
        onUpdate: (self) => {
            const progress = self.progress;
            context.moonParticleMaterial.uniforms.opacity.value = progress;
            context.moonFBOMaterial.uniforms.progress.value = progress;


            context.chromaticBendPass.uniforms.offset.value.set(
                0.001 * progress,
                0.001 * progress
            );

            context.VIEW_WIDTH = 5.0 - (1.5 * progress);

            onWindowResize(context);

        },

        onLeaveBack: () => {
            context.chromaticBendPass.uniforms.offset.value.set(0.0, 0.0);
            context.moonParticleMaterial.uniforms.opacity.value = 0;
            context.moonFBOMaterial.uniforms.progress.value = 0;

            context.VIEW_WIDTH = 5.0;
            onWindowResize(context);
        },
    });


}