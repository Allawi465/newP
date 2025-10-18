import * as THREE from 'three';
import gsap from 'gsap';
import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { setupScene, onWindowResize, createCSS2DObjects, syncHtmlWithSlider, createMeshes, setupFBO, addObjects, setupPostProcessing, setupEventListeners } from './threeJS/index.js';
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
        this.isTouch =
            window.matchMedia('(pointer: coarse)').matches ||
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0;
        this.scrollProgress = 0;
        this.projectsElement = document.querySelector(".projects");
        this.raycaster = new THREE.Raycaster();
        this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

        // PERFORMANCE OPTIMIZATION: Cache div position
        this.cachedDivPosition = { x: 0, y: 0 };
        this.needsPositionUpdate = true;

        // PERFORMANCE OPTIMIZATION: Throttle position updates
        this.frameCount = 0;
        this.updateInterval = this.isTouch ? 2 : 1; // Update every 2 frames on mobile

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
            initLoadingSequence(this);

            this.setupPositionCache();

        } catch (error) {
            console.error('Error initializing EffectShell:', error);
        }
    }

    setupPositionCache() {
        const updateCache = () => {
            this.needsPositionUpdate = true;
        };

        window.addEventListener('scroll', updateCache, { passive: true });
        window.addEventListener('resize', updateCache, { passive: true });

        // Initial cache
        this.updateCachedPosition();
    }

    updateCachedPosition() {
        if (this.projectsElement && this.camera) {
            const rect = this.projectsElement.getBoundingClientRect();
            const divCenterX = rect.left + rect.width / 2;
            const divCenterY = rect.top + rect.height / 2;
            const ndcX = (divCenterX / window.innerWidth) * 2 - 1;
            const ndcY = -(divCenterY / window.innerHeight) * 2 + 1;
            const mouse = new THREE.Vector2(ndcX, ndcY);
            this.raycaster.setFromCamera(mouse, this.camera);
            const pos = new THREE.Vector3();
            if (this.raycaster.ray.intersectPlane(this.plane, pos)) {
                this.cachedDivPosition.y = pos.y;
            }
            this.needsPositionUpdate = false;
        }
    }

    setupLenis() {
        if (!this.isTouch) {
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
                const maxAnisotropy = context.isTouch ? 4 : 8;
                texture.anisotropy = Math.min(context.renderer.capabilities.getMaxAnisotropy(), maxAnisotropy);
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
        this.fboMaterial.uniforms.uDelta.value = this.time;
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
        const deltaTime = this.clock.getDelta();
        this.time += deltaTime;


        this.frameCount++;

        if (this.needsPositionUpdate && this.frameCount % this.updateInterval === 0) {
            this.updateCachedPosition();
        }

        if (this.group) {
            this.group.position.y += (this.cachedDivPosition.y - this.group.position.y) * 0.1;
        }

        if (this.frameCount % this.updateInterval === 0) {
            const grayscale = this.scrollProgress;
            this.meshArray.forEach(mesh => {
                mesh.material.uniforms.uGrayscale.value = grayscale;
                mesh.material.uniforms.opacity.value = grayscale;
            });
        }

        const containerWidth = this.container ? this.container.clientWidth : window.innerWidth;
        const referenceWidth = 1920;
        const widthFactor = Math.min(referenceWidth / containerWidth, 4);

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

        this.currentPosition += (this.targetPosition - this.currentPosition) * this.lerpFactor;

        this.desiredOffset = this.velocity * this.offsetFactor;
        this.desiredOffset = Math.max(Math.min(this.desiredOffset, this.offsetMax), -this.offsetMax);

        this.group.children.forEach(child => {
            child.material.uniforms.uOffset.value.x += (this.desiredOffset - child.material.uniforms.uOffset.value.x) * this.offsetLerpSpeed;
        });

        this.updatePositions();

        if (this.frameCount % this.updateInterval === 0) {
            this.syncHtmlWithSlider();
        }

        if (this.meshArray?.[0] && this.titleLabel) {
            const mesh = this.meshArray[0];
            mesh.getWorldPosition(this.titleWorldPos);
            this.titleLabel.position.y = this.titleWorldPos.y;
        }

        this.updateUniforms(deltaTime);

        this.glassBall.position.lerp(this.targetPositionSphre, 0.05);
        this.cubeCamera.position.copy(this.glassBall.position);
        this.cubeCamera.update(this.renderer, this.scene);

        this.renderToFBO();

        this.renderer.autoClear = true;
        this.camera.layers.enableAll();
        this.labelRenderer.render(this.scene, this.camera);
        this.composer.render();

        requestAnimationFrame(this.animate.bind(this));
    }

    onInitComplete() {
        console.log("Initialization complete!");
        setupScrollAnimation();

        gsap.to({}, {
            scrollTrigger: {
                trigger: ".projects",
                start: "top bottom",
                end: "bottom top",
                scrub: this.isTouch ? 0.5 : true,
                scroller: document.body,
                onUpdate: (self) => {
                    this.scrollProgress = self.progress;
                    this.needsPositionUpdate = true;
                }
            }
        });
    }
}

new EffectShell();
