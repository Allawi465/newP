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

    // Add this to prevent scroll position from being saved on unload/reload
    window.onbeforeunload = function () {
        window.scrollTo(0, 0);
    };

    // Your existing load listener, with fallback for unsupported browsers
    window.addEventListener('load', () => {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }

        // Immediate scroll to top
        window.scrollTo(0, 0);

        if (context.bodyLenis) {
            // Try scrolling via Lenis with a short delay for iOS/Safari quirks
            setTimeout(() => {
                context.bodyLenis.scrollTo(0, { immediate: true });
            }, 0);  // Use 0ms to queue after current execution
        }

        setupScrollAnimation();
    });

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