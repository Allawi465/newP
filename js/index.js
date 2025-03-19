import * as THREE from 'three';
import Lenis from 'lenis'
import gsap from 'gsap';
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import { setupScene } from './scene/index.js';
import initLoadingSequence from './components/loader/index.js';
import { setupFBO } from './moon/setupFBO.js';
import { addObjects } from './moon/addObjects.js';
import { calculatePositionX, images } from './utils/index.js';
import transitionFragment from './glsl/transition/transition_frag.js';
import transitionVertex from './glsl/transition/transition_vertex.js';
import { onPointerDown, onPointerMove, onPointerUp } from './slider/index.js';
import { onMouseMoveHover } from './slider/mouseHover/index.js';
import { createCSS2DObjects } from './slider/titles/index.js';
import { calculateTargetFov, updateCameraProperties } from './camera/index.js';
import { syncHtmlWithSlider } from './slider/titles/syncHtml.js';
import { createPlaneMesh } from './slider/planeMesh/index.js';
import showAbout from "./components/about/index.js"
import closeInfoDiv from './components/close/index.js';

gsap.registerPlugin(ScrollTrigger);

class EffectShell {
    constructor() {
        this.textures = [];
        this.cssObjects = [];
        this.meshes = [];
        this.meshArray = [];
        this.images = images;
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.movementSensitivity = 60;
        this.velocity = 0;
        this.defaultCameraZ = 9.5;
        this.friction = 0.95;
        this.startX = 0;
        this.isDragging = false;
        this.currentPosition = 0;
        this.dragDelta = 0;
        this.lastX = 0;
        this.dragSpeed = 0;
        this.scaleFactor = 1;
        this.slideHeight = 10.4;
        this.slideWidth = 5.1;
        this.meshSpacing = 6.5;
        this.initialDistanceScale = 0;
        this.targetFov = 75;
        this.maxDistanceScale = 0.7;
        this.velocityScale = 0.20;
        this.largePlane = null;
        this.isLoading = true;
        this.time = 0;
        this.isOverlayVisible = false;
        this.aspect = window.innerWidth / window.innerHeight;
        this.frustumSize = 4;
        this.isDivOpen = false;
        this.isProjectsOpen = false;
        this.isAnimating = false;
        this.largeShaderMaterial = null;
        this.moonShaderMaterial = null;
        this.baseMeshSpacing = 6.3;

        this.objectScene = new THREE.Scene();

        this.objectCamera = new THREE.OrthographicCamera(
            (this.frustumSize * this.aspect) / -2,
            (this.frustumSize * this.aspect) / 2,
            this.frustumSize / 2,
            this.frustumSize / -2,
            0.01,
            100
        )

        this.objectCamera.updateProjectionMatrix();

        this.objectCamera.position.set(0, 0, 2);

        this.objectScene.position.set(0, 0, 0);

        this.overlayRenderer = new THREE.WebGLRenderer({
            alpha: true,
            canvas: document.getElementById('about_canvas'),
        });
        this.overlayRenderer.setSize(window.innerWidth, window.innerHeight);
        this.overlayRenderer.setPixelRatio(window.devicePixelRatio);

        this.overlayRenderer.domElement.style.display = 'none';

        this.init().then(() => this.onInitComplete());

        this.bodyLenis = new Lenis({
            smooth: true,
            direction: 'vertical',
            wrapper: document.body,
            content: document.documentElement,
            syncTouch: true,
            touchMultiplier: 0.5,
        });

        this.aboutLenis = new Lenis({
            smooth: true,
            direction: 'vertical',
            wrapper: document.getElementById('about'),
            content: document.getElementById('about'),
            syncTouch: true,
            touchMultiplier: 0.5,
        });

        this.projectsLenis = new Lenis({
            smooth: true,
            direction: 'vertical',
            wrapper: document.getElementById('projects_info'),
            content: document.getElementById('projects_info'),
            syncTouch: true,
            touchMultiplier: 0.5,
        });

        const rafCallback = (time) => {
            if (this.isProjectsOpen) {
                this.projectsLenis.raf(time);
            } else if (this.isDivOpen) {
                this.aboutLenis.raf(time);
            } else {
                this.bodyLenis.raf(time);
            }

            ScrollTrigger.update();
            requestAnimationFrame(rafCallback);
        };

        requestAnimationFrame(rafCallback);
    }


    stopBodyScrolling() {
        this.bodyLenis.stop();
    }

    startBodyScrolling() {
        this.bodyLenis.start();
    }

    async init() {
        try {
            this.textures = await this.loadTextures(images);
            setupScene(this);
            this.createMeshes();
            setupFBO(this);
            createCSS2DObjects(this, images);
            addObjects(this);
            this.setupEventListeners();
            this.animate();
            this.onWindowResize();
            initLoadingSequence(this)
        } catch (error) {
            console.error('Error initializing EffectShell:', error);
        }
    }

