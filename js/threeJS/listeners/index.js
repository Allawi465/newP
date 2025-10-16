import * as THREE from 'three';
import { onPointerDown, onPointerMove, onPointerUp } from '../slider/index.js';
import { onMouseMoveHover } from '../slider/mouseHover/index.js';
import showAbout from '../../components/about/index.js';
import closeInfoDiv from '../../components/close/index.js';
import { onWindowResize } from '../index.js';


export default function setupEventListeners(context) {
    // ✅ Basic listeners
    window.addEventListener('resize', () => onWindowResize(context));
    window.addEventListener('mousemove', (event) => onMouseMoveHover(event, context));

    const sliderEl = document.getElementById('sliderContainer');

    // ✅ IMPROVED: Touch drag with direction detection
    // Only prevent default when horizontal drag is detected
    sliderEl.addEventListener('touchmove', (e) => {
        // If user hasn't started dragging yet, check direction intent
        if (!context.isDragging && !context.hasMovedEnough) {
            return; // Let it scroll naturally
        }

        // If we've confirmed horizontal dragging, handle it
        if (context.isDragging) {
            const touch = e.touches[0];
            const deltaX = Math.abs(touch.clientX - context.startX);
            const deltaY = Math.abs(touch.clientY - context.startY);

            // Only block scroll if horizontal drag is clearly stronger
            if (deltaX > deltaY * 1.3) {
                e.preventDefault();
                onPointerMove(e, context);
            }
        }
    }, { passive: false });

    // ✅ Pointer drag (desktop / mouse)
    sliderEl.addEventListener('pointermove', (e) => {
        // Check if user is trying to drag
        if (!context.isDragging && !context.hasMovedEnough) {
            checkMovementThreshold(e, context);
        }

        if (context.isDragging) {
            onPointerMove(e, context);
        }
    }, { passive: true });

    // ✅ FIXED: Only use pointer events (no duplicate touch events)
    sliderEl.addEventListener('pointerdown', (e) => onPointerDown(e, context));
    sliderEl.addEventListener('pointerup', (e) => onPointerUp(e, context));
    sliderEl.addEventListener('pointercancel', (e) => onPointerUp(e, context)); // Handle cancelled touches

    // ✅ "About" and "Close" buttons
    document.getElementById('openAbout')?.addEventListener('click', () => showAbout(context));
    document.getElementById('close')?.addEventListener('click', () => closeInfoDiv(context));

    // ✅ Follow mouse movement (3D hover / sphere)
    window.addEventListener('pointermove', (event) => {
        if (!context.followMouse) return;

        context.pointerPrev.copy(context.pointer);
        context.pointer.set(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );

        const targetPos = new THREE.Vector3(context.pointer.x, context.pointer.y, 0);
        targetPos.unproject(context.camera);
        targetPos.z = context.glassBall.position.z;

        context.targetPositionSphre.lerp(targetPos, 0.2);
    }, { passive: true });

    // ✅ Handle tab visibility
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            context.clock.start();
        }
    });
}

function checkMovementThreshold(event, context) {
    if (!context.initialClick) return;

    const deltaX = Math.abs(event.clientX - context.initialClick.x);
    const deltaY = Math.abs(event.clientY - context.initialClick.y);

    const threshold = 10; // pixels

    if (deltaX > threshold || deltaY > threshold) {
        context.hasMovedEnough = true;

        // Horizontal drag vs vertical scroll
        if (deltaX > deltaY * 1.3) {
            context.isDragging = true;  // Horizontal
        } else {
            context.isDragging = false; // Vertical - allow scroll
        }
    }
}