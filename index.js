import * as THREE from 'three';
import { gsap } from 'gsap';
import { vertexShader, fragmentShader } from './shader';

// Your image data and variables
const images = [
    { src: '1.png', title: 'Adventure Trail Hikes' },
    { src: '2.png', title: 'Holidaze' },
    { src: '3.png', title: 'NoxB' },
    { src: '4.png', title: 'Buyers' },
    { src: '5.png', title: 'Portfolio 02' },
    { src: '6.png', title: 'Note' },
];

let scene, camera, renderer, group;
let currentPosition = 0;
const movementSensitivity = 20;
const meshSpacing = 8;
const slideWidth = 7;
const slideHeight = 10;
let isDragging = false;
let startX = 0;

// Raycaster and mouse vector for hover detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function loadTextures() {
    const loader = new THREE.TextureLoader();
    const texturePromises = images.map(img =>
        new Promise((resolve, reject) => {
            loader.load(img.src, resolve, undefined, reject);
        })
    );
    return Promise.all(texturePromises);
}

function calculatePositionX(index, currentPosition) {
    const totalLength = meshSpacing * images.length;
    return ((((index * meshSpacing + currentPosition) % totalLength) + totalLength) % totalLength) - totalLength / 2;
}

function init(textures) {
    scene = new THREE.Scene();

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
                u_zoom: { value: 1.0 } // Make sure the name matches
            },
            vertexShader,
            fragmentShader
        });

        const planeMesh = new THREE.Mesh(planeGeometry, shaderMaterial);
        planeMesh.position.x = calculatePositionX(i, currentPosition);
        planeMesh.userData.index = i; // Store index in userData
        planeMesh.userData.hovered = false; // Hover flag
        planeMesh.userData.tl = gsap.timeline({ paused: true })
            .to(planeMesh.rotation, { z: -0.1, duration: 0.5, ease: "power2.inOut" })
            .to(shaderMaterial.uniforms.u_zoom, { value: 0.9, duration: 0.5, ease: "power2.inOut" }, 0) // Ensure the uniform name matches
            .to(shaderMaterial.uniforms.u_time, { value: 1.0, duration: 0.5, ease: "power2.inOut" }, 0); // Update u_time uniform

        group.add(planeMesh);
    });

    renderer.domElement.addEventListener("mousedown", onMouseDown);
    renderer.domElement.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("mouseup", onMouseUp);

    renderer.domElement.addEventListener("touchstart", onTouchStart);
    renderer.domElement.addEventListener("touchmove", onTouchMove);
    renderer.domElement.addEventListener("touchend", onTouchEnd);

    renderer.domElement.addEventListener("mousemove", onMouseMoveHover);

    window.addEventListener("resize", onWindowResize, false);
    animate();
}

function onMouseDown(event) {
    isDragging = true;
    startX = event.clientX;
}

function onMouseMove(event) {
    if (isDragging) {
        const delta = event.clientX - startX;
        currentPosition += delta / movementSensitivity;
        gsap.to(group.children.map(child => child.position), {
            duration: 0.5,
            x: (index) => calculatePositionX(index, currentPosition),
            ease: "power2.out",
            onUpdate: updatePositions
        });

        // Update uniforms during drag
        group.children.forEach(child => {
            child.material.uniforms.u_time.value += delta * 0.01; // Adjust time value
            child.material.uniforms.u_strength.value = 5.0; // Adjust strength
            child.material.uniforms.u_speed.value = 1.0; // Adjust speed
        });

        startX = event.clientX;
    }
}

function onMouseUp() {
    isDragging = false;
}

function onTouchStart(event) {
    isDragging = true;
    startX = event.touches[0].clientX;
}

function onTouchMove(event) {
    if (isDragging) {
        const delta = event.touches[0].clientX - startX;
        currentPosition += delta / movementSensitivity;
        gsap.to(group.children.map(child => child.position), {
            duration: 0.5,
            x: (index) => calculatePositionX(index, currentPosition),
            ease: "power2.out",
            onUpdate: updatePositions
        });

        // Update uniforms during drag
        group.children.forEach(child => {
            child.material.uniforms.u_time.value += delta * 0.01; // Adjust time value
            child.material.uniforms.u_strength.value = 5.0; // Adjust strength
            child.material.uniforms.u_speed.value = 1.0; // Adjust speed
        });

        startX = event.touches[0].clientX;
    }
}

function onTouchEnd() {
    isDragging = false;
}

function updatePositions() {
    group.children.forEach((child, index) => {
        child.position.x = calculatePositionX(index, currentPosition);
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    // Update the time uniform for the animation
    group.children.forEach(child => {
        child.material.uniforms.u_time.value += 0.01;
    });

    renderer.render(scene, camera);
}

function onMouseMoveHover(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(group.children);
    group.children.forEach(child => {
        if (intersects.length > 0 && intersects[0].object === child) {
            if (!child.userData.hovered) {
                child.userData.hovered = true;
                child.userData.tl.play();
            }
        } else {
            if (child.userData.hovered) {
                child.userData.hovered = false;
                child.userData.tl.reverse();
            }
        }
    });
}

loadTextures().then(init).catch(console.error);