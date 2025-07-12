import { handleClick } from './handleClick/index.js';
import startMomentumMotion from './sliderMotion/sliderMotion.js';

export function onPointerMove(event, context) {
    if (!context.isDragging) return;

    const clientX = event.clientX !== undefined ? event.clientX : (event.touches && event.touches[0].clientX);
    if (clientX === undefined) return;

    const delta = clientX - context.startX;

    // Apply some smoothing to the dragDelta to make it feel more constant
    const smoothingFactor = 0.1; // Adjust this factor for more or less smoothness
    context.dragDelta = context.dragDelta * (1 - smoothingFactor) + Math.abs(delta) * smoothingFactor;

    // Adjust the position with some easing to avoid abrupt jumps
    context.currentPosition += (delta / context.movementSensitivity) * smoothingFactor;

    // Calculate drag speed and apply smoothing to it
    const rawSpeed = clientX - context.lastX;
    context.dragSpeed = context.dragSpeed * (1 - smoothingFactor) + rawSpeed * smoothingFactor;

    // Limit the maximum speed for more control
    context.dragSpeed = Math.max(Math.min(context.dragSpeed, 25), -25);

    context.lastX = clientX;

    if (!context.isMomentumStarted) {
        context.isMomentumStarted = true;
        startMomentumMotion(context);
    }

    context.updatePositions();

    // Smooth the velocity as well
    context.velocity = context.velocity * (1 - smoothingFactor) + (delta / context.movementSensitivity) * smoothingFactor;
    context.startX = clientX;
}

export function onPointerDown(event, context) {
    context.isDragging = true;
    context.startX = event.clientX !== undefined ? event.clientX : (event.touches && event.touches[0].clientX);
    context.startY = event.clientY !== undefined ? event.clientY : (event.touches && event.touches[0].clientY);
    context.dragDelta = 1;
    context.lastX = context.startX;
    context.isMoving = false;
    context.isMomentumStarted = false;

    // Store the initial click position
    context.initialClick = { x: context.startX, y: context.startY };
}

export function onPointerUp(event, context) {
    const endX = event.clientX !== undefined
        ? event.clientX
        : (event.touches && event.touches[0] && event.touches[0].clientX);
    const endY = event.clientY !== undefined
        ? event.clientY
        : (event.touches && event.touches[0] && event.touches[0].clientY);


    if (endX === undefined || endY === undefined) return;

    const deltaX = Math.abs(endX - context.initialClick.x);
    const deltaY = Math.abs(endY - context.initialClick.y);
    const clickThreshold = 5;

    context.isDragging = false;

    if (deltaX < clickThreshold && deltaY < clickThreshold) {
        handleClick(event, context);
    } else {
        context.isMoving = true;
        startMomentumMotion(context);
    }
}
