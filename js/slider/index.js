import gsap from 'gsap';
import { calculatePositionX } from '../utils/index.js';
import { meshSpacing } from '../index.js';
const initialDistanceScale = 0;
const maxDragDistanceScale = 0.22;
const maxOffset = 0.65;

export function onPointerDown(event, context) {
    context.isDragging = true;
    context.startX = event.clientX !== undefined ? event.clientX : (event.touches && event.touches[0].clientX);
    context.dragDelta = 0;
    context.lastX = context.startX;
    event.target.setPointerCapture(event.pointerId);
}

export function onPointerMove(event, context) {
    if (!context.isDragging) return;

    const clientX = event.clientX !== undefined ? event.clientX : (event.touches && event.touches[0].clientX);
    if (clientX === undefined) return;

    const delta = clientX - context.startX;
    context.dragDelta += Math.abs(delta);
    context.currentPosition += delta / context.movementSensitivity;

    context.dragSpeed = clientX - context.lastX;
    context.lastX = clientX;

    const dragSpeedAbs = Math.abs(context.dragSpeed);
    const dynamicDistanceScale = initialDistanceScale + Math.min(dragSpeedAbs / 180, maxDragDistanceScale);

    if (Math.abs(context.dragDelta) > 0) {
        context.group.children.forEach(child => {
            gsap.to(child.material.uniforms.uDistanceScale, {
                value: dynamicDistanceScale,
                duration: 0.5,
                ease: "power2.out"
            });
            gsap.to(child.material.uniforms.uOffset.value, {
                x: Math.max(Math.min(context.dragSpeed / 18, maxOffset), -maxOffset),
                duration: 0.5,
                ease: "power2.out"
            });
        });
    }

    gsap.to(context.group.children.map(child => child.position), {
        duration: 0.5,
        x: (index) => calculatePositionX(index, context.currentPosition, meshSpacing),
        ease: "power2.out",
        onUpdate: context.updatePositions.bind(context)
    });

    context.velocity = (delta / context.movementSensitivity) * 0.5;
    context.startX = clientX;
}

export function onPointerUp(event, context) {
    context.isDragging = false;
    context.isMoving = true;

    context.group.children.forEach(child => {
        gsap.to(child.material.uniforms.uOffset.value, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: "power2.out"
        });
    });

    event.target.releasePointerCapture(event.pointerId);

    context.group.children.forEach(child => {
        gsap.to(child.material.uniforms.uDistanceScale, {
            value: initialDistanceScale,
            duration: 0.5,
            ease: "power2.out"
        });
        gsap.to(child.material.uniforms.uOffset.value, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: "power2.out"
        });
    });
}

export function onMouseMoveHover(event, context) {
    context.mouse.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);
    context.raycaster.setFromCamera(context.mouse, context.camera);

    const intersects = context.raycaster.intersectObjects(context.group.children);
    context.group.children.forEach(child => {
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