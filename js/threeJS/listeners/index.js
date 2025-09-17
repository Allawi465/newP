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

    window.onbeforeunload = function () {
        window.scrollTo(0, 0);
    };

    window.addEventListener('load', () => {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }

        // Immediate scroll to top as baseline
        window.scrollTo(0, 0);

        const navTag = document.getElementById('nav_tag');
        if (navTag) {
            // Safari-friendly: Use boolean for top alignment (true = alignToTop)
            // Only use options if supported (fallback test)
            if ('scrollBehavior' in document.documentElement.style) {  // Proxy for options support
                navTag.scrollIntoView({ behavior: 'instant', block: 'start' });
            } else {
                navTag.scrollIntoView(true);
            }
        }

        if (context.bodyLenis) {
            // Target the nav ID for consistency (Lenis supports selectors)
            context.bodyLenis.scrollTo('#nav_tag', { immediate: true });
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