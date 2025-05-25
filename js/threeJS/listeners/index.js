import * as THREE from 'three';
import { onPointerDown, onPointerMove, onPointerUp } from '../slider/index.js';
import { onMouseMoveHover } from '../slider/mouseHover/index.js';
import setupScrollAnimation from '../scrollstrigger/index.js';
import showAbout from '../../components/about/index.js';
import closeInfoDiv from '../../components/close/index.js';
import { onWindowResize } from '../index.js';


export default function setupEventListeners(context) {
    window.addEventListener('resize', () => onWindowResize(context));
    window.addEventListener('mousemove', (event) => onMouseMoveHover(event, context));
    window.addEventListener('pointerdown', (event) => onPointerDown(event, context), { passive: false });
    window.addEventListener('pointermove', (event) => onPointerMove(event, context), { passive: false });
    window.addEventListener('pointerup', (event) => onPointerUp(event, context), { passive: false });
    window.addEventListener('touchstart', (event) => onPointerDown(event, context), { passive: false });
    window.addEventListener('touchmove', (event) => onPointerMove(event, context), { passive: false });
    window.addEventListener('touchend', (event) => onPointerUp(event, context), { passive: false });

    document.getElementById('openAbout').addEventListener('click', () => showAbout(context));
    document.getElementById('close').addEventListener('click', () => closeInfoDiv(context));

    window.addEventListener('load', () => {
        setTimeout(() => {
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;

            if (context.bodyLenis) {
                context.bodyLenis.scrollTo(0, { immediate: true });
                context.bodyLenis.start();
            }

            setupScrollAnimation();
        }, 100);
    });

    window.addEventListener('pointermove', (event) => {
        context.pointerPrev.copy(context.pointer);

        const currentX = (event.clientX / window.innerWidth) * 2 - 1;
        const currentY = -(event.clientY / window.innerHeight) * 2 + 1;

        context.pointer.x = currentX;
        context.pointer.y = currentY;

        let targetPos = new THREE.Vector3(context.pointer.x, context.pointer.y, 0);
        targetPos.unproject(context.camera);
        targetPos.z = context.glassBall.position.z;
        context.targetPosition.lerp(targetPos, 0.2);
    });
}