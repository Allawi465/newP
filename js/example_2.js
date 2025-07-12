import { setupScene, setupFBO, addObjects, createCSS2DObjects, syncHtmlWithSlider, setupLenis, setupPostProcessing, onWindowResize, setupEventListeners, createMeshes } from './threeJS/index.js';
import { defaultConfig, calculatePositionX, images, loadTextures } from './utils/index.js';
import initLoadingSequence from './components/loader/index.js';

class EffectShell {
    constructor() {
        Object.assign(this, defaultConfig);

        setupLenis(this);

        this.stopBodyScrolling();

        this.init().then(() => this.onInitComplete());
    }


    async init() {
        try {
            setupScene(this);
            this.textures = await loadTextures(images, this);
            setupPostProcessing(this);
            createMeshes(this);
            setupFBO(this);
            createCSS2DObjects(this, images);
            addObjects(this);
            setupEventListeners(this);
            this.animate();
            onWindowResize(this);
            initLoadingSequence(this)
        } catch (error) {
            console.error('Error initializing EffectShell:', error);
        }
    }

    stopBodyScrolling() {
        this.bodyLenis?.stop()
        document.body.classList.add('scroll-locked')
    }

    startBodyScrolling() {
        this.bodyLenis?.start()
        document.body.classList.remove('scroll-locked')
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

        this.material.uniforms.uMouse.value.copy(this.pointer);
        this.material.uniforms.uMousePrev.value.copy(this.pointerPrev);
        this.renderer.autoClear = true;

        this.cubeCamera.position.copy(this.glassBall.position);
        this.cubeCamera.update(this.renderer, this.scene);

        // Delta time
        let deltaTime = this.clock.getDelta();

        this.fboMaterial.uniforms.uDelta.value = deltaTime;
        const maxDelta = 0.1;
        this.fboMaterial.uniforms.uDelta.value = Math.min(deltaTime, maxDelta);

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
        this.glassBall.position.lerp(this.targetPosition, 0.05);

        // Render to FBO
        this.renderer.setRenderTarget(this.fbo);
        this.renderer.render(this.fboScene, this.fboCamera);
        this.renderer.setRenderTarget(null);

        // Update texture references
        this.material.uniforms.uPositions.value = this.fbo1.texture;
        this.fboMaterial.uniforms.uPositions.value = this.fbo.texture;

        this.camera.layers.enableAll();
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