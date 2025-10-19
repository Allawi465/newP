import * as THREE from 'three';
import { onPointerDown, onPointerMove, onPointerUp } from '../slider/index.js';
import { onMouseMoveHover } from '../slider/mouseHover/index.js';
import showAbout from '../../components/about/index.js';
import closeInfoDiv from '../../components/close/index.js';
import { onWindowResize } from '../index.js';

export default function setupEventListeners(context) {
    const sliderEl = document.getElementById('sliderContainer');
    window.addEventListener('resize', () => onWindowResize(context));

    sliderEl.addEventListener('pointerdown', (e) => onPointerDown(e, context), { passive: true });
    sliderEl.addEventListener('pointerup', (e) => onPointerUp(e, context), { passive: true });
    sliderEl.addEventListener('pointermove', (e) => {
        if (!context.isDragging) return;
        onPointerMove(e, context);
    }, { passive: false });

    sliderEl.addEventListener('touchstart', (e) => onPointerDown(e, context), { passive: true });
    sliderEl.addEventListener('touchend', (e) => onPointerUp(e, context), { passive: true });
    sliderEl.addEventListener('touchmove', (e) => {
        if (!context.isDragging) return;
        onPointerMove(e, context);
    }, { passive: false });

    window.addEventListener('pointermove', (event) => {
        if (event.pointerType !== 'mouse') return;
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

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            context.clock.start();
        }
    });
}