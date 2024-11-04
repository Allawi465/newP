import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import simFragment from './glsl/moon/simFragment.js';
import simVertex from './glsl/moon/simVertex.js';

import fragment from './glsl/moon/fragment.js';
import vertexParticles from './glsl/moon/vertexParticles.js';

class Sketch {
    constructor() {
        this.scene = new THREE.Scene();
        this.isPlaying = true;
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();

        document.getElementById("container").appendChild(this.renderer.domElement);

        // Use only the OrthographicCamera and adjust its parameters if needed
        this.camera = new THREE.OrthographicCamera(
            window.innerWidth / -500,
            window.innerWidth / 500,
            window.innerHeight / 500,
            window.innerHeight / -500,
            0.01,
            1000
        );

        this.camera.position.set(0, 0, 2);

        this.scene.position.set(0, 0, 0);

        this.setupEvents();
        this.getRenderTarget();
        this.setupFBO();
        this.addObjects();
        this.setupResize();

        this.time = 0;

        /*        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
               this.controls.enableDamping = true; // Enable damping for smoother controls
               this.controls.dampingFactor = 0.1; */

        this.render();
    }

    setupEvents() {
        this.dummy = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100),
            new THREE.MeshBasicMaterial()
        )

        document.addEventListener("pointermove", (e) => {
            this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

            this.raycaster.setFromCamera(this.pointer, this.camera);
            let intersects = this.raycaster.intersectObject(this.dummy);
            if (intersects.length > 0) {
                let { x, y } = intersects[0].point;
                this.fboMaterial.uniforms.uMouse.value = new THREE.Vector2(x, y);
                console.log(x, y)
            }
        })
    }

    setupResize() {
        window.addEventListener("resize", this.resize.bind(this));
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.renderer.setSize(this.width, this.height);

        this.camera.left = -this.width / 500;
        this.camera.right = this.width / 500;
        this.camera.top = this.height / 500;
        this.camera.bottom = -this.height / 500;

        // Adjust the zoom to scale based on a factor related to window size
        this.camera.zoom = Math.min(this.width, this.height) / 1000; // Adjust the divisor as needed
        this.camera.updateProjectionMatrix();
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
        this.size = 256;
        this.fbo = this.getRenderTarget();
        this.fbo1 = this.getRenderTarget();

        this.fboScene = new THREE.Scene();
        this.fboCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
        this.fboCamera.position.set(0, 0, 0.5);
        this.fboCamera.lookAt(0, 0, 0);

        let geometry = new THREE.PlaneGeometry(2, 2);

        this.data = new Float32Array(this.size * this.size * 4);

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                let index = (i + j * this.size) * 4;
                let theta = Math.random() * Math.PI * 2;
                let r = 0.5 + 0.5 * Math.random();
                this.data[index + 0] = r * Math.cos(theta);
                this.data[index + 1] = r * Math.sin(theta);
                this.data[index + 2] = 1.;
                this.data[index + 3] = 1.;
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
                this.infoArray[index + 0] = 0.5 * Math.random();
                this.infoArray[index + 1] = 0.5 * Math.random();
                this.infoArray[index + 2] = 1.;
                this.infoArray[index + 3] = 1.;
            }
        }

        this.info = new THREE.DataTexture(this.infoArray, this.size, this.size, THREE.RGBAFormat, THREE.FloatType);
        this.info.magFilter = THREE.NearestFilter;
        this.info.minFilter = THREE.NearestFilter;
        this.info.needsUpdate = true;
        this.fboMaterial.uniforms.uInfo.value = this.info;




        this.fboMesh = new THREE.Mesh(geometry, this.fboMaterial);
        this.fboScene.add(this.fboMesh);

        this.renderer.setRenderTarget(this.fbo);
        this.renderer.render(this.fboScene, this.fboCamera);
        this.renderer.setRenderTarget(this.fbo1);
        this.renderer.render(this.fboScene, this.fboCamera)
    }

    addObjects() {
        this.material = new THREE.ShaderMaterial({
            extensions: { derivatives: "#extension GL_OES_standard_derivatives : enable" },
            side: THREE.DoubleSide,
            uniforms: {
                time: { value: 0 },
                uPositions: { value: null },
                resolution: { value: new THREE.Vector4() },
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
        this.scene.add(this.points);

    }

    render() {
        if (!this.isPlaying) return;
        this.time += 0.05; // Increment time once
        // Update uniforms
        this.material.uniforms.time.value = this.time;
        this.fboMaterial.uniforms.time.value = this.time;

        requestAnimationFrame(this.render.bind(this));

        this.renderer.setRenderTarget(this.fbo);
        this.renderer.render(this.fboScene, this.fboCamera);

        // Render the main scene using the updated texture
        this.material.uniforms.uPositions.value = this.fbo1.texture;
        this.fboMaterial.uniforms.uPositions.value = this.fbo.texture;


        this.renderer.setRenderTarget(null);
        this.renderer.render(this.scene, this.camera);

        // Swap FBOs for double-buffering if necessary
        let temp = this.fbo;
        this.fbo = this.fbo1;
        this.fbo1 = temp;

    }
}

/* new Sketch();  */