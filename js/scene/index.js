import * as THREE from 'three';
import gsap from 'gsap';
import { calculatePositionX } from '../utils/index.js';
import { vertexShader, fragmentShader } from '../glsl/shader.js';

export const meshSpacing = 8;
const slideWidth = 7;
const slideHeight = 10;

export let group;
export let camera, renderer;

export function initScene(textures) {
    const scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100);
    camera.position.z = 10;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    group = new THREE.Group();
    scene.add(group);

    textures.forEach((texture, i) => {
        const planeGeometry = new THREE.PlaneGeometry(slideWidth, slideHeight);
        const shaderMaterial = new THREE.ShaderMaterial({
            transparent: true,
            uniforms: {
                u_texture: { value: texture },
                u_time: { type: "f", value: 0 },
                u_strength: { type: "f", value: 5.0 },
                u_speed: { type: "f", value: 1.0 },
                u_zoom: { value: 1.0 },
                uOffset: { value: new THREE.Vector2(0.0, 0.0) }
            },
            vertexShader,
            fragmentShader
        });

        const planeMesh = new THREE.Mesh(planeGeometry, shaderMaterial);
        planeMesh.position.x = calculatePositionX(i, 0, meshSpacing);
        planeMesh.userData = { index: i, hovered: false, tl: gsap.timeline({ paused: true }) };
        planeMesh.userData.tl.to(planeMesh.rotation, { z: -0.1, duration: 0.5, ease: "power2.inOut" })
            .to(shaderMaterial.uniforms.u_zoom, { value: 0.9, duration: 0.5, ease: "power2.inOut" }, 0);

        group.add(planeMesh);
    });

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    return { scene, camera, renderer, group };
}