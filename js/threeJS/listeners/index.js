import * as THREE from 'three';
import { onPointerDown, onPointerMove, onPointerUp } from '../slider/index.js';
import { onMouseMoveHover } from '../slider/mouseHover/index.js';
import showAbout from '../../components/about/index.js';
import closeInfoDiv from '../../components/close/index.js';
import { onWindowResize } from '../index.js';

export default function setupEventListeners(context) {
    window.addEventListener('resize', () => onWindowResize(context));

    window.addEventListener('scroll', () => {
        const scrollNorm = window.scrollY / (document.body.scrollHeight - window.innerHeight);
        const minY = 0;
        const maxY = 18;
        context.targetY = minY + (maxY - minY) * scrollNorm;
    });

    window.addEventListener('pointerdown', (event) => onPointerDown(event, context), { passive: false });
    window.addEventListener('pointermove', (event) => onPointerMove(event, context), { passive: false });
    window.addEventListener('pointerup', (event) => onPointerUp(event, context), { passive: false });
    window.addEventListener('touchstart', (event) => onPointerDown(event, context), { passive: false });
    window.addEventListener('touchmove', (event) => onPointerMove(event, context), { passive: false });
    window.addEventListener('touchend', (event) => onPointerUp(event, context), { passive: false });

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