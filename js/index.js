import * as THREE from 'three';
import gsap from 'gsap';
import { calculatePositionX, images } from './utils/index.js';
import { vertexShader, fragmentShader } from './glsl/shader.js';
import { onPointerDown, onPointerMove, onPointerUp, onMouseMoveHover } from './slider/index.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/Addons.js';


class EffectShell {
    constructor() {
        this.textures = [];
        this.cssObjects = [];
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.movementSensitivity = 40;
        this.velocity = 0;
        this.defaultCameraZ = 10.5;
        this.friction = 0.95;
        this.startX = 0;
        this.isDragging = false;
        this.currentPosition = 0;
        this.isMoving = false;
        this.dragDelta = 0;
        this.lastX = 0;
        this.dragSpeed = 0;
        this.scaleFactor = 1
        this.slideHeight = 9.8;
        this.slideWidth = 5;
        this.baseMeshSpacing = 6.2;
        this.meshSpacing = this.baseMeshSpacing;
        this.initialDistanceScale = 0;

        this.init().then(() => this.onInitComplete());
    }

    async init() {
        try {
            this.textures = await this.loadTextures(images);
            this.setupScene();
            this.createMeshes();
            this.createCSS2DObjects();
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

        // Base dimensions for adjustments
        const baseWidth = 1707; // Width at which FOV starts changing
        const baseHeight = 1024; // Reference height for camera adjustment
        const defaultFov = 75; // Default field of view
        const maxFov = 120; // Maximum field of view to prevent it from zooming out too much
        const defaultCameraZ = 10.5; // Default camera Z depth

        // Determine target FOV and camera Z position
        let targetFov = defaultFov;
        let cameraZPosition = defaultCameraZ;

        // Case 1: Both width and height have changed
        if (newWidth < baseWidth && newHeight !== baseHeight) {
            // Adjust FOV based on width
            const widthScaleFactor = baseWidth / newWidth;
            targetFov = Math.min(defaultFov * widthScaleFactor, maxFov);

            // Adjust the camera Z position and further adjust FOV based on height
            const heightScaleFactor = newHeight / baseHeight;
            cameraZPosition = defaultCameraZ * heightScaleFactor;

            const heightScaleFactorForFov = baseHeight / newHeight;
            targetFov = Math.min(targetFov * heightScaleFactorForFov, maxFov);
        }
        // Case 2: Only the height has changed
        else if (newHeight !== baseHeight) {
            const heightScaleFactor = newHeight / baseHeight;
            cameraZPosition = defaultCameraZ * heightScaleFactor;

            const heightScaleFactorForFov = baseHeight / newHeight;
            targetFov = Math.min(targetFov * heightScaleFactorForFov, 100);
        }
        // Case 3: Only the width has changed or none have changed
        else if (newWidth < baseWidth) {
            const widthScaleFactor = baseWidth / newWidth;
            targetFov = Math.min(defaultFov * widthScaleFactor, maxFov);
        }

        // Apply the calculated FOV and camera Z position
        this.camera.fov = targetFov;
        this.camera.position.z = cameraZPosition;
        this.camera.updateProjectionMatrix();


        if (!this.isDragging) {
            const baseOffset = 10; // Adjust this value to control the movement speed
            const horizontalOffset = (newWidth < baseWidth) ? baseOffset * (baseWidth - newWidth) / baseWidth : 0;

            const verticalOffset = (newHeight < baseHeight) ? baseOffset * (baseHeight - newHeight) / baseHeight : 0;

            // Update currentPosition based on width and height
            this.currentPosition += (horizontalOffset + verticalOffset) / this.meshSpacing;
            this.updatePositions();
        }

        // Update the renderer and labelRenderer sizes
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
        const planeGeometry = new THREE.PlaneGeometry(this.slideWidth * this.scaleFactor, this.slideHeight * this.scaleFactor, 16, 16);
        const shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTexture: { value: texture },
                uOffset: { value: new THREE.Vector2(0.0, 0.0) },
                uzom: { value: 1.0 },
                uBorderRadius: { value: 0.035 },
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
    }

    createCSS2DObjects() {
        images.forEach((image, index) => {
            const element = document.createElement('div');
            element.className = 'slider-project';
            element.dataset.index = index;

            const container = document.createElement('div');
            container.className = 'slider-project__container';

            const title = document.createElement('div');
            title.className = 'slider-project__title';
            title.textContent = image.title || '';
            container.appendChild(title);

            const description = document.createElement('div');
            description.className = 'slider-project__description';
            description.textContent = image.description || '';
            container.appendChild(description);

            element.appendChild(container);

            const objectCSS = new CSS2DObject(element);


            const mesh = this.group.children[index];
            objectCSS.position.copy(mesh.position);

            this.cssGroup.add(objectCSS);
            this.cssObjects.push(objectCSS);
            document.body.appendChild(element);
        });
    }

    syncHtmlWithSlider() {
        this.group.children.forEach((mesh, index) => {
            const objectCSS = this.cssObjects[index];
            objectCSS.position.copy(mesh.position);
            objectCSS.position.y -= this.slideHeight / 2 + 0.2;
            objectCSS.position.x -= -this.slideWidth + 1.19;
        });
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.renderer.render(this.scene, this.camera);

        if (this.isMoving) {
            this.currentPosition += this.velocity;
            this.velocity *= this.friction;

            gsap.to(this.group.children.map(child => child.position), {
                duration: 0.5,
                x: (index) => calculatePositionX(index, this.currentPosition, this.meshSpacing),
                ease: "power2.out",
                onUpdate: this.updatePositions.bind(this)
            });

            if (Math.abs(this.velocity) < 0.01) {
                this.isMoving = false;
            }
        }

        this.syncHtmlWithSlider();

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