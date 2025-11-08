import * as THREE from 'three';
import { onPointerDown, onPointerMove, onPointerUp } from '../slider/index.js';
import { onMouseMoveHover } from '../slider/mouseHover/index.js';
import showAbout from '../../components/about/index.js';
import closeInfoDiv from '../../components/close/index.js';
import { onWindowResize } from '../index.js';

export default function setupEventListeners(context) {
    window.addEventListener('resize', () => onWindowResize(context));
    document.getElementById('openAbout').addEventListener('click', () => showAbout(context));
    document.getElementById('close').addEventListener('click', () => closeInfoDiv(context));
    document.addEventListener('pointerdown', (e) => onPointerDown(e, context), { passive: true });
    document.addEventListener('pointerup', (e) => onPointerUp(e, context), { passive: true });
    document.addEventListener('pointermove', (e) => {
        if (!context.isDragging) return;
        onPointerMove(e, context);
    }, { passive: false });

    document.addEventListener('touchstart', (e) => onPointerDown(e, context), { passive: true });
    document.addEventListener('touchend', (e) => onPointerUp(e, context), { passive: true });
    document.addEventListener('touchmove', (e) => {
        if (!context.isDragging) return;
        onPointerMove(e, context);
    }, { passive: false });

    document.addEventListener('mousemove', (event) => onMouseMoveHover(event, context));

    window.addEventListener('pointermove', (event) => {
        if (!context.followMouse) return;

        context.pointerPrev.copy(context.pointer);

        const x = (event.clientX / window.innerWidth) * 2 - 1;
        const y = -(event.clientY / window.innerHeight) * 2 + 1;

        context.pointer.set(x, y);

        const targetPos = new THREE.Vector3(x, y, 0)
            .unproject(context.camera);
        targetPos.z = context.glassBall.position.z;

        context.targetPositionSphre.lerp(targetPos, 0.2);
    }, { passive: false });
}