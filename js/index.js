import * as THREE from 'three';
import gsap from 'gsap';
import { calculatePositionX, images } from './utils/index.js';
import transitionFragment from "./glsl/transition/transition_frag.js"
import transitionVertext from './glsl/transition/transition_vertex.js';
import { onPointerDown, onPointerMove, onPointerUp, onMouseMoveHover } from './slider/index.js';
import { CSS2DRenderer } from 'three/examples/jsm/Addons.js';
import { createCSS2DObjects } from './slider/titles/index.js';
import { calculateTargetFov, updateCameraProperties } from './camera/index.js';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis'
import { syncHtmlWithSlider } from './slider/titles/syncHtml.js';
import { createPlaneMesh } from './slider/planeMesh/index.js';

gsap.registerPlugin(ScrollTrigger);


class EffectShell {
    constructor() {
        this.textures = [];
        this.cssObjects = [];
        this.meshes = [];
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
        this.baseMeshSpacing = 6.3;
        this.meshSpacing = this.baseMeshSpacing;
        this.initialDistanceScale = 0;
        this.targetFov = 75;
        this.maxDistanceScale = 0.7;
        this.velocityScale = 0.20;
        this.images = images;
        this.largePlane = null;

        this.init().then(() => this.onInitComplete());

        this.lenis = new Lenis({
            smooth: true,
            direction: 'vertical',
            wrapper: document.body,
            content: document.documentElement,
            syncTouch: true,

        });

        const rafCallback = (time) => {
            this.lenis.raf(time);
            ScrollTrigger.update();
            requestAnimationFrame(rafCallback);
        };
        requestAnimationFrame(rafCallback);
    }

    async init() {
        try {
            this.textures = await this.loadTextures(images);
            this.setupScene();
            this.createMeshes();
            createCSS2DObjects(this, images);
            this.setupEventListeners();
            this.animate();
            this.onWindowResize();
        } catch (error) {
            console.error('Error initializing EffectShell:', error);
        }
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
        this.camera.position.z = this.defaultCameraZ;

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0xffffff, 1);
        document.body.appendChild(this.renderer.domElement);

        this.labelRenderer = new CSS2DRenderer();
        this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
        this.labelRenderer.domElement.style.position = 'fixed';
        this.labelRenderer.domElement.style.top = '0px';
        this.labelRenderer.domElement.style.pointerEvents = 'none';
        this.labelRenderer.domElement.style.zIndex = '10';
        document.body.appendChild(this.labelRenderer.domElement);

        this.group = new THREE.Group();
        this.scene.add(this.group);

        this.cssGroup = new THREE.Group();
        this.scene.add(this.cssGroup);
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
            const baseWidth = 1707;
            const baseHeight = 1024;
            const baseOffset = 10;
            const horizontalOffset = newWidth < baseWidth ? baseOffset * (baseWidth - newWidth) / baseWidth : 0;
            const verticalOffset = newHeight < baseHeight ? baseOffset * (baseHeight - newHeight) / baseHeight : 0;
            this.currentPosition += (horizontalOffset + verticalOffset) / this.meshSpacing;
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
    }

    createMeshes() {
        const largePlane = this.createLargePlane();
        this.scene.add(largePlane);

        this.textures.forEach((texture, i) => {
            const planeMesh = this.createPlaneMesh(texture, i);
            this.group.add(planeMesh);
        });
    }


    createPlaneMesh(texture, index) {
        return createPlaneMesh(this, texture, index);
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
            vertexShader: transitionVertext,
            fragmentShader: transitionFragment,
            transparent: true
        });

        const largeGeometry = new THREE.PlaneGeometry(1, 1, 24, 24);
        this.largePlane = new THREE.Mesh(largeGeometry, largeShaderMaterial);


        this.onWindowResize();

        gsap.to(largeShaderMaterial.uniforms.progress, {
            value: 1,
            duration: 2,
            ease: 'power2.inOut',
        });

        return this.largePlane;
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
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        if (this.isDragging || Math.abs(this.velocity) > 0) {
            this.updatePositions();
        }
        this.syncHtmlWithSlider();
        this.renderer.render(this.scene, this.camera);
        this.labelRenderer.render(this.scene, this.camera);

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
    }

    onInitComplete() {
        console.log("Initialization complete!");
    }
}

new EffectShell();