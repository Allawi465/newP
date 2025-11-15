import * as THREE from 'three';
import gsap from 'gsap';
import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
    setupScene,
    onWindowResize,
    createCSS2DObjects,
    createLargePlane,
    syncHtmlWithSlider,
    createMeshes,
    setupFBO,
    addObjects,
    setupPostProcessing,
    setupEventListeners
} from './threeJS/index.js';
import { loadingProgress, updateProgressUI } from './components/loader/loading.js';
import initLoadingSequence from './components/loader/index.js';
import { defaultConfig, images } from './utils/index.js';
import setupScrollAnimation from './threeJS/scrollstrigger/index.js';


gsap.registerPlugin(ScrollTrigger);

class EffectShell {
    constructor() {
        Object.assign(this, defaultConfig);

        this.lastHeight = window.innerHeight;

        this.init().then(() => this.onInitComplete());
    }

    async loadFont(family = "Space Grotesk", weight = "600", size = 180) {
        await document.fonts.load(`${weight} ${size}px '${family}'`);
    }

    async init() {
        try {
            this.setupLenis(this);
            this.stopBodyScrolling();
            setupScene(this);
            this.textures = await this.loadTextures(images, this);
            createLargePlane(this);
            createMeshes(this);
            createCSS2DObjects(this, images);
            setupPostProcessing(this);
            await setupFBO(this);
            addObjects(this);
            setupEventListeners(this);
            this.animate();
            initLoadingSequence(this);
            setupScrollAnimation();
            onWindowResize(this);
        } catch (error) {
            console.error('Error initializing EffectShell:', error);
        }
    }

    setupLenis() {
        if (!this.isTouchDevice()) {
            const lenis = new Lenis({
                wrapper: document.documentElement,
                content: document.body,
                smoothWheel: true,
                smoothTouch: false,
                autoRaf: false,
                duration: 1.5,
            });

            this.bodyLenis = lenis;

            lenis.on('scroll', ScrollTrigger.update);

            gsap.ticker.add(t => lenis.raf(t * 1000));
            gsap.ticker.lagSmoothing(0);

            ScrollTrigger.scrollerProxy(document.documentElement, {
                scrollTop(value) {
                    if (arguments.length) {
                        lenis.scrollTo(value, { immediate: true });
                    }
                    return lenis.scroll;
                },
                getBoundingClientRect() {
                    return { top: 0, left: 0, width: innerWidth, height: innerHeight };
                },
                pinType: document.documentElement.style.transform ? 'transform' : 'fixed',
            });

            ScrollTrigger.defaults({ scroller: document.documentElement });

            this.startBodyScrolling = () => lenis.start();
            this.stopBodyScrolling = () => lenis.stop();
        } else {
            this.bodyLenis = null;
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            ScrollTrigger.defaults({});
        }
    }

    getScrollY() {
        if (this.bodyLenis) {
            return this.bodyLenis.scroll;
        } else {
            return window.scrollY || document.documentElement.scrollTop || 0;
        }
    }

    isTouchDevice() {
        return (
            window.matchMedia('(pointer: coarse)').matches ||
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0
        );
    }

    enableTouchMode(context) {
        context.followMouse = false;
        if (!context.bounceTween) {
            gsap.set(context.targetPositionSphre, { x: 0, y: 0 });
            context.startBounce(context, "y");
        }
    }

    enableMouseMode(context) {
        context.followMouse = true;
        context.stopBounce(context);
        gsap.set(context.targetPositionSphre, { x: 0, y: 0 });
    }

    stopBodyScrolling() {
        if (this.bodyLenis) {
            this.bodyLenis.stop();
        }
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
    }

    startBodyScrolling() {
        if (this.bodyLenis) {
            this.bodyLenis.start();
        }
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
    }

    async loadTextures(images) {
        const total = images.length;
        let loadedCount = 0;

        const loader = new THREE.TextureLoader();

        const texturePromises = images.map(img =>
            new Promise(resolve => {
                loader.load(img.src, tex => {
                    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
                    tex.minFilter = tex.magFilter = THREE.LinearFilter;

                    loadedCount++;

                    gsap.to(loadingProgress, {
                        value: (loadedCount / total) * 100,
                        duration: 1,
                        ease: "power2.out",
                        onUpdate: updateProgressUI
                    });

                    resolve(tex);
                });
            })
        );

        const textures = await Promise.all(texturePromises);

        await new Promise(resolve => {
            gsap.to(loadingProgress, {
                value: 100,
                duration: 1,
                ease: "power2.out",
                onUpdate: updateProgressUI,
                onComplete: resolve
            });
        });

        return textures;
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

    clamp(v, a = 0, b = 1) { return Math.max(a, Math.min(b, v)); }

    checkHeightChange() {
        const currentHeight = window.innerHeight;
        if (currentHeight !== this.lastHeight) {
            this.lastHeight = currentHeight;
            onWindowResize(this);
        }
    }

    getRenderTarget() {
        return new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
        });
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
        this.fboMaterial.uniforms.uDelta.value = Math.min(deltaTime, 0.1);

        this.fboMaterial.uniforms.uRandom.value = 0.5 + Math.random();
        this.fboMaterial.uniforms.uRandom2.value = 0.5 + Math.random();

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
        requestAnimationFrame(this.animate.bind(this));
        const deltaTime = this.clock.getDelta();
        this.time += deltaTime;

        if (this.group) {
            const scrollTop = this.getScrollY();

            const viewportHeight = window.visualViewport?.height || window.innerHeight;

            const maxScroll = document.body.scrollHeight - viewportHeight;
            const normalized = maxScroll > 0 ? scrollTop / maxScroll : 0;

            const targetY = this.scrollMinY + (this.scrollMaxY - this.scrollMinY) * normalized;
            this.group.position.y = targetY;
        }

        if (!this.isDragging && this.isMoving) {
            this.targetPosition += this.velocity * deltaTime;
            this.velocity *= Math.pow(this.friction, 60 * deltaTime);
            if (Math.abs(this.velocity) < 0.01) {
                this.velocity = 0;
                this.isMoving = false;
            }
        }

        this.currentPosition += (this.targetPosition - this.currentPosition) * this.lerpFactor;

        this.desiredOffset = this.velocity * this.offsetFactor;
        this.desiredOffset = Math.max(Math.min(this.desiredOffset, this.offsetMax), -this.offsetMax);

        this.group.children.forEach(child => {
            child.material.uniforms.uOffset.value.x +=
                (this.desiredOffset - child.material.uniforms.uOffset.value.x) * this.offsetLerpSpeed;
        });

        if (this.meshArray?.[0] && this.titleLabel) {
            const mesh = this.meshArray[0];
            mesh.getWorldPosition(this.titleWorldPos);
            this.titleLabel.position.y = this.titleWorldPos.y;
        }

        this.updatePositions();
        this.syncHtmlWithSlider();
        this.updateUniforms(deltaTime);

        this.glassBall.position.lerp(this.targetPositionSphre, 0.08);
        this.cubeCamera.position.copy(this.glassBall.position);
        this.cubeCamera.update(this.renderer, this.scene);

        this.renderToFBO();
        this.renderer.autoClear = true;
        this.camera.layers.enableAll();
        this.labelRenderer.render(this.scene, this.camera);
        this.composer.render();

    }

    onInitComplete() { }
}

new EffectShell();                                                