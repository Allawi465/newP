import * as THREE from 'three';
import gsap from 'gsap';
import { calculatePositionX, images } from './utils/index.js';

const meshSpacing = 6.7;
const slideWidth = 5.2;
const slideHeight = 10;
const initialDistanceScale = 0.0;
const dragDistanceScale = -0.029;

class EffectShell {
    constructor() {
        this.textures = [];
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.isDragging = false;
        this.startX = 0;
        this.currentPosition = 0;
        this.movementSensitivity = 40;
        this.maxStretch = 1;
        this.velocity = 0;
        this.friction = 0.85;
        this.isMoving = false;

        this.init().then(() => this.onInitComplete());
    }

    async init() {
        try {
            this.textures = await this.loadTextures(images);
            this.setupScene();
            this.createMeshes();
            this.setupEventListeners();
            this.animate();
        } catch (error) {
            console.error('Error initializing EffectShell:', error);
        }
    }

    loadTextures(imageArray) {
        const textureLoader = new THREE.TextureLoader();
        return Promise.all(imageArray.map(image => new Promise((resolve, reject) => {
            textureLoader.load(image.src, resolve, undefined, reject);
        })));
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100);
        this.camera.position.z = 10.5;

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.group = new THREE.Group();
        this.scene.add(this.group);
    }

    createMeshes() {
        this.textures.forEach((texture, i) => {
            const planeMesh = this.createPlaneMesh(texture, i);
            this.group.add(planeMesh);
        });
    }

    createPlaneMesh(texture, index) {
        const planeGeometry = new THREE.PlaneGeometry(slideWidth, slideHeight, 16, 16);
        const shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTexture: { value: texture },
                uOffset: { value: new THREE.Vector2(0.0, 0.0) },
                uzom: { value: 1.0 },
                uBorderRadius: { value: 0.035 },
                uDistanceScale: { value: initialDistanceScale }
            },
            vertexShader: this.vertexShader(),
            fragmentShader: this.fragmentShader(),
            transparent: true
        });

        const planeMesh = new THREE.Mesh(planeGeometry, shaderMaterial);
        planeMesh.position.x = calculatePositionX(index, 0, meshSpacing);
        planeMesh.userData = { index, hovered: false, tl: gsap.timeline({ paused: true }) };

        planeMesh.userData.tl.to(planeMesh.rotation, { z: -0.1, duration: 0.5, ease: "power2.inOut" })
            .to(shaderMaterial.uniforms.uzom, { value: 0.95, duration: 0.5, ease: "power2.inOut" }, 0);

        return planeMesh;
    }

    setupEventListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this));
        window.addEventListener('pointerdown', this.onPointerDown.bind(this));
        window.addEventListener('pointermove', this.onPointerMove.bind(this));
        window.addEventListener('pointerup', this.onPointerUp.bind(this));
        window.addEventListener('pointercancel', this.onPointerUp.bind(this));
        window.addEventListener('mousemove', this.onMouseMoveHover.bind(this));
    }

    onPointerDown(event) {
        this.isDragging = true;
        this.startX = event.clientX !== undefined ? event.clientX : (event.touches && event.touches[0].clientX);
        event.target.setPointerCapture(event.pointerId);

        gsap.to(this.group.children.map(child => child.material.uniforms.uDistanceScale), {
            value: dragDistanceScale,
            duration: 0.5,
            ease: "power2.out"
        });
    }

    onPointerMove(event) {
        if (!this.isDragging) return;

        const clientX = event.clientX !== undefined ? event.clientX : (event.touches && event.touches[0].clientX);
        if (clientX === undefined) return;

        const delta = clientX - this.startX;
        this.currentPosition += delta / this.movementSensitivity;

        gsap.to(this.group.children.map(child => child.position), {
            duration: 0.5,
            x: (index) => calculatePositionX(index, this.currentPosition, meshSpacing),
            ease: "power2.out",
            onUpdate: this.updatePositions.bind(this)
        });

        this.updateStretchEffect(delta);
        this.velocity = (delta / this.movementSensitivity) * 0.5;
        this.startX = clientX;
    }

    onPointerUp(event) {
        this.isDragging = false;
        this.isMoving = true;
        this.resetStretchEffect();
        event.target.releasePointerCapture(event.pointerId);

        // Reset the distance scale when stopping drag
        gsap.to(this.group.children.map(child => child.material.uniforms.uDistanceScale), {
            value: initialDistanceScale, // Reset to original value
            ease: "power2.out"
        });
    }

    onMouseMoveHover(event) {
        this.mouse.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);
        this.raycaster.setFromCamera(this.mouse, this.camera);

        const intersects = this.raycaster.intersectObjects(this.group.children);
        this.group.children.forEach(child => {
            const isIntersected = intersects.length > 0 && intersects[0].object === child;
            if (isIntersected && !child.userData.hovered) {
                child.userData.hovered = true;
                child.userData.tl.play();
            } else if (!isIntersected && child.userData.hovered) {
                child.userData.hovered = false;
                child.userData.tl.reverse();
            }
        });
    }

    updatePositions() {
        this.group.children.forEach((child, index) => {
            child.position.x = calculatePositionX(index, this.currentPosition, meshSpacing);

        });
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.renderer.render(this.scene, this.camera);

        if (this.isMoving) {
            this.currentPosition += this.velocity;
            this.velocity *= this.friction;

            gsap.to(this.group.children.map(child => child.position), {
                duration: 0.5,
                x: (index) => calculatePositionX(index, this.currentPosition, meshSpacing),
                ease: "power2.out",
                onUpdate: this.updatePositions.bind(this)
            });

            if (Math.abs(this.velocity) < 0.01) {
                this.isMoving = false;
            }
        }
    }

    updateStretchEffect(delta) {
        const clampedDelta = Math.max(Math.min(delta * this.options.strength, this.maxStretch), -this.maxStretch);
        gsap.to(this.group.children.map(child => child.material.uniforms.uOffset.value), {
            x: clampedDelta,
            duration: 0.2,
            ease: "power2.out"
        });
    }

    resetStretchEffect() {
        gsap.to(this.group.children.map(child => child.material.uniforms.uOffset.value), {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
        });
    }

    vertexShader() {
        return `
            uniform vec2 uOffset;
            uniform float uDistanceScale;
            varying vec2 vUv;
            out vec3 vertexColor;
    
            vec3 setPosition(vec3 position) {
               vec3 positionNew = position;
               float distanceFromCenter = abs((modelMatrix * vec4(position, 1.0) * uDistanceScale).x);
    
               positionNew.y *= 1. + 1. * pow(distanceFromCenter, 2.);
               return positionNew;
            }
    
            vec3 deformationCurve(vec3 position, vec2 uv, vec2 offset) {
                float M_PI = 3.1415926535897932384626433832795;
                position.x = position.x + (sin(uv.y * M_PI) * offset.x);
                position.y = position.y + (sin(uv.x * M_PI) * offset.y);
                return position;
            }
    
            void main() {
                vUv = uv;
                vertexColor = vec3(0.5, 0.5, 0.0);
    
                vec3 newPosition = deformationCurve(position, uv, uOffset);
                newPosition = setPosition(newPosition);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
            }
        `;
    }

    fragmentShader() {
        return `
            uniform sampler2D uTexture;
            uniform float uzom;
            uniform float uBorderRadius;
            varying vec2 vUv;

            void main() {
                vec2 uv = (vUv - 0.5) * uzom + 0.5;
                vec4 textureColor = texture2D(uTexture, uv);

                vec2 center = vec2(0.5, 0.5);
                vec2 diff = abs((uv - 0.5) / uzom);
                vec2 size = vec2(0.5) - uBorderRadius;

                if (diff.x > size.x && diff.y > size.y) {
                    float dx = diff.x - size.x;
                    float dy = diff.y - size.y;
                    if (dx * dx + dy * dy > uBorderRadius * uBorderRadius) {
                        discard;
                    }
                } else if (diff.x > size.x) {
                    if (diff.x - size.x > uBorderRadius) {
                        discard;
                    }
                } else if (diff.y > size.y) {
                    if (diff.y - size.y > uBorderRadius) {
                        discard;
                    }
                }

                gl_FragColor = vec4(textureColor.rgb, textureColor.a);
            }
        `;
    }
}

class StretchEffect extends EffectShell {
    constructor(container = document.body, itemsWrapper = null, options = {}) {
        super();
        this.container = container;
        this.itemsWrapper = itemsWrapper;
        this.options = { strength: 0.5, ...options };
    }

    onInitComplete() {
        this.initStretchEffect();
    }

    initStretchEffect() {
        this.group.children.forEach(child => {
            child.material.uniforms.uzom.value = 1;
        });
    }
}

new StretchEffect();