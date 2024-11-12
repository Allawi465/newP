import * as THREE from 'three';
import { CSS2DRenderer } from 'three/examples/jsm/Addons.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis'


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

import fragment from './glsl/moon/fragment.js';
import vertexParticles from './glsl/moon/vertexParticles.js';

import simFragment from './glsl/moon/simFragment.js';
import simVertex from './glsl/moon/simVertex.js';



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
        this.time = 0;
        this.isOverlayVisible = false;
        this.aspect = window.innerWidth / window.innerHeight
        this.frustumSize = 5;
        this.isDivOpen = false;

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

        this.overlayRenderer = new THREE.WebGLRenderer({ alpha: true });
        this.overlayRenderer.setSize(window.innerWidth, window.innerHeight);
        this.overlayRenderer.setPixelRatio(window.devicePixelRatio);

        // Append this renderer to the container element
        document.getElementById('container').appendChild(this.overlayRenderer.domElement);
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

        // Lenis instance for the aboutDiv scroll
        this.aboutLenis = new Lenis({
            smooth: true,
            direction: 'vertical',
            wrapper: document.getElementById('about'), // Target the aboutDiv directly
            content: document.getElementById('about'), // Target the aboutDiv content
            syncTouch: true,
            touchMultiplier: 0.5,
        });

        // Single RAF loop to control both instances based on the active context
        const rafCallback = (time) => {
            if (this.isDivOpen) {
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
            this.setupScene();
            this.createMeshes();
            this.setupFBO();
            this.addObjects();
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



        this.objectCamera.left = (this.frustumSize * aspect) / -2;
        this.objectCamera.right = (this.frustumSize * aspect) / 2;
        this.objectCamera.top = this.frustumSize / 2;
        this.objectCamera.bottom = this.frustumSize / -2;
        this.overlayRenderer.setSize(newWidth, newHeight);
        this.objectCamera.updateProjectionMatrix();



        if (this.points) {
            this.updatePointsPosition();
        }

        if (this.points && this.points.material && this.points.material.uniforms && this.points.material.uniforms.colorMode) {
            if (newWidth <= 640) {
                this.points.material.uniforms.colorMode.value = 1; // Light color scheme for mobile
            } else {
                this.points.material.uniforms.colorMode.value = 0; // Original color scheme for desktop
            }
        }

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
            vertexShader: transitionVertex,
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

    getRenderTarget() {
        const renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
        });
        return renderTarget;
    }


    setupFBO() {
        this.size = 356;
        this.fbo = this.getRenderTarget();
        this.fbo1 = this.getRenderTarget();

        this.fboScene = new THREE.Scene();
        this.fboCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
        this.fboCamera.position.set(0, 0, 0.5);
        this.fboCamera.lookAt(0, 0, 0);

        let geometry = new THREE.PlaneGeometry(2, 2);
        this.data = new Float32Array(this.size * this.size * 4);

        // Fill data array with random positions
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                let index = (i + j * this.size) * 4;
                let theta = Math.random() * Math.PI * 2;
                let r = 0.5 + 0.5 * Math.random();
                this.data[index] = r * Math.cos(theta);
                this.data[index + 1] = r * Math.sin(theta);
                this.data[index + 2] = 1.0;
                this.data[index + 3] = 1.0;
            }
        }

        this.fboTexture = new THREE.DataTexture(this.data, this.size, this.size, THREE.RGBAFormat, THREE.FloatType);
        this.fboTexture.magFilter = THREE.NearestFilter;
        this.fboTexture.minFilter = THREE.NearestFilter;
        this.fboTexture.needsUpdate = true;

        this.fboMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                uPositions: { value: this.fboTexture },
                uInfo: { value: null },
                uMouse: { value: new THREE.Vector2(0, 0) },
            },
            vertexShader: simVertex,
            fragmentShader: simFragment,
        });

        this.infoArray = new Float32Array(this.size * this.size * 4);
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                let index = (i + j * this.size) * 4;
                this.infoArray[index] = 0.5 * Math.random();
                this.infoArray[index + 1] = 0.5 * Math.random();
                this.infoArray[index + 2] = 1.0;
                this.infoArray[index + 3] = 1.0;
            }
        }

        this.info = new THREE.DataTexture(this.infoArray, this.size, this.size, THREE.RGBAFormat, THREE.FloatType);
        this.info.magFilter = THREE.NearestFilter;
        this.info.minFilter = THREE.NearestFilter;
        this.info.needsUpdate = true;
        this.fboMaterial.uniforms.uInfo.value = this.info;

        this.fboMesh = new THREE.Mesh(geometry, this.fboMaterial);
        this.fboScene.add(this.fboMesh);

        this.overlayRenderer.setRenderTarget(this.fbo);
        this.overlayRenderer.render(this.fboScene, this.fboCamera);
        this.overlayRenderer.setRenderTarget(this.fbo1);
        this.overlayRenderer.render(this.fboScene, this.fboCamera);

        this.fboMesh.visible = false;
    }


    addObjects() {
        this.material = new THREE.ShaderMaterial({
            extensions: { derivatives: "#extension GL_OES_standard_derivatives : enable" },
            side: THREE.DoubleSide,
            uniforms: {
                time: { value: 0 },
                uPositions: { value: null },
                resolution: { value: new THREE.Vector4() },
                colorMode: { value: 0 },
            },
            transparent: true,
            vertexShader: vertexParticles,
            fragmentShader: fragment,
        });

        this.count = this.size ** 2;


        let geometry = new THREE.BufferGeometry();
        let positions = new Float32Array(this.count * 3);
        let uv = new Float32Array(this.count * 2);

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                let index = (i + j * this.size);
                positions[index * 3 + 0] = Math.random()
                positions[index * 3 + 1] = Math.random()
                positions[index * 3 + 2] = 0
                uv[index * 2 + 0] = i / this.size
                uv[index * 2 + 1] = j / this.size
            }
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));

        this.material.uniforms.uPositions.value = this.fboTexture;

        this.points = new THREE.Points(geometry, this.material);
        this.objectScene.add(this.points);

        this.points.position.set(4.1, 0.4, 0);

        this.fboMesh.visible = false;

    }

    updatePointsPosition() {
        // Set an offset to position points near the right edge of the screen
        const screenOffsetX = 0.95 * window.innerWidth / 2;  // Move 95% to the right
        const screenOffsetY = 0.25 * window.innerHeight / 2; // Adjust as needed

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
    }

    animate() {
        // Update positions if there is dragging or movement
        if (this.isDragging || Math.abs(this.velocity) > 0) {
            this.updatePositions();
        }

        // Render to main scene
        this.syncHtmlWithSlider();
        this.renderer.render(this.scene, this.camera);
        this.labelRenderer.render(this.scene, this.camera);

        this.time += 0.05; // Increment time once
        // Update uniforms


        requestAnimationFrame(this.animate.bind(this));

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
    }

    onInitComplete() {
        console.log("Initialization complete!");
    }
}

new EffectShell();


