import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { ClearPass } from 'three/examples/jsm/postprocessing/ClearPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';

export function setupPostProcessing(context) {
    context.composer = new EffectComposer(context.renderer);

    // Clear to white
    const clearPass = new ClearPass();
    clearPass.clearColor = new THREE.Color(0xffffff);
    clearPass.clearAlpha = 1.0;
    context.composer.addPass(clearPass);

    // Render PARTICLE_LAYER
    const particlePass = new RenderPass(context.scene, context.camera);
    particlePass.clear = false;
    particlePass.clearDepth = true;
    context.composer.addPass(particlePass);

    const bendPass = new ShaderPass({
        uniforms: {
            tDiffuse: { value: null },
            uPower: { value: 0.2 },
            uLiftAmount: { value: 0.02 },
            uBendRegion: { value: 0.075 }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D tDiffuse;
            uniform float uPower;
            uniform float uLiftAmount;
            uniform float uBendRegion;
            varying vec2 vUv;

            void main() {
                float strength = 1.0 - smoothstep(0.0, uBendRegion, vUv.y);
                vec2 displacement = vec2(
                    (0.5 - vUv.x) * strength * uPower,
                    strength * uLiftAmount
                );
                vec2 finalUv = vUv + displacement;
                gl_FragColor = texture2D(tDiffuse, finalUv);
            }
        `
    });
    context.composer.addPass(bendPass);

    // Chromatic aberration
    const chromatic = new ShaderPass({
        uniforms: {
            tDiffuse: { value: null },
            offset: { value: new THREE.Vector2(0.001, 0.001) },
            uExtraDown: { value: 0.005 }
        },
        vertexShader: `
            varying vec2 vUv;
            void main(){
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D tDiffuse;
            uniform vec2 offset;
            uniform float uExtraDown;
            varying vec2 vUv;
            void main(){
                float extraDown = smoothstep(0.5, 0.0, vUv.y) * uExtraDown;
                vec2 off = vec2(offset.x, offset.y + extraDown);
                float r = texture2D(tDiffuse, vUv + off).r;
                float g = texture2D(tDiffuse, vUv).g;
                float b = texture2D(tDiffuse, vUv - off).b;
                gl_FragColor = vec4(r,g,b,1.0);
            }
        `
    });
    context.chromaticPass = chromatic;

    context.composer.addPass(chromatic);


    const fxaaPass = new ShaderPass(FXAAShader);
    fxaaPass.material.uniforms['resolution'].value.set(
        1 / window.innerWidth,
        1 / window.innerHeight
    );
    context.composer.addPass(fxaaPass);
}
