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

    // ✅ Touch drag (mobile)
    sliderEl.addEventListener('touchmove', (e) => {
        if (!context.isDragging) return;

        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - context.startX);
        const deltaY = Math.abs(touch.clientY - context.startY);

        // Only block scroll if horizontal drag is clearly stronger
        if (deltaX > deltaY * 1.3) {
            e.preventDefault();
            onPointerMove(e, context);
        }
    }, { passive: false });

    // ✅ Pointer drag (desktop / mouse)
    sliderEl.addEventListener('pointermove', (e) => {
        if (!context.isDragging) return;
        onPointerMove(e, context);
    }, { passive: true });

    // ✅ Down / up events (works for both touch & pointer)
    sliderEl.addEventListener('pointerdown', (e) => onPointerDown(e, context));
    sliderEl.addEventListener('pointerup', (e) => onPointerUp(e, context));

    sliderEl.addEventListener('touchstart', (e) => onPointerDown(e, context));
    sliderEl.addEventListener('touchend', (e) => onPointerUp(e, context));

    // ✅ “About” and “Close” buttons
    document.getElementById('openAbout').addEventListener('click', () => showAbout(context));
    document.getElementById('close').addEventListener('click', () => closeInfoDiv(context));

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
    }, { passive: true }); // ✅ no need to block scroll here

    // ✅ Handle tab visibility
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            context.clock.start();
        }
    });
}