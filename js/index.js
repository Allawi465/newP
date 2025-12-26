import * as THREE from 'three';
import gsap from 'gsap';
import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
    setupScene, onWindowResize, createCSS2DObjects, createLargePlane, syncHtmlWithSlider,
    createMeshes, setupFBO, addObjects, setupPostProcessing, setupEventListeners
} from './threeJS/index.js';
import { loadingProgress, updateProgressUI } from './components/loader/loading.js';
import initLoadingSequence from './components/loader/index.js';
import { defaultConfig, images } from './utils/index.js';
import setupScrollAnimation from './threeJS/scrollstrigger/index.js';
gsap.registerPlugin(ScrollTrigger);


class EffectShell {
    constructor() {
        Object.assign(this, defaultConfig);
        this.init().then(() => this.onInitComplete());
    }

    async loadFont(family = "Space Grotesk", weight = "600", size = 180) {
        await document.fonts.load(`${weight} ${size}px '${family}'`);
    }

    async init() {
        try {
            this.wrapper = document.querySelector('#smooth-wrapper');
            this.content = document.querySelector('#smooth-content');

            this.setupLenis();
            this.stopBodyScrolling();
            setupScene(this);
            this.textures = await this.loadTextures(images, this);
            createLargePlane(this);
            createMeshes(this);
            createCSS2DObjects(this, images);
            setupPostProcessing(this);
            await setupFBO(this);
            addObjects(this);
            this.animate();
            initLoadingSequence(this);
            setupScrollAnimation(this);
            onWindowResize(this);
            setupEventListeners(this);
        } catch (error) {
            console.error('Error initializing EffectShell:', error);
        }
    }

    isTouchDevice() {
        return (
            navigator.maxTouchPoints > 0 ||
            navigator.msMaxTouchPoints > 0 ||
            'ontouchstart' in window
        );
    }

    setupLenis() {
        if (!this.isTouchDevice()) {
            const lenis = new Lenis({
                wrapper: this.wrapper,
                content: this.content,
                smoothTouch: false,
                smoothWheel: true,
                autoRaf: false,
            });

            this.bodyLenis = lenis;

            lenis.on('scroll', ScrollTrigger.update);

            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });

            gsap.ticker.lagSmoothing(0);

            ScrollTrigger.scrollerProxy(this.wrapper, {
                scrollTop(value) {
                    if (arguments.length) {
                        lenis.scrollTo(value, { immediate: true });
                    }
                    return lenis.scroll;
                },
                getBoundingClientRect() {
                    return { top: 0, left: 0, width: innerWidth, height: innerHeight };
                },
                pinType: this.wrapper.style.transform ? 'transform' : 'fixed',
            });

            ScrollTrigger.defaults({ scroller: this.wrapper });

            this.startBodyScrolling = () => lenis.start();
            this.stopBodyScrolling = () => lenis.stop();
        } else {
            this.bodyLenis = null;
            this.wrapper.style.overflow = '';
            this.wrapper.style.overflow = '';
            ScrollTrigger.defaults({ scroller: this.wrapper });
        }
    }

    startBodyScrolling() {
        if (this.bodyLenis) {
            this.bodyLenis.start();
        }
        this.wrapper.style.overflow = "";
        document.body.style.overflow = "";
    }

    stopBodyScrolling() {
        if (this.bodyLenis) {
            this.bodyLenis.stop();
        }
        this.wrapper.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
    }

    stopAboutScrolling() {
        if (this.aboutLenis) {
            this.aboutLenis.stop();
        }
        const wrapper = document.querySelector('#about');
        if (wrapper) wrapper.style.overflow = "hidden";
    }

    async loadTextures(images) {
        const total = images.length;
        let loadedCount = 0;

        const loader = new THREE.TextureLoader();

        const maxAnisotropy =
            this.renderer?.capabilities?.getMaxAnisotropy?.() ?? 1;

        const texturePromises = images.map(img =>
            new Promise(resolve => {
                loader.load(
                    img.src,
                    tex => {
                        tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
                        tex.minFilter = THREE.LinearFilter;
                        tex.magFilter = THREE.LinearFilter;

                        tex.generateMipmaps = false;
                        tex.anisotropy = maxAnisotropy;
                        tex.needsUpdate = true;

                        loadedCount++;

                        gsap.to(loadingProgress, {
                            value: (loadedCount / total) * 100,
                            duration: 1,
                            ease: "power2.out",
                            onUpdate: updateProgressUI
                        });

                        resolve(tex);
                    }
                );
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

    startBounce(ctx, axis = 'y', amp = 2.3, duration = 10) {
        this.stopBounce(ctx);

        const base = ctx.targetPositionSphre[axis];
        const state = { t: 0 };

        ctx.bounceTween = gsap.to(state, {
            t: Math.PI * 2,
            duration,
            ease: "none",
            repeat: -1,
            onUpdate: () => {
                ctx.targetPositionSphre[axis] = base + Math.sin(state.t) * amp;
            }
        });

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

    getClientPosition(e) {
        const touch = e.touches?.[0] || e.changedTouches?.[0];
        return {
            x: e.clientX ?? touch?.clientX ?? 0,
            y: e.clientY ?? touch?.clientY ?? 0,
        };
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

    getRenderTarget() {
        return new THREE.WebGLRenderTarget(
            this.size,
            this.size,
            {
                format: THREE.RGBAFormat,
                type: THREE.FloatType,
                minFilter: THREE.NearestFilter,
                magFilter: THREE.NearestFilter,
            }
        );
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

    async resetParticles() {
        if (!this.material || !this.fboMaterial) return;

        if (this.material?.uniforms?.uPositions) {
            this.material.uniforms.uPositions.value = this.fbo.texture;
        }
    }

    enableParticles(context) {
        context.particlesActive = true;
        if (context.points) context.points.visible = true;
        if (context.glassBall) context.glassBall.visible = true;
    }

    disableParticles(context) {
        context.particlesActive = false;
        if (context.points) context.points.visible = false;
        if (context.glassBall) context.glassBall.visible = false;
    }


    animate() {
        requestAnimationFrame(this.animate.bind(this));
        const deltaTime = this.clock.getDelta();
        this.time += deltaTime;

        this.meshArray.forEach(mesh => {
            mesh.position.y +=
                (mesh.userData.targetY - mesh.position.y) * this.scroll_easing;
        });

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
        this.desiredOffset = Math.max(Math.min(this.desiredOffset, this.offsetMax), -this.offsetMax)

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

        if (this.particlesActive && this.material && this.fboMaterial) {
            this.updateUniforms(deltaTime);

            this.glassBall.position.lerp(this.targetPositionSphre, 0.08);
            this.cubeCamera.position.copy(this.glassBall.position);
            this.cubeCamera.update(this.renderer, this.scene);
            this.renderToFBO();
        }

        this.renderer.autoClear = true;
        this.camera.layers.enableAll();
        this.labelRenderer.render(this.scene, this.camera);
        this.composer.render();
    }

    onInitComplete() {

    }
}

new EffectShell();