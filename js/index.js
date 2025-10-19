import * as THREE from 'three';
import gsap from 'gsap';
import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { setupScene, onWindowResize, createCSS2DObjects, syncHtmlWithSlider, createMeshes, setupFBO, addObjects, setupPostProcessing, setupEventListeners } from './threeJS/index.js';
import initLoadingSequence from './components/loader/index.js';
import { defaultConfig, images } from './utils/index.js';
import setupScrollAnimation from './threeJS/scrollstrigger/index.js';
gsap.registerPlugin(ScrollTrigger);

class EffectShell {
    constructor() {
        Object.assign(this, defaultConfig);

        this.VIEW_WIDTH = 4.5;
        this.VIEW_HEIGHT = 6;
        this.hasMovedEnough = false;
        this.bounceDirection = 'y';
        this.baseMeshSpacing = 2.2;
        this.bounceTween = null;
        this.isTouch =
            window.matchMedia('(pointer: coarse)').matches ||
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0;
        this.targetY = 0;
        this.currentY = 0;
        this.scrollTargetY = 0;

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
            createCSS2DObjects(this, images);
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
        if (!this.isTouch) {
            const lenis = new Lenis({
                wrapper: document.documentElement,
                content: document.body,
                smoothWheel: true,
                smoothTouch: false,
                autoRaf: false,
                duration: 1.1,
                easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            });
            this.bodyLenis = lenis;

            lenis.on('scroll', ScrollTrigger.update);

            gsap.ticker.add(t => lenis.raf(t * 1000));
            gsap.ticker.lagSmoothing(0);

            ScrollTrigger.scrollerProxy(document.documentElement, {
                scrollTop: (v) => v != null ? lenis.scrollTo(v, { immediate: true }) : lenis.scroll,
                getBoundingClientRect: () => ({ top: 0, left: 0, width: innerWidth, height: innerHeight }),
                pinType: "transform"
            });
            ScrollTrigger.defaults({ scroller: document.documentElement });
        } else {
            this.bodyLenis = null;
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            ScrollTrigger.defaults({});
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

    loadTextures(images) {
        const loader = new THREE.TextureLoader();
        return Promise.all(images.map(img =>
            new Promise(res => loader.load(img.src, tex => {
                tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
                tex.minFilter = THREE.LinearFilter;
                tex.magFilter = THREE.LinearFilter;
                res(tex);
            }))
        ));
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

    lerp = (start, end, t) => start + (end - start) * t;


    animate() {
        requestAnimationFrame(this.animate.bind(this));
        const deltaTime = this.clock.getDelta();
        this.time += deltaTime;

        this.currentY += (this.targetY - this.currentY) * this.lerpFactor;
        this.group.position.y = this.currentY

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
            child.material.uniforms.uOffset.value.x += (this.desiredOffset - child.material.uniforms.uOffset.value.x) * this.offsetLerpSpeed;
        });


        if (this.meshArray?.[0] && this.titleLabel) {
            const mesh = this.meshArray[0];
            mesh.getWorldPosition(this.titleWorldPos);
            this.titleLabel.position.y = this.titleWorldPos.y;
        }

        this.updatePositions();
        this.syncHtmlWithSlider();

        this.updateUniforms(deltaTime);

        this.glassBall.position.lerp(this.targetPositionSphre, 0.05);
        this.cubeCamera.position.copy(this.glassBall.position);
        this.cubeCamera.update(this.renderer, this.scene);

        this.renderToFBO();
        this.renderer.autoClear = true;
        this.camera.layers.enableAll();
        this.labelRenderer.render(this.scene, this.camera);
        this.composer.render();
    }

    onInitComplete() {
        setupScrollAnimation(this);
    }
}

new EffectShell();