    setupScrollAnimation() {
        gsap.registerPlugin(CustomEase);
        CustomEase.create("customBezier", "0.455, 0.03, 0.515, 0.955");


        gsap.fromTo(".scroll_line",
            {
                "--scaleY": 0,
                "--opacity": 0,
            },
            {
                "--scaleY": 1,
                "--opacity": 1,
                duration: 2,
                ease: "customBezier",
                repeat: -1,
                yoyo: true,
            }
        );

        ScrollTrigger.create({
            start: 'top top',
            end: 'top+=100px top',
            scrub: 1,
            animation: gsap.to('.scroll_line', {
                opacity: 0,
                duration: 2,
                ease: "customBezier",
            }),
        });

        const scrollText = new SplitType('.scroll', { types: 'chars' });
        ScrollTrigger.create({
            start: 'top top',
            end: 'top+=100px top',
            scrub: 1,
            animation: gsap.to('.scroll .char', {
                color: 'rgba(255, 255, 255, 0)',
                stagger: 0.05,
            }),
        });

        const scrollNameText = new SplitType('.name_scroll', { types: 'chars' });
        ScrollTrigger.create({
            trigger: ".hero",
            start: 'bottom 25%',
            end: 'bottom 25%',
            scrub: 2,
            animation: gsap.to('.name_scroll .char', {
                color: 'rgba(255, 255, 255, 1)',
                stagger: 0.05,
                ease: "customBezier",
            }),
        });

        const typeSplit = new SplitType(".projects__title", { types: 'char', tagName: 'span' });

        gsap.fromTo(
            ".projects__title .char",
            {
                color: 'rgba(255, 255, 255, 0)',
                y: -50
            },
            {
                color: 'rgba(255, 255, 255, 1)',
                y: 0,
                ease: "customBezier",
                stagger: 0.05,
                scrollTrigger: {
                    trigger: ".projects",
                    start: "top 30%",
                    end: "top 30%",
                }
            }
        );

        ScrollTrigger.refresh();
    }


    loadTextures(imageArray) {
        const textureLoader = new THREE.TextureLoader();
        return Promise.all(imageArray.map(image => new Promise((resolve, reject) => {
            textureLoader.load(image.src, resolve, undefined, reject);
        })));
    }

    onWindowResize() {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        this.camera.aspect = newWidth / newHeight;
        const minWidth = 300;
        const maxWidth = 2269;
        const defaultMaxDistanceScale = 0.065;
        const maxAllowedScale = 0.2;
        const defaultVelocityScale = 0.08;
        const maxVelocityScale = 0.45;

        let scaleFactor = (newWidth - minWidth) / (maxWidth - minWidth);
        scaleFactor = Math.max(0, Math.min(1, scaleFactor));

        this.maxDistanceScale = defaultMaxDistanceScale + (maxAllowedScale - defaultMaxDistanceScale) * (1 - scaleFactor);
        this.velocityScale = defaultVelocityScale + (maxVelocityScale - defaultVelocityScale) * (1 - scaleFactor);

        const targetFov = calculateTargetFov(newWidth);
        updateCameraProperties(this.camera, targetFov, newHeight, this.defaultCameraZ);

        if (!this.isDragging) {
            this.updatePositions();
        }

        this.renderer.setSize(newWidth, newHeight);
        this.labelRenderer.setSize(newWidth, newHeight);
        this.syncHtmlWithSlider();

        const aspect = newWidth / newHeight;
        const planeHeight = 2 * Math.tan((this.camera.fov * Math.PI) / 360) * Math.abs(this.camera.position.z - this.largePlane.position.z);
        const planeWidth = planeHeight * aspect;

        this.largePlane.geometry.dispose();
        this.largePlane.geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, 24, 24);

        const projectsElement = document.querySelector('.projects');
        this.meshes.forEach(mesh => this.setMeshPosition(mesh, projectsElement));

        const newFrustumSize = this.frustumSize * (newHeight / 1080);

        this.objectCamera.left = -newFrustumSize * aspect / 2;
        this.objectCamera.right = newFrustumSize * aspect / 2;
        this.objectCamera.top = newFrustumSize / 2;
        this.objectCamera.bottom = -newFrustumSize / 2;

        this.overlayRenderer.setSize(newWidth, newHeight);
        this.objectCamera.updateProjectionMatrix();

