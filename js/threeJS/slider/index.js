import { handleClick } from './handleClick/index.js';

function getClientPosition(e) {
    const touch = e.touches?.[0] || e.changedTouches?.[0];
    return {
        x: e.clientX ?? touch?.clientX ?? 0,
        y: e.clientY ?? touch?.clientY ?? 0,
    };
}

export function onPointerMove(event, context) {
    if (!context.isDragging) return;

    const { x } = getClientPosition(event);
    const delta = x - context.startX;

    const containerWidth = context.container?.clientWidth || window.innerWidth;
    const widthFactor = Math.min(1920 / containerWidth, 4);
    const normalizedDelta = delta * widthFactor;

    context.targetPosition += normalizedDelta / context.movementSensitivity;


    const now = performance.now();
    const deltaTime = (now - context.lastTime) / 1000;
    context.lastTime = now;

    if (deltaTime > 0) {
        const rawVelocity = normalizedDelta / context.movementSensitivity / deltaTime;
        context.velocity = context.velocity * 0.5 + rawVelocity * 0.5;
        const maxVel = 50 * widthFactor;
        context.velocity = Math.max(-maxVel, Math.min(maxVel, context.velocity));
    }

    const smooth = context.smoothingFactor;
    const dx = (x - context.lastX) * widthFactor;
    context.dragSpeed += (dx - context.dragSpeed) * smooth;
    context.dragDelta += (Math.abs(normalizedDelta) - context.dragDelta) * smooth;

    context.startX = x;
    context.lastX = x;
}

export function onPointerDown(event, context) {
    const { x, y } = getClientPosition(event);
    const rect = context.projectsElement?.getBoundingClientRect();
    if (!rect) return;

    const inside =
        x >= rect.left && x <= rect.right &&
        y >= rect.top && y <= rect.bottom;

    if (!inside) return;

    context.isDragging = true;
    context.startX = x;
    context.lastX = x;
    context.velocity = 0;
    context.lastTime = performance.now();
    context.desiredOffset = 0;
    context.initialClick = { x, y };
}

export function onPointerUp(event, context) {
    const { x, y } = getClientPosition(event);

    context.isDragging = false;
    context.smoothingFactor = context.smoothingFactorDefault;

    const clickThreshold = 5;
    const initial = context.initialClick;
    if (!initial) return;

    const deltaX = Math.abs(x - initial.x);
    const deltaY = Math.abs(y - initial.y);

    if (deltaX < clickThreshold && deltaY < clickThreshold) {
        handleClick(event, context);
    } else if (Math.abs(context.velocity) > 0.01) {
        context.isMoving = true;
    }
}