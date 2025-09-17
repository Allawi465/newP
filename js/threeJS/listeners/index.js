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

    // Prevent scroll save on unload (Safari-friendly)
    window.onbeforeunload = function () {
        window.scrollTo(0, 0);
    };

    // Handle bfcache restores (common Safari/iOS reload quirk)
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            window.scrollTo(0, 0);
        }
    });

    window.addEventListener('load', () => {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }

        // Baseline native scroll
        window.scrollTo(0, 0);

        const navTag = document.getElementById('nav_tag');
        if (navTag) {
            // Fallback for Safari options support
            if (navTag.scrollIntoView.toString().includes('Options')) {  // Better detection
                navTag.scrollIntoView({ behavior: 'instant', block: 'start' });
            } else {
                navTag.scrollIntoView(true);
            }
        }

        // Lenis: Queue immediate scroll after DOM (iOS timing fix)
        if (context.bodyLenis) {
            // Option 1: Direct with micro-delay
            setTimeout(() => {
                context.bodyLenis.scrollTo(navTag ? '#nav_tag' : 0, { immediate: true });
            }, 0);

            // Option 2: Wait for first Lenis scroll event (fixes hop/jump on iOS load)
            const once = () => {
                context.bodyLenis.scrollTo(navTag ? '#nav_tag' : 0, { immediate: true });
                context.bodyLenis.off('scroll', once);
            };
            context.bodyLenis.on('scroll', once);
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