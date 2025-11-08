import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { ClearPass } from 'three/examples/jsm/postprocessing/ClearPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';

export default function setupPostProcessing(context) {

    context.composer = new EffectComposer(context.renderer);
    const clearPass = new ClearPass();
    clearPass.clearColor = new THREE.Color(0xffffff);
    clearPass.clearAlpha = 1.0;
    context.composer.addPass(clearPass);

    const renderPass = new RenderPass(context.scene, context.camera);
    renderPass.clear = false;
    renderPass.clearDepth = true;
    context.composer.addPass(renderPass);

    const chromaticBendPass = new ShaderPass({
        uniforms: {
            tDiffuse: { value: null },
            uPower: { value: 0.2 },
            uLiftAmount: { value: 0.0 },
            uBendRegion: { value: 0.075 },
            offset: { value: new THREE.Vector2(0.001, 0.001) },
            uFade: { value: 1.0 },
            uObjectOpacity: { value: 0.2 }
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
            uniform vec2 offset;
            uniform float uPower;
            uniform float uLiftAmount;
            uniform float uBendRegion;
            uniform float uFade;
            uniform float uObjectOpacity;
            varying vec2 vUv;

            void main() {
                vec2 uv = vUv;
                vec4 origColor = texture2D(tDiffuse, uv);

                float raw = 1.0 - smoothstep(0.0, uBendRegion, uv.y);
                float strength = raw * raw;
                float effective = strength * uFade;

                vec2 displacement = vec2(
                    (0.5 - uv.x) * strength * uPower,
                    strength * uLiftAmount
                );

                vec2 redOffset = offset;
                vec2 blueOffset = -offset;
                vec2 displacedUV = uv + displacement;

                vec4 sampleR = texture2D(tDiffuse, displacedUV + redOffset);
                vec4 sampleG = texture2D(tDiffuse, displacedUV);
                vec4 sampleB = texture2D(tDiffuse, displacedUV + blueOffset);
                vec3 bentColor = vec3(sampleR.r, sampleG.g, sampleB.b);

                vec3 finalRGB = bentColor;

                float objectRegionStart = uBendRegion * 0.5;
                float objectRaw = smoothstep(objectRegionStart, 0.0, uv.y);
                float objectFade = objectRaw * uObjectOpacity;

                if (uv.y < uBendRegion) {
                    finalRGB = mix(bentColor, origColor.rgb, objectFade);
                }

                gl_FragColor = vec4(finalRGB, origColor.a);
            }
        `
    });

    context.composer.addPass(chromaticBendPass);
    context.chromaticBendPass = chromaticBendPass;

    const fxaaPass = new ShaderPass(FXAAShader);
    fxaaPass.material.uniforms['resolution'].value.set(
        1 / (context.isTouch ? window.innerWidth * 0.75 : window.innerWidth),
        1 / (context.isTouch ? window.innerHeight * 0.75 : window.innerHeight)
    );
    context.composer.addPass(fxaaPass);
}