import * as THREE from 'three';
import gsap from 'gsap';
import { calculatePositionX, images } from './utils/index.js';
import { vertexShader, fragmentShader } from './glsl/shader.js';
import { onPointerDown, onPointerMove, onPointerUp, onMouseMoveHover } from './slider/index.js';
import { CSS2DRenderer } from 'three/examples/jsm/Addons.js';
import { createCSS2DObjects } from './slider/titles/index.js';
import { calculateTargetFov, updateCameraProperties } from './camera/index.js';


class EffectShell {
    constructor() {
        this.textures = [];
        this.cssObjects = [];
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.movementSensitivity = 40;
        this.velocity = 0;
        this.defaultCameraZ = 9.;
        this.friction = 0.95;
        this.startX = 0;
        this.isDragging = false;
        this.currentPosition = 0;
        this.dragDelta = 0;
        this.lastX = 0;
        this.dragSpeed = 0;
        this.scaleFactor = 1
        this.slideHeight = 10.4;
        this.slideWidth = 5.1;
        this.baseMeshSpacing = 6.3;
        this.meshSpacing = this.baseMeshSpacing;
        this.initialDistanceScale = 0;
        this.targetFov = 75;
        this.maxDistanceScale = 0.7;
        this.velocityScale = 0.20;
        this.images = images;

        this.init().then(() => this.onInitComplete());
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

    updateAdjustedMeshSpacing() {
        this.meshSpacing = this.baseMeshSpacing * this.scaleFactor;
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
        const maxVelocityScale = 0.55;


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
    }

    createMeshes() {
        this.textures.forEach((texture, i) => {
            const planeMesh = this.createPlaneMesh(texture, i);
            this.group.add(planeMesh);
        });
    }

    createPlaneMesh(texture, index) {
        const planeGeometry = new THREE.PlaneGeometry(this.slideWidth * this.scaleFactor, this.slideHeight * this.scaleFactor, 24, 24);
        const shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTexture: { value: texture },
                uOffset: {
                    value: new THREE.Vector2(0.0, 0.0)
                },
                uzom: { value: 1.0 },
                uBorderRadius: { value: 0.03 },
                uDistanceScale: { value: this.initialDistanceScale }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true
        });

        const planeMesh = new THREE.Mesh(planeGeometry, shaderMaterial);
        planeMesh.position.x = calculatePositionX(index, 0, this.meshSpacing);
        planeMesh.userData = { index, hovered: false, tl: gsap.timeline({ paused: true }) };

        planeMesh.userData.tl.to(planeMesh.rotation, { z: -0.09, duration: 0.5, ease: "power2.inOut" })
            .to(shaderMaterial.uniforms.uzom, { value: 0.9, duration: 0.5, ease: "power2.inOut" }, 0);

        return planeMesh;
    }

    updatePositions() {
        this.group.children.forEach((child, index) => {
            child.position.x = calculatePositionX(index, this.currentPosition, this.meshSpacing);
        });

        this.syncHtmlWithSlider();
    }

    syncHtmlWithSlider() {
        const followSpeed = 0.07;

        this.group.children.forEach((mesh, index) => {
            const objectCSS = this.cssObjects[index];

            const targetX = mesh.position.x - (-this.slideWidth + 1.25);

            objectCSS.position.y = mesh.position.y - this.slideWidth - 0.28;


            const distanceToTargetX = Math.abs(targetX - objectCSS.position.x);

            if (distanceToTargetX < 10) {
                objectCSS.position.x += (targetX - objectCSS.position.x) * followSpeed;
            } else {
                objectCSS.position.x = targetX;
            }

            objectCSS.element.style.transform = `translate(-50%, -50%) translate3d(${objectCSS.position.x}px, 0)`;
        });
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        this.updatePositions();
        this.syncHtmlWithSlider();
        this.renderer.render(this.scene, this.camera);
        this.labelRenderer.render(this.scene, this.camera);
    }


    setupEventListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this));
        window.addEventListener('pointerdown', (event) => onPointerDown(event, this));
        window.addEventListener('pointermove', (event) => onPointerMove(event, this));
        window.addEventListener('pointerup', (event) => onPointerUp(event, this));
        window.addEventListener('pointercancel', (event) => onPointerUp(event, this));
        window.addEventListener('mousemove', (event) => onMouseMoveHover(event, this));
    }

    onInitComplete() {
        console.log("Initialization complete!");
    }
}

new EffectShell();