        if (this.points) {
            this.updatePointsPosition();
        }

    }

    createMeshes() {
        const largePlane = this.createLargePlane();
        this.scene.add(largePlane);

        this.group = new THREE.Group();

        this.textures.forEach((texture, i) => {
            const planeMesh = createPlaneMesh(this, texture, i);
            this.group.add(planeMesh);
        });

        this.scene.add(this.group);
    }

    setMeshPosition(mesh, projectsElement) {
        const rect = projectsElement.getBoundingClientRect();
        const projectsHeight = rect.height;
        const viewportHeight = window.innerHeight;

        mesh.position.x = 0;
        mesh.position.y = -(viewportHeight / 2 - rect.top - projectsHeight / 2);
    }

    createLargePlane() {
        const largeShaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                width: { value: 5 },
                scaleX: { value: 4.7 },
                scaleY: { value: 2.9 },
                progress: { value: 0 },
                time: { value: 1 }
            },
            vertexShader: transitionVertex,
            fragmentShader: transitionFragment,
            transparent: true
        });

        const largeGeometry = new THREE.PlaneGeometry(1, 1, 24, 24);
        this.largePlane = new THREE.Mesh(largeGeometry, largeShaderMaterial);
        this.largeShaderMaterial = largeShaderMaterial;


        this.onWindowResize();

        return this.largePlane;
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


    updatePointsPosition() {
        // Set an offset to position points near the right edge of the screen
        const screenOffsetX = 0.95 * window.innerWidth / 2;  // Move 95% to the right
        const screenOffsetY = 0.1 * window.innerHeight / 2; // Adjust as needed

        // Convert screen position to normalized device coordinates (-1 to +1)
        const ndcX = (screenOffsetX / (window.innerWidth / 2));
        const ndcY = (screenOffsetY / (window.innerHeight / 2));

        // Convert NDC to world coordinates using the camera
        const worldPosition = new THREE.Vector3(ndcX, ndcY, 0).unproject(this.objectCamera);

        // Set the points position to the calculated world coordinates
        this.points.position.set(worldPosition.x, worldPosition.y, 0);
    }

    toggleAboutfbo(show) {
        if (this.points) {
            this.points.visible = show;
        }
        if (this.fboMesh) {
            this.fboMesh.visible = show;
        }

        if (this.overlayRenderer && this.overlayRenderer.domElement) {
            this.overlayRenderer.domElement.style.display = show ? 'block' : 'none';
            this.isOverlayVisible = show;
        }
    }

    updateAdjustedMeshSpacing() {
        this.meshSpacing = this.baseMeshSpacing * this.scaleFactor;
    }

    updatePositions() {
        this.group.children.forEach((child, index) => {
            child.position.x = calculatePositionX(index, this.currentPosition, this.meshSpacing);
        });

        this.syncHtmlWithSlider();

    }

    syncHtmlWithSlider() {
        syncHtmlWithSlider(this);
        this.labelRenderer.render(this.scene, this.camera);
    }

    animate() {

        this.updatePositions();
        this.syncHtmlWithSlider();
        this.renderer.render(this.scene, this.camera);
        this.labelRenderer.render(this.scene, this.camera);

        this.time += 0.05;


        if (this.isOverlayVisible) {
            this.material.uniforms.time.value = this.time;
            this.fboMaterial.uniforms.time.value = this.time;
            this.overlayRenderer.setRenderTarget(this.fbo);
            this.overlayRenderer.render(this.fboScene, this.fboCamera);

            // Render the main scene using the updated texture
            this.material.uniforms.uPositions.value = this.fbo1.texture;
            this.fboMaterial.uniforms.uPositions.value = this.fbo.texture;

            this.overlayRenderer.setRenderTarget(null);
            this.overlayRenderer.render(this.objectScene, this.objectCamera);

            let temp = this.fbo;
            this.fbo = this.fbo1;
            this.fbo1 = temp;

        }

        requestAnimationFrame(this.animate.bind(this));
    }

    setupEventListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this));
        window.addEventListener('mousemove', (event) => onMouseMoveHover(event, this));
        window.addEventListener('pointerdown', (event) => onPointerDown(event, this), { passive: false });
        window.addEventListener('pointermove', (event) => onPointerMove(event, this), { passive: false });
        window.addEventListener('pointerup', (event) => onPointerUp(event, this), { passive: false });
        window.addEventListener('touchstart', (event) => onPointerDown(event, this), { passive: false });
        window.addEventListener('touchmove', (event) => onPointerMove(event, this), { passive: false });
        window.addEventListener('touchend', (event) => onPointerUp(event, this), { passive: false });
        document.getElementById('openAbout').addEventListener('click', () => showAbout(this));
        document.getElementById('close').addEventListener('click', () => closeInfoDiv(this));
        window.addEventListener('load', () => {
            setTimeout(() => {
                // Ensure body scroll resets properly
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
                if (this.bodyLenis) {
                    this.bodyLenis.scrollTo(0, { immediate: true });
                    this.bodyLenis.start();
                }

                this.setupScrollAnimation();
            }, 100);
        });
    }

    onInitComplete() {
        console.log("Initialization complete!");
    }
}

/* new EffectShell();  */