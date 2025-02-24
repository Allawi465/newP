import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'; // Import OutputPass
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'; // Import ShaderPass
import * as dat from 'dat.gui';

import simFragment from './glsl/dust/simFragment.js';
import simVertex from './glsl/dust/simVertex.js';

import fragment from './glsl/dust/fragment.js';
import vertex from './glsl/dust/vertex.js';

class Sketch {
    constructor() {
        this.scene = new THREE.Scene();
        this.isPlaying = true;
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        this.pointerPrev = new THREE.Vector2();

        this.clock = new THREE.Clock();


        document.getElementById("container").appendChild(this.renderer.domElement);

        // --- Camera Setup ---
        this.camera = new THREE.OrthographicCamera(
            window.innerWidth / -500,
            window.innerWidth / 500,
            window.innerHeight / 500,
            window.innerHeight / -500,
            0.01,
            1000
        );
        this.camera.position.set(0, 0, 2);

        this.width = 1024;
        this.height = 1024;
        this.scene.position.set(0, 0, 0);

        // --- Render Layers ---
        this.PARTICLE_LAYER = 1; // Definerer et lag for partikler
        this.camera.layers.enable(this.PARTICLE_LAYER); // Aktiverer partikellaget på kameraet

        this.setupEvents();
        this.getRenderTarget();
        this.setupFBO();
        this.addObjects();
        this.setupResize();
        this.setupPostProcessing();

        this.time = 0;
        this.render();
    }

