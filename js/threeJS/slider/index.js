import gsap from 'gsap';
import { handleClick } from './handleClick/index.js';

export function onPointerMove(event, context) {
    if (!context.isDragging) return;

    const clientX = event.clientX !== undefined ? event.clientX : (event.touches && event.touches[0].clientX);
    const clientY = event.clientY !== undefined ? event.clientY : (event.touches && event.touches[0].clientY);
    if (clientX === undefined || clientY === undefined) return;

    if (event.touches) {
        const totalDeltaX = clientX - context.startX;
        const totalDeltaY = clientY - context.startY;
        if (Math.abs(totalDeltaX) > Math.abs(totalDeltaY)) {
            event.preventDefault();
        }
    }

    const delta = clientX - context.startX;

    context.targetPosition += delta / context.movementSensitivity;

    const now = performance.now();
    const deltaTime = (now - context.lastTime) / 1000;
    context.lastTime = now;

    if (deltaTime > 0) {
        const rawVelocity = delta / context.movementSensitivity / deltaTime;
        context.velocity = context.velocity * 0.5 + rawVelocity * 0.5;
        context.velocity = Math.max(Math.min(context.velocity, 50), -50);
    }

    context.dragDelta = context.dragDelta * (1 - context.smoothingFactor) + Math.abs(delta) * context.smoothingFactor;
    context.dragSpeed = context.dragSpeed * (1 - context.smoothingFactor) + (clientX - context.lastX) * context.smoothingFactor;
    context.dragSpeed = Math.max(Math.min(context.dragSpeed, 25), -25);

    const baseStrength = Math.min(Math.abs(context.velocity) / 70.0, 1.0);
    const targetStrength = Math.max(baseStrength, 0.1);

    if (context.meshArray) {
        context.meshArray.forEach(mesh => {
            mesh.material.uniforms.uIsDragging.value += (targetStrength - mesh.material.uniforms.uIsDragging.value) * 0.1;
            mesh.material.uniforms.uIsDragging.needsUpdate = true;
        });
    }

    context.startX = clientX;
    context.lastX = clientX;
}

export function onPointerDown(event, context) {
    context.isDragging = true;
    context.startX = event.clientX !== undefined ? event.clientX : (event.touches && event.touches[0].clientX);
    context.startY = event.clientY !== undefined ? event.clientY : (event.touches && event.touches[0].clientY);
    context.dragDelta = 1;
    context.lastX = context.startX;
    context.lastTime = performance.now();
    context.isMoving = false;
    context.desiredOffset = 0;
    context.smoothingFactor = context.smoothingFactorDrag;
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
    context.smoothingFactor = context.smoothingFactorDefault;

    if (deltaX < clickThreshold && deltaY < clickThreshold) {
        handleClick(event, context);
    } else if (Math.abs(context.velocity) > 0.01) {
        context.isMoving = true;
    } else {
        if (context.meshArray) {
            context.meshArray.forEach(mesh => {
                const currentStrength = mesh.material.uniforms.uIsDragging.value;
                if (currentStrength > 0.01) {
                    gsap.to(mesh.material.uniforms.uIsDragging, {
                        value: 0.0,
                        duration: 0.15,
                        ease: "power2.inOut",
                        onUpdate: () => {
                            mesh.material.uniforms.uIsDragging.needsUpdate = true;
                        }
                    });
                }
            });
        }
    }
}