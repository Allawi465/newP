import * as THREE from 'three';
import gsap from 'gsap';
import { calculatePositionX } from '../utils/index.js';
import { group, meshSpacing, camera, renderer } from '../scene/index.js';
let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();

let isDragging = false;
let startX = 0;
export let currentPosition = 0;
const movementSensitivity = 20;

export function onMouseDown(event) {
    isDragging = true;
    startX = event.clientX;
}

export function onMouseMove(event) {
    if (isDragging) {
        const delta = event.clientX - startX;
        currentPosition += delta / movementSensitivity;
        gsap.to(group.children.map(child => child.position), {
            duration: 0.5,
            x: (index) => calculatePositionX(index, currentPosition, movementSensitivity),
            ease: "power2.out",
            onUpdate: updatePositions
        });

        group.children.forEach(child => {
            child.material.uniforms.u_time.value += delta * 0.01;
            child.material.uniforms.u_strength.value = 5.0;
            child.material.uniforms.u_speed.value = 1.0;
        });

        startX = event.clientX;
    }
}

export function onMouseUp() {
    isDragging = false;
}

export function onTouchStart(event) {
    isDragging = true;
    startX = event.touches[0].clientX;
}

export function onTouchMove(event) {
    if (isDragging) {
        const delta = event.touches[0].clientX - startX;
        currentPosition += delta / movementSensitivity;
        gsap.to(group.children.map(child => child.position), {
            duration: 0.5,
            x: (index) => calculatePositionX(index, currentPosition, movementSensitivity),
            ease: "power2.out",
            onUpdate: updatePositions
        });

        group.children.forEach(child => {
            child.material.uniforms.u_time.value += delta * 0.01;
            child.material.uniforms.u_strength.value = 5.0;
            child.material.uniforms.u_speed.value = 1.0;
        });

        startX = event.touches[0].clientX;
    }
}

export function onTouchEnd() {
    isDragging = false;
}

export function onMouseMoveHover(event) {
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

function updatePositions() {
    group.children.forEach((child, index) => {
        child.position.x = calculatePositionX(index, currentPosition, meshSpacing);
    });
}

export function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
