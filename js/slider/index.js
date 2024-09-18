import gsap from 'gsap';
import { calculatePositionX } from '../utils/index.js';
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

    // Get the current window dimensions
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Adjust the scaling factor dynamically based on the current window size
    const smallScreenThreshold = 1707; // Threshold for small screen
    const widthFactor = windowWidth < smallScreenThreshold ? (smallScreenThreshold / windowWidth) : 1;
    const heightFactor = windowHeight < smallScreenThreshold ? (smallScreenThreshold / windowHeight) : 1;

    // Make the effect more pronounced when the width is smaller
    const curveIntensity = windowWidth < smallScreenThreshold ? 1.0 : 1.0; // Increase intensity for smaller screens
    const dynamicDistanceScale = context.initialDistanceScale + Math.min(dragSpeedAbs / (180 / curveIntensity), maxDragDistanceScale) * widthFactor * heightFactor;

    if (Math.abs(context.dragDelta) > 0) {
        context.group.children.forEach(child => {
            // Apply a more dynamic curve by increasing the distance scale effect
            gsap.to(child.material.uniforms.uDistanceScale, {
                value: dynamicDistanceScale,
                duration: 0.5, // Adjust duration for responsiveness
                ease: "power2.out"
            });
            // Make the curve effect more noticeable by scaling the offset
            gsap.to(child.material.uniforms.uOffset.value, {
                x: Math.max(Math.min(context.dragSpeed / (9 * curveIntensity), maxOffset), -maxOffset),
                duration: 0.5, // Adjust duration for responsiveness
                ease: "power2.out"
            });
        });

        // Use the globally stored scaleFactor from onWindowResize
        gsap.to(context.group.children.map(child => child.position), {
            duration: 0.5, // Adjust duration for responsiveness
            x: (index) => calculatePositionX(index, context.currentPosition, context.adjustedMeshSpacing),
            ease: "power2.out",
            onUpdate: context.updatePositions.bind(context)
        });
    }

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
            value: context.initialDistanceScale,
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