import gsap from 'gsap';
import { screenFactors, distanceScale, applyOffset, applyDistanceScale } from './onpointer.js';


export function onPointerMove(event, context) {
    if (!context.isDragging) return;

    const clientX = event.clientX !== undefined ? event.clientX : (event.touches && event.touches[0].clientX);
    if (clientX === undefined) return;

    // Calculate the change in position (delta) and update context properties
    const delta = clientX - context.startX;
    context.dragDelta += Math.abs(delta);
    context.currentPosition += delta / context.movementSensitivity;

    // Calculate drag speed and update the context
    context.dragSpeed = clientX - context.lastX;
    context.lastX = clientX;


    // Calculate screen factors and dynamic distance scale
    const { dragSpeedAbs, widthFactor, heightFactor, curveIntensity, maxDragSpeed } = screenFactors(context);
    const dynamicDistanceScale = Math.min(distanceScale(context, dragSpeedAbs, widthFactor, heightFactor, curveIntensity, maxDragSpeed), 0.25);

    // Apply effects and update positions
    applyOffset(context);
    /*    applyDistanceScale(context, dynamicDistanceScale); */
    context.updatePositions();

    // Calculate velocity based on movement sensitivity
    context.velocity = (delta / context.movementSensitivity * 0.2);
    context.startX = clientX;
}


export function onPointerUp(event, context) {
    context.isDragging = false;
    context.isMoving = true;

    startMomentumMotion(context);
}

export function startMomentumMotion(context) {
    if (!context.isMoving) return;

    // Use velocity to update position
    context.currentPosition += context.velocity;

    // Update positions of meshes based on new position
    context.updatePositions();

    // Gradually reduce velocity using friction
    context.velocity *= context.friction;
    // Calculate screen factors and dynamic distance scale
    const { dragSpeedAbs, widthFactor, heightFactor, curveIntensity, maxDragSpeed } = screenFactors(context);
    const dynamicDistanceScale = Math.min(distanceScale(context, dragSpeedAbs, widthFactor, heightFactor, curveIntensity, maxDragSpeed), 0.25);

    // Adjust uOffset proportionally to the current velocity
    const offsetValue = context.velocity * 50; // Scale offset based on velocity



    context.group.children.forEach(child => {
        // Smoothly animate the offset and distance scale based on current motion
        gsap.to(child.material.uniforms.uOffset.value, {
            x: offsetValue,
            ease: "power4.out",
            duration: 0.6,
        });
    });

    if (Math.abs(context.velocity) > 0.15) {
        requestAnimationFrame(() => startMomentumMotion(context));
    } else {
        // Stop the motion and reset context properties
        context.velocity = 0;
        context.isMoving = false;

        // Reset values to their initial states
        context.group.children.forEach(child => {
            gsap.to(child.material.uniforms.uOffset.value, {
                x: 0,
                ease: "power4.out",
                duration: 0.6,
            });

            /*         gsap.to(child.material.uniforms.uDistanceScale, {
                        value: context.initialDistanceScale,
                        duration: 0.5, // Smooth transition duration
                        ease: "power3.out", // Easing for smooth effect
                    }); */
        });
    }
}

export function onPointerDown(event, context) {
    context.isDragging = true;
    context.startX = event.clientX !== undefined ? event.clientX : (event.touches && event.touches[0].clientX);
    context.dragDelta = 0;
    context.lastX = context.startX;
    context.isMoving = false;
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