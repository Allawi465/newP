import * as THREE from 'three';
import gsap from 'gsap';
import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { setupScene, onWindowResize, createMeshes, setupFBO, addObjects, setupPostProcessing, setupEventListeners } from './threeJS/index.js';
import initLoadingSequence from './components/loader/index.js';
import { defaultConfig, images } from './utils/index.js';
import setupScrollAnimation from './threeJS/scrollstrigger/index.js';

class EffectShell {
    constructor() {
        Object.assign(this, defaultConfig);

        this.VIEW_WIDTH = 4.5;
        this.VIEW_HEIGHT = 6;
        this.hasMovedEnough = false;
        this.bounceDirection = 'y';
        this.baseMeshSpacing = 2.2;
        this.bounceTween = null;

        this.init().then(() => this.onInitComplete());
    }

    async loadFont(family = "Space Grotesk", weight = "600", size = 180) {
        await document.fonts.load(`${weight} ${size}px '${family}'`);
    }

    async init() {
        try {
            setupScene(this);
            this.setupLenis(this);
            this.textures = await this.loadTextures(images, this);
            createMeshes(this);
            setupPostProcessing(this);
            await setupFBO(this);
            addObjects(this);
            setupEventListeners(this);
            this.animate();
            onWindowResize(this);
            initLoadingSequence(this)


        } catch (error) {
            console.error('Error initializing EffectShell:', error);
        }
    }

    setupLenis() {
        // Detect touch devices — disable Lenis there
        this.isTouch =
            window.matchMedia('(pointer: coarse)').matches ||
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0;

        if (!this.isTouch) {
            // Initialize Lenis only for desktop
            const lenis = new Lenis({
                wrapper: document.documentElement,
                content: document.body,
                orientation: 'vertical',
                gestureOrientation: 'vertical',
                smoothWheel: true,
                mouseMultiplier: 0.9,
                lerp: 0.07,
                smoothTouch: false,
                syncTouch: false,
                autoRaf: false,
            });

            this.bodyLenis = lenis;

            lenis.on('scroll', ScrollTrigger.update);

            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });

            gsap.ticker.lagSmoothing(0);

        } else {
            this.bodyLenis = null;
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
        }
    }

    stopBodyScrolling() {
        if (this.bodyLenis) this.bodyLenis.stop();
        document.documentElement.style.overflow = "hidden";
    }

    startBodyScrolling() {
        if (this.bodyLenis) this.bodyLenis.start();
        document.documentElement.style.overflow = "";
    }


    loadTextures(imageArray, context) {
        const textureLoader = new THREE.TextureLoader();
        return Promise.all(imageArray.map(image => new Promise((resolve, reject) => {
            textureLoader.load(image.src, (texture) => {
                texture.wrapS = THREE.ClampToEdgeWrapping;
                texture.wrapT = THREE.ClampToEdgeWrapping;

                texture.generateMipmaps = true;
                texture.minFilter = THREE.LinearMipMapLinearFilter;
                texture.magFilter = THREE.LinearFilter;
                texture.anisotropy = Math.min(context.renderer.capabilities.getMaxAnisotropy(), 8);
                texture.needsUpdate = true;

                resolve(texture);
            }, undefined, (err) => {
                console.error(`Failed to load texture: ${image.src}`, err);
                reject(err);
            });
        })));
    }

    smootherstep(x) {
        return x * x * x * (x * (x * 6 - 15) + 10);
    }

    startBounce(ctx, axis = 'y', amp = 2, duration = 5) {
        this.stopBounce(ctx);
        ctx.bounceTween = gsap.timeline({ repeat: -1, yoyo: true })
            .to(ctx.targetPositionSphre, { [axis]: amp, duration, ease: "power2.inOut" })
            .to(ctx.targetPositionSphre, { [axis]: -amp, duration, ease: "power2.inOut" });
        ctx.bounceDirection = axis;
    }

    stopBounce(ctx) {
        if (ctx.bounceTween) ctx.bounceTween.kill();
        ctx.bounceTween = null;
        ctx.bounceDirection = null;
    }

    getRenderTarget() {
        const renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
        });
        return renderTarget;
    }

    yN(e, t, n, i) {
        var r = Math.random();
        var a = Math.random();
        var s = 2 * Math.PI * r;
        var o = Math.acos(2 * a - 1);
        var l = e + i * Math.sin(o) * Math.cos(s);
        var c = t + i * Math.sin(o) * Math.sin(s);
        var u = n + i * Math.cos(o);

        return [l, c, u];
    }

    updateUniforms(deltaTime) {
        this.material.uniforms.uMouse.value.copy(this.pointer);
        this.material.uniforms.uMousePrev.value.copy(this.pointerPrev);

        this.material.uniforms.time.value = this.time;
        this.fboMaterial.uniforms.time.value = this.time;
        this.fboMaterial.uniforms.uDelta.value = this.time
        this.fboMaterial.uniforms.uDelta.value = Math.min(deltaTime, 0.1);

        this.fboMaterial.uniforms.uRandom.value = 0.5 + Math.random() * 0.9;
        this.fboMaterial.uniforms.uRandom2.value = 0.5 + Math.random() * 0.9;

        this.material.uniforms.uCameraPos.value.copy(this.camera.position);
        this.fboMaterial.uniforms.uSpherePos.value.copy(this.glassBall.position);
    }

    renderToFBO() {
        this.renderer.setRenderTarget(this.fbo);
        this.renderer.render(this.fboScene, this.fboCamera);
        this.renderer.setRenderTarget(null);

        this.material.uniforms.uPositions.value = this.fbo1.texture;
        this.fboMaterial.uniforms.uPositions.value = this.fbo.texture;

        let temp = this.fbo;
        this.fbo = this.fbo1;
        this.fbo1 = temp;
    }


    animate() {
        let deltaTime = this.clock.getDelta();
        this.time += deltaTime;

        this.updateUniforms(deltaTime);
        this.glassBall.position.lerp(this.targetPositionSphre, 0.05);
        this.cubeCamera.position.copy(this.glassBall.position);
        this.cubeCamera.update(this.renderer, this.scene);
        this.renderToFBO();

        this.renderer.autoClear = true;
        this.camera.layers.enableAll();
        this.composer.render();

        requestAnimationFrame(this.animate.bind(this));
    }

    onInitComplete() {
        console.log("Initialization complete!");
        setupScrollAnimation();
    }
}

new EffectShell();