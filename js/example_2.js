import * as THREE from 'three';
import { setupScene } from './scene/index.js';
import initLoadingSequence from './components/loader/index.js';
import { setupFBO } from './dust/setupFBO.js';
import { addObjects } from './dust/addObjects.js';
import { calculatePositionX, images } from './utils/index.js';
import transitionFragment from './glsl/transition/transition_frag.js';
import transitionVertex from './glsl/transition/transition_vertex.js';
import { createCSS2DObjects } from './slider/titles/index.js';
import { syncHtmlWithSlider } from './slider/titles/syncHtml.js';
import { createPlaneMesh } from './slider/planeMesh/index.js';
import { defaultConfig } from './utils/config.js';
import { setupLenis } from './scrollstrigger/lenis.js';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { setupPostProcessing } from './bloomPass/index.js';
import { onWindowResize } from './resize/index.js';
import { setupEventListeners } from './listeners/index.js';

class EffectShell {
    constructor() {
        Object.assign(this, defaultConfig);


        this.init().then(() => this.onInitComplete());

        setupLenis(this);
    }


    stopBodyScrolling() {
        this.bodyLenis.stop();
    }

    startBodyScrolling() {
        this.bodyLenis.start();
    }

    async init() {
        try {
            setupScene(this);
            this.textures = await this.loadTextures(images);
            setupPostProcessing(this);
            this.createMeshes();
            setupFBO(this);
            createCSS2DObjects(this, images);
            addObjects(this);
            initLoadingSequence(this)
            setupEventListeners(this);
            this.animate();
            onWindowResize(this);
        } catch (error) {
            console.error('Error initializing EffectShell:', error);
        }
    }


    loadTextures(imageArray) {
        const textureLoader = new THREE.TextureLoader();
        return Promise.all(imageArray.map(image => new Promise((resolve, reject) => {
            textureLoader.load(image.src, (texture) => {
                texture.wrapS = THREE.ClampToEdgeWrapping;
                texture.wrapT = THREE.ClampToEdgeWrapping;

                texture.generateMipmaps = true;
                texture.minFilter = THREE.LinearMipMapLinearFilter;
                texture.magFilter = THREE.LinearFilter;
                texture.anisotropy = Math.min(this.renderer.capabilities.getMaxAnisotropy(), 8);
                texture.needsUpdate = true;

                resolve(texture);
            }, undefined, (err) => {
                console.error(`Failed to load texture: ${image.src}`, err);
                reject(err);
            });
        })));
    }

    createMeshes() {
        const largePlane = this.createLargePlane();
        this.scene.add(largePlane);
        largePlane.layers.set(this.PLANE_LAYER);
        largePlane.renderOrder = 0;

        this.group = new THREE.Group();

        this.textures.forEach((texture, i) => {
            const planeMesh = createPlaneMesh(this, texture, i, this.renderer);

            planeMesh.layers.set(this.slider_mesh);

            this.group.add(planeMesh);
        });

        this.scene.add(this.group);

        this.titleElement = document.querySelector(".projects__title");
        this.titleElement.style.transform = 'none';

        this.titleLabel = new CSS2DObject(this.titleElement);
        this.titleLabel.layers.set(this.slider_mesh);
        this.scene.add(this.titleLabel);

        this.projectsElement = document.querySelector(".projects");
        this.titleWorldPos = new THREE.Vector3();
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


        onWindowResize(this);

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

    updateAdjustedMeshSpacing() {
        this.meshSpacing = this.baseMeshSpacing * this.scaleFactor_cards;
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
        // Update positions and sync
        this.updatePositions();
        this.syncHtmlWithSlider();

        if (this.meshArray?.[0] && this.titleLabel) {
            const mesh = this.meshArray[0];
            mesh.getWorldPosition(this.titleWorldPos);
            this.titleLabel.position.y = this.titleWorldPos.y;

            const rect = this.projectsElement.getBoundingClientRect();
            const titleX = rect.left - rect.width / 2.69;
            this.titleElement.style.left = `${titleX}px`;
        }


        // Update mouse positions for the particle material
        this.material.uniforms.uMouse.value.copy(this.pointer);
        this.material.uniforms.uMousePrev.value.copy(this.pointerPrev);

        // === Render particles only for glassBall reflection ===
        const prevMask = this.camera.layers.mask;
        const prevAutoClear = this.renderer.autoClear;

        this.camera.layers.set(this.PARTICLE_LAYER); // Only particles visible
        this.renderer.autoClear = true;

        this.cubeCamera.position.copy(this.glassBall.position);
        this.cubeCamera.update(this.renderer, this.scene);

        this.camera.layers.mask = prevMask;
        this.renderer.autoClear = prevAutoClear;

        // Delta time
        let deltaTime = this.clock.getDelta();
        this.fboMaterial.uniforms.uDelta.value = deltaTime;

        // Update time
        this.time += deltaTime;
        this.material.uniforms.time.value = this.time;
        this.fboMaterial.uniforms.time.value = this.time;

        // Update FBO uniforms
        this.fboMaterial.uniforms.uRandom.value = 0.5 + Math.random() * 0.9;
        this.fboMaterial.uniforms.uRandom2.value = 0.5 + Math.random() * 0.9;

        this.material.uniforms.uCameraPos.value.copy(this.camera.position);
        this.fboMaterial.uniforms.uMouse.value.copy(this.pointer);
        this.fboMaterial.uniforms.uSpherePos.value.copy(this.glassBall.position);
        this.glassBall.position.lerp(this.targetPosition, 0.1);

        // Render to FBO
        this.renderer.setRenderTarget(this.fbo);
        this.renderer.render(this.fboScene, this.fboCamera);
        this.renderer.setRenderTarget(null);

        // Update texture references
        this.material.uniforms.uPositions.value = this.fbo1.texture;
        this.fboMaterial.uniforms.uPositions.value = this.fbo.texture;

        this.camera.layers.enableAll();
        this.renderer.render(this.scene, this.camera);
        this.labelRenderer.render(this.scene, this.camera);
        this.composer.render();

        // Swap FBOs
        let temp = this.fbo;
        this.fbo = this.fbo1;
        this.fbo1 = temp;

        requestAnimationFrame(this.animate.bind(this));
    }

    onInitComplete() {
        console.log("Initialization complete!");
    }
}

new EffectShell();