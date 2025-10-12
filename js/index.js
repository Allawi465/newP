import * as THREE from 'three';
import Lenis from 'lenis'
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { setupScene, setupFBO, addObjects, createCSS2DObjects, syncHtmlWithSlider, setupPostProcessing, onWindowResize, setupEventListeners, createMeshes } from './threeJS/index.js';
import initLoadingSequence from './components/loader/index.js';
import { defaultConfig, images } from './utils/index.js';
import setupScrollAnimation from './threeJS/scrollstrigger/index.js';

class EffectShell {
    constructor() {
        Object.assign(this, defaultConfig);

        this.init().then(() => this.onInitComplete());

        this.VIEW_WIDTH = 4.5;
        this.VIEW_HEIGHT = 6;
        this.clock = new THREE.Clock();

        this.bounceDirection = 'y';
        this.baseMeshSpacing = 2.2;
        this.bounceTween = null;
    }

    async loadFont(family = "Space Grotesk", weight = "600", size = 180) {
        await document.fonts.load(`${weight} ${size}px '${family}'`);
    }

    async init() {
        try {
            setupScene(this);
            this.textures = await this.loadTextures(images, this);
            this.setupLenis(this);
            createMeshes(this);
            setupPostProcessing(this);
            await setupFBO(this);
            createCSS2DObjects(this, images);
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
        const lenis = new Lenis({
            wrapper: document.documentElement,
            content: document.body,
            lerp: 0.1,
            syncTouch: false,
            touchMultiplier: 2,
        });

        this.bodyLenis = lenis;

        lenis.on('scroll', () => {
            ScrollTrigger.update();
        });

        this.bodyLenis.raf(this.time * 1000);
        gsap.ticker.lagSmoothing(0);

        ScrollTrigger.scrollerProxy(document.documentElement, {
            scrollTop(value) {
                if (arguments.length) lenis.scrollTo(value, { immediate: true });
                return lenis.scroll;
            },
            getBoundingClientRect() {
                return {
                    top: 0,
                    left: 0,
                    width: window.innerWidth,
                    height: window.innerHeight,
                };
            },
            pinType: "transform",
        });

        lenis.scrollTo(0, { immediate: true });
        ScrollTrigger.refresh();

        this.startBodyScrolling = () => lenis.start();
        this.stopBodyScrolling = () => lenis.stop();

        return lenis;
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

    calculatePositionX(index, currentPosition, meshSpacing) {
        const totalLength = meshSpacing * images.length;
        return ((((index * meshSpacing + currentPosition) % totalLength) + totalLength) % totalLength) - totalLength / 2;
    }

    updateAdjustedMeshSpacing() {
        this.meshSpacing = this.baseMeshSpacing * this.scaleFactor_cards;
    }

    updatePositions() {

        this.group.children.forEach((child, index) => {
            child.position.x = this.calculatePositionX(index, this.currentPosition, this.meshSpacing);
        });

        this.syncHtmlWithSlider();
    }

    syncHtmlWithSlider() {
        syncHtmlWithSlider(this);
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

        // Cap deltaTime for performance
        deltaTime = Math.min(deltaTime, 0.033); // ~30 FPS minimum

        if (this.bodyLenis) {
            this.bodyLenis.raf(performance.now());
        }

        const containerWidth = this.container ? this.container.clientWidth : window.innerWidth;
        const widthFactor = Math.min(1920 / containerWidth, 4);

        if (!this.isDragging && this.isMoving) {
            this.targetPosition += this.velocity * deltaTime;
            this.velocity *= Math.pow(this.friction, 60 * deltaTime);
            if (Math.abs(this.velocity) < 0.01) {
                this.velocity = 0;
                this.isMoving = false;
            }
            const momentumStrength = Math.min(Math.abs(this.velocity) / (70.0 / widthFactor), 1.0);
            if (this.meshArray) {
                this.meshArray.forEach(mesh => {
                    mesh.material.uniforms.uIsDragging.value += (momentumStrength - mesh.material.uniforms.uIsDragging.value) * 0.03;
                    mesh.material.uniforms.uIsDragging.needsUpdate = true;
                });
            }
        }

        this.currentPosition = this.currentPosition + (this.targetPosition - this.currentPosition) * this.lerpFactor;
        this.desiredOffset = this.velocity * this.offsetFactor;
        this.desiredOffset = Math.max(Math.min(this.desiredOffset, this.offsetMax), -this.offsetMax);

        this.group.children.forEach(child => {
            child.material.uniforms.uOffset.value.x += (this.desiredOffset - child.material.uniforms.uOffset.value.x) * this.offsetLerpSpeed;
        });

        this.updatePositions();
        this.syncHtmlWithSlider();

        if (this.meshArray?.[0] && this.titleLabel) {
            const mesh = this.meshArray[0];
            mesh.getWorldPosition(this.titleWorldPos);
            this.titleLabel.position.y = this.titleWorldPos.y;
        }

        // Skip heavy updates during lag
        if (deltaTime < 0.033) {
            this.updateUniforms(deltaTime);
            this.glassBall.position.lerp(this.targetPositionSphre, 0.05);
            this.cubeCamera.position.copy(this.glassBall.position);
            this.cubeCamera.update(this.renderer, this.scene);
            this.renderToFBO();
        }

        this.renderer.autoClear = true;
        this.camera.layers.enableAll();
        this.labelRenderer.render(this.scene, this.camera);
        this.composer.render();

        requestAnimationFrame(this.animate.bind(this));
    }

    onInitComplete() {
        console.log("Initialization complete!");
        setupScrollAnimation();
    }
}

new EffectShell();