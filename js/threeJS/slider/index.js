import gsap from 'gsap';
import { handleClick } from './handleClick/index.js';

export function onPointerMove(event, context) {
    if (!context.isDragging) return;

    const clientX = event.clientX !== undefined
        ? event.clientX
        : (event.changedTouches && event.changedTouches[0]
            ? event.changedTouches[0].clientX
            : (event.touches && event.touches[0]
                ? event.touches[0].clientX
                : undefined));

    const clientY = event.clientY !== undefined
        ? event.clientY
        : (event.changedTouches && event.changedTouches[0]
            ? event.changedTouches[0].clientY
            : (event.touches && event.touches[0]
                ? event.touches[0].clientY
                : undefined));

    if (clientX === undefined || clientY === undefined) return;

    const delta = clientX - context.startX;

    // Normalization for screen size
    const containerWidth = context.container ? context.container.clientWidth : window.innerWidth;
    const referenceWidth = 1920;
    const widthFactor = Math.min(referenceWidth / containerWidth, 4);
    const normalizedDelta = delta * widthFactor;

    context.targetPosition += normalizedDelta / context.movementSensitivity;

    const now = performance.now();
    const deltaTime = (now - context.lastTime) / 1000;
    context.lastTime = now;

    if (deltaTime > 0) {
        const rawVelocity = normalizedDelta / context.movementSensitivity / deltaTime;
        context.velocity = context.velocity * 0.5 + rawVelocity * 0.5;
        context.velocity = Math.max(Math.min(context.velocity, 50 * widthFactor), -50 * widthFactor);
    }

    context.dragDelta = context.dragDelta * (1 - context.smoothingFactor) + Math.abs(normalizedDelta) * context.smoothingFactor;
    context.dragSpeed = context.dragSpeed * (1 - context.smoothingFactor) + (clientX - context.lastX) * widthFactor * context.smoothingFactor;
    context.dragSpeed = Math.max(Math.min(context.dragSpeed, 25 * widthFactor), -25 * widthFactor);

    const baseStrength = Math.min(Math.abs(context.velocity) / (70.0 / widthFactor), 1.0);
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
    const isTouch = event.type.startsWith("touch");
    const clientX = isTouch ? event.touches[0].clientX : event.clientX;
    const clientY = isTouch ? event.touches[0].clientY : event.clientY;

    const section = context.projectsElement;
    if (!section) return;

    const rect = section.getBoundingClientRect();

    const inside =
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom;

    if (!inside) {

        context.isDragging = false;
        return;
    }

    context.isDragging = true;
    context.startX = clientX;
    context.startY = clientY;
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
        : (event.changedTouches && event.changedTouches[0]
            ? event.changedTouches[0].clientX
            : (event.touches && event.touches[0]
                ? event.touches[0].clientX
                : undefined));

    const endY = event.clientY !== undefined
        ? event.clientY
        : (event.changedTouches && event.changedTouches[0]
            ? event.changedTouches[0].clientY
            : (event.touches && event.touches[0]
                ? event.touches[0].clientY
                : undefined));

    if (endX === undefined || endY === undefined) return;

    if (!context.initialClick) {
        context.isDragging = false;
        context.smoothingFactor = context.smoothingFactorDefault;
        return;
    }

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