import * as THREE from 'three';
import { onPointerDown, onPointerMove, onPointerUp } from '../slider/index.js';
import { onMouseMoveHover } from '../slider/mouseHover/index.js';
import showAbout from '../../components/about/index.js';
import closeInfoDiv from '../../components/close/index.js';
import { onWindowResize } from '../index.js';

export default function setupEventListeners(context) {
    window.addEventListener('resize', () => onWindowResize(context));
    window.addEventListener('mousemove', (event) => onMouseMoveHover(event, context));
    const sliderEl = document.getElementById('sliderContainer');


    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    if (isMobile) {
        // Allow native scroll + pointer drag
        sliderEl.addEventListener('touchstart', (e) => onPointerDown(e, context), { passive: true });
        sliderEl.addEventListener('touchmove', (e) => onPointerMove(e, context), { passive: true });
        sliderEl.addEventListener('touchend', (e) => onPointerUp(e, context), { passive: true });
    } else {
        sliderEl.addEventListener('pointerdown', (e) => onPointerDown(e, context));
        sliderEl.addEventListener('pointermove', (e) => {
            if (!context.isDragging) return;
            onPointerMove(e, context);
            e.preventDefault();
        }, { passive: false });
        sliderEl.addEventListener('pointerup', (e) => onPointerUp(e, context));
    }

    window.addEventListener('pointermove', (event) => {
        if (!context.followMouse) return;

        context.pointerPrev.copy(context.pointer);
        context.pointer.set(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );

        let targetPos = new THREE.Vector3(context.pointer.x, context.pointer.y, 0);
        targetPos.unproject(context.camera);
        targetPos.z = context.glassBall.position.z;

        context.targetPositionSphre.lerp(targetPos, 0.2);
    }, { passive: false });

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            context.clock.start();
        }
    });
}