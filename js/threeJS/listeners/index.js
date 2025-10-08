import * as THREE from 'three';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { onPointerDown, onPointerMove, onPointerUp } from '../slider/index.js';
import { onMouseMoveHover } from '../slider/mouseHover/index.js';
import showAbout from '../../components/about/index.js';
import closeInfoDiv from '../../components/close/index.js';
import { onWindowResize } from '../index.js';

gsap.registerPlugin(ScrollTrigger);

export default function setupEventListeners(context) {
    window.addEventListener('resize', () => onWindowResize(context));
    window.addEventListener('mousemove', (event) => onMouseMoveHover(event, context));

    window.addEventListener('pointerdown', (e) => onPointerDown(e, context), { passive: false });
    window.addEventListener('pointermove', (e) => onPointerMove(e, context), { passive: false });
    window.addEventListener('pointerup', (e) => onPointerUp(e, context), { passive: false });

    window.addEventListener('touchstart', (e) => onPointerDown(e, context), { passive: false });
    window.addEventListener('touchmove', (e) => onPointerMove(e, context), { passive: false });
    window.addEventListener('touchend', (e) => onPointerUp(e, context), { passive: false });

    document.getElementById('openAbout').addEventListener('click', () => showAbout(context));
    document.getElementById('close').addEventListener('click', () => closeInfoDiv(context));

    window.addEventListener('load', () => {
        ScrollTrigger.refresh();
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