    setupEvents() {
        this.dummy = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100),
            new THREE.MeshBasicMaterial()
        );
        this.dummy.layers.set(0); // Legg dummyen på standard laget (lag 0)

        document.addEventListener("pointermove", (e) => {
            this.pointerPrev.copy(this.pointer);
            this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

            this.raycaster.setFromCamera(this.pointer, this.camera);
            let intersects = this.raycaster.intersectObject(this.dummy);
            if (intersects.length > 0) {
                let { x, y } = intersects[0].point;
                this.fboMaterial.uniforms.uMouse.value.set(x, y);
            }
        });
    }

    setupResize() {
        window.addEventListener("resize", this.resize.bind(this));
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.renderer.setSize(this.width, this.height);
        this.composer.setSize(this.width, this.height); // Endre størrelse på composer

        this.camera.left = -this.width / 500;
        this.camera.right = this.width / 500;
        this.camera.top = this.height / 500;
        this.camera.bottom = -this.height / 500;

        this.camera.zoom = Math.min(this.width, this.height) / 1000;
        this.camera.updateProjectionMatrix();

        // Oppdaterer oppløsnings-uniform for partikkelmaterialet
        if (this.material) {
            this.material.uniforms.iResolution.value.set(this.width, this.height);
        }
    }

    getRenderTarget() {
        return new THREE.WebGLRenderTarget(this.width, this.height, {
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
        });
    }

    setupFBO() {
        // (FBO-oppsettet forblir stort sett det samme)
        this.size = 1024;
        this.fbo = this.getRenderTarget();
        this.fbo1 = this.getRenderTarget();

        this.fboScene = new THREE.Scene();
        this.fboCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
        this.fboCamera.position.set(0, 0, 0.5);
        this.fboCamera.lookAt(0, 0, 0);

        let geometry = new THREE.PlaneGeometry(2, 2);
        this.data = new Float32Array(this.size * this.size * 4);

        this.data = new Float32Array(this.size * this.size * 4);

        for (let i = 0; i < this.size * this.size; i++) {
            let index = i * 4;
            this.data[index] = (Math.random() * 2 - 1) * 0.05;
            this.data[index + 1] = (Math.random() * 2 - 1);
            this.data[index + 2] = (Math.random() * 2 - 1);
            this.data[index + 3] = Math.random();
        }

        this.fboTexture = new THREE.DataTexture(
            this.data,
            this.size,
            this.size,
            THREE.RGBAFormat,
            THREE.FloatType
        );
        this.fboTexture.magFilter = THREE.NearestFilter;
        this.fboTexture.minFilter = THREE.NearestFilter;
        this.fboTexture.needsUpdate = true;

        this.fboMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                uMouse: { value: new THREE.Vector2(0, 0) },
                uRandom: { value: Math.random() },
                uRandom2: { value: Math.random() },
                resolution: { value: new THREE.Vector2(this.width, this.height) },
                uPositions: { value: this.fboTexture }, // Position texture
                uSpherePos: { value: new THREE.Vector3(0, 1, 0) },
                uCameraPos: { value: this.camera.position },
                uDelta: { value: 0. },
            },
            vertexShader: simVertex,
            fragmentShader: simFragment,
            depthWrite: false,
            depthTest: false,
            blending: THREE.NoBlending,
            transparent: true
        });



        /*         const gui = new dat.GUI();
                const PartFolder = gui.addFolder('Particles');
                PartFolder.add(this.fboMaterial.uniforms.uNoiseScale, 'value', 0, 1).name('Noise Scale');
                PartFolder.add(this.fboMaterial.uniforms.uNoiseSpeed, 'value', 0.01, 0.5).name('Noise Speed'); */


        this.infoArray = new Float32Array(this.size * this.size * 4);
        this.info = new THREE.DataTexture(this.infoArray, this.size, this.size, THREE.RGBAFormat, THREE.FloatType);
        this.info.magFilter = THREE.NearestFilter;
        this.info.minFilter = THREE.NearestFilter;
        this.info.needsUpdate = true;

        this.fboMesh = new THREE.Mesh(geometry, this.fboMaterial);
        this.fboScene.add(this.fboMesh);

        this.renderer.setRenderTarget(this.fbo);
        this.renderer.render(this.fboScene, this.fboCamera);
        this.renderer.setRenderTarget(this.fbo1);
        this.renderer.render(this.fboScene, this.fboCamera);
    }

    addObjects() {
        this.material = new THREE.ShaderMaterial({
            extensions: { derivatives: "#extension GL_OES_standard_derivatives : enable" },
            uniforms: {
                time: { value: 0 },
                uPositions: { value: this.fboTexture },
                uMouse: { value: new THREE.Vector2() },
                uMousePrev: { value: new THREE.Vector2() },
                pointSize: { value: 3.1 },
                iResolution: { value: new THREE.Vector2(this.width, this.height) },
                iChannel0: { value: this.fbo.texture },
                pointColor: { value: new THREE.Vector4(.5, 1., 1., 1.) },
            },
            vertexShader: vertex,
            fragmentShader: fragment,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });

        this.count = this.size * this.size;
        let geometry = new THREE.BufferGeometry();
        let positions = new Float32Array(this.count * 3);
        let uv = new Float32Array(this.count * 2);

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                let index = (i * this.size + j);
                positions[index * 3] = (Math.random() - 0.5) * 2;
                positions[index * 3 + 1] = (Math.random() - 0.5) * 2;
                positions[index * 3 + 2] = (Math.random() - 0.5) * 2;

                uv[index * 2] = j / this.size;
                uv[index * 2 + 1] = i / this.size;
            }
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));

        this.points = new THREE.Points(geometry, this.material);
        this.points.layers.set(this.PARTICLE_LAYER);
        this.scene.add(this.points);
    }

    setupPostProcessing() {
        this.composer = new EffectComposer(this.renderer);

        const scenePass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(scenePass);

        // --- Render Pass for ONLY the particles ---
        const particlePass = new RenderPass(this.scene, this.camera);
        particlePass.camera = this.camera; // Bruk hovedkameraet
        this.camera.layers.set(this.PARTICLE_LAYER);   // Render kun partikkel-laget

        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.01,
            0.01,
            0.1
        );
        -
            this.composer.addPass(particlePass);
        this.composer.addPass(bloomPass);

        // --- Chromatic Aberration Pass ---
        const chromaticAberrationShader = {
            uniforms: {
                "tDiffuse": { value: null },
                "offset": { value: new THREE.Vector2(0.002, 0.001) }
            },
            vertexShader: `
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
              }
            `,
            fragmentShader: `
              uniform sampler2D tDiffuse;
              uniform vec2 offset;
              varying vec2 vUv;
              
              void main() {
                float extraDown = smoothstep(0.5, 0.0, vUv.y) * 0.005;
                vec2 finalOffset = vec2(offset.x, offset.y + extraDown);
                
                float r = texture2D(tDiffuse, vUv + finalOffset).r;
                float g = texture2D(tDiffuse, vUv).g;
                float b = texture2D(tDiffuse, vUv - finalOffset).b;
                
                gl_FragColor = vec4(r, g, b, 1.0);
              }
            `
        };
        const chromaticAberrationPass = new ShaderPass(chromaticAberrationShader);
        this.composer.addPass(chromaticAberrationPass);

        this.composer.addPass(new OutputPass());
    }

    render() {
        if (!this.isPlaying) return;

        this.material.uniforms.uMouse.value.copy(this.pointer);
        this.material.uniforms.uMousePrev.value.copy(this.pointerPrev);

        let deltaTime = this.clock.getDelta();
        this.fboMaterial.uniforms.uDelta.value = deltaTime;

        this.time += 0.05;
        this.material.uniforms.time.value = this.time;
        this.fboMaterial.uniforms.time.value = this.time;

        // FBO-pass
        this.renderer.setRenderTarget(this.fbo);
        this.renderer.render(this.fboScene, this.fboCamera);
        this.renderer.setRenderTarget(null);

        // Oppdaterer teksturer
        this.material.uniforms.uPositions.value = this.fbo1.texture;
        this.fboMaterial.uniforms.uPositions.value = this.fbo.texture;

        // Før rendering, sørg for at alle lag er aktivert.
        this.camera.layers.enableAll();

        // Render med composer (post-processing)
        this.composer.render();

        // Bytt FBO-er
        let temp = this.fbo;
        this.fbo = this.fbo1;
        this.fbo1 = temp;


        requestAnimationFrame(this.render.bind(this));
    }
}

new Sketch();
