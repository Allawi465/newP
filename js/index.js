import * as THREE from 'three';
import { setupScene, setupFBO, addObjects, createCSS2DObjects, syncHtmlWithSlider, setupLenis, setupPostProcessing, onWindowResize, setupEventListeners, createMeshes, moonFBO, addMoonObjects } from './threeJS/index.js';
import { defaultConfig, calculatePositionX, images, loadTextures } from './utils/index.js';
import initLoadingSequence from './components/loader/index.js';

class EffectShell {
    constructor() {
        Object.assign(this, defaultConfig);

        setupLenis(this);

        this.stopBodyScrolling();

        this.init().then(() => this.onInitComplete());

        this.VIEW_WIDTH = 3.5;
        this.baseMeshSpacing = 2.2;

        this.bounceTween = null;
    }

    async init() {
        try {
            setupScene(this);
            this.textures = await loadTextures(images, this);
            createMeshes(this);
            setupPostProcessing(this);
            setupFBO(this);
            /*           moonFBO(this); */
            createCSS2DObjects(this, images);
            addObjects(this);
            /*             addMoonObjects(this); */
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
    }

    startBodyScrolling() {
        this.bodyLenis?.start()
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


    updatePointsPosition() {
        // Set an offset to position points near the right edge of the screen
        const screenOffsetX = 0.95 * window.innerWidth / 2;  // Move 95% to the right
        const screenOffsetY = 0. * window.innerHeight / 2; // Adjust as needed

        // Convert screen position to normalized device coordinates (-1 to +1)
        const ndcX = (screenOffsetX / (window.innerWidth / 2));
        const ndcY = (screenOffsetY / (window.innerHeight / 2));

        // Convert NDC to world coordinates using the camera
        const worldPosition = new THREE.Vector3(ndcX, ndcY, 0).unproject(this.camera);

        // Set the points position to the calculated world coordinates
        this.moonParticlePoints.position.set(worldPosition.x, worldPosition.y, 0);
    }

    updateUniforms(deltaTime) {
        // Mouse uniforms
        this.material.uniforms.uMouse.value.copy(this.pointer);
        this.material.uniforms.uMousePrev.value.copy(this.pointerPrev);

        // Time uniforms with max delta
        this.material.uniforms.time.value = this.time;
        this.fboMaterial.uniforms.time.value = this.time;
        this.fboMaterial.uniforms.uDelta.value = this.time
        this.fboMaterial.uniforms.uDelta.value = Math.min(deltaTime, 0.1);

        // Random uniforms
        this.fboMaterial.uniforms.uRandom.value = 0.5 + Math.random() * 0.9;
        this.fboMaterial.uniforms.uRandom2.value = 0.5 + Math.random() * 0.9;

        // Position uniforms
        this.material.uniforms.uCameraPos.value.copy(this.camera.position);
        this.fboMaterial.uniforms.uSpherePos.value.copy(this.glassBall.position);
    }

    // Renders to the FBO, updates textures, and swaps FBOs
    renderToFBO() {
        this.renderer.setRenderTarget(this.fbo);
        this.renderer.render(this.fboScene, this.fboCamera);
        this.renderer.setRenderTarget(null);

        // Update texture references
        this.material.uniforms.uPositions.value = this.fbo1.texture;
        this.fboMaterial.uniforms.uPositions.value = this.fbo.texture;

        // Swap FBOs
        let temp = this.fbo;
        this.fbo = this.fbo1;
        this.fbo1 = temp;
    }

    animate() {

        let deltaTime = this.clock.getDelta();
        this.time += deltaTime;

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

        this.updateUniforms(deltaTime);
        this.glassBall.position.lerp(this.targetPosition, 0.05);
        this.cubeCamera.position.copy(this.glassBall.position);
        this.cubeCamera.update(this.renderer, this.scene);

        this.renderToFBO();

        /* this.moonParticleMaterial.uniforms.time.value = this.time;
           this.moonFBOMaterial.uniforms.time.value = this.time;
           this.moonParticleMaterial.uniforms.uCameraPos.value.copy(this.camera.position);
   
           this.renderer.setRenderTarget(this.moonFBO);
           this.renderer.render(this.moonFBOScene, this.moonFBOCamera);
   
           this.moonParticleMaterial.uniforms.uPositions.value = this.moonFBO1.texture;
           this.moonFBOMaterial.uniforms.uPositions.value = this.moonFBO.texture;

           let temp = this.moonFBO;
           this.moonFBO = this.moonFBO1;
           this.moonFBO1 = temp; */

        this.renderer.autoClear = true;
        this.camera.layers.enableAll();
        this.labelRenderer.render(this.scene, this.camera);
        this.composer.render();

        requestAnimationFrame(this.animate.bind(this));
    }

    onInitComplete() {
        console.log("Initialization complete!");
    }
}

new EffectShell();