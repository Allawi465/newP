import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { setupScene, setupFBO, addObjects, createCSS2DObjects, syncHtmlWithSlider, createPlaneMesh, setupLenis, setupPostProcessing, onWindowResize, setupEventListeners, createLargePlane } from './threeJS/index.js';
import { defaultConfig, calculatePositionX, images, loadTextures } from './utils/index.js';
import initLoadingSequence from './components/loader/index.js';

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
            this.textures = await loadTextures(images, this);
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


    createMeshes() {
        const largePlane = createLargePlane(this);
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