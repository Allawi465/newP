import * as THREE from 'three';
import gsap from "gsap";

export default function onWindowResize(context) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const aspect = w / h;
    const BREAKPOINT = 1000;
    const MIN_WIDTH = 420;

    let viewWidth;
    if (w > BREAKPOINT) {
        viewWidth = 4.5 * (w / BREAKPOINT);
    } else if (w <= MIN_WIDTH) {
        viewWidth = context.VIEW_WIDTH * (w / MIN_WIDTH);
    } else {
        viewWidth = context.VIEW_WIDTH;
    }

    const viewHeight = viewWidth / aspect;

    context.renderer.setSize(w, h);
    context.labelRenderer.setSize(w, h);
    context.renderer.setPixelRatio(window.devicePixelRatio);

    context.camera.left = -viewWidth / 2;
    context.camera.right = viewWidth / 2;
    context.camera.top = viewHeight / 2;
    context.camera.bottom = -viewHeight / 2;
    context.camera.updateProjectionMatrix();

    const planeHeight = context.camera.top - context.camera.bottom;
    const planeWidth = context.camera.right - context.camera.left;
    context.largePlane.geometry.dispose();
    context.largePlane.geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, 24, 24);

    if (w <= 1000) {
        gsap.to(context.targetPosition, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            onComplete: () => {
                if (context.bounceTween) context.bounceTween.kill();
                triggerBounce(context);
            }
        });
    } else {
        if (context.bounceTween) {
            context.bounceTween.kill();
            context.bounceTween = null;
        }
    }

    if (w <= 640) {
        context.movementSensitivity = 100;
    } else {
        context.movementSensitivity = 150;
    }

    const projectsEl = document.querySelector('.projects');
    context.meshes.forEach(m => context.setMeshPosition(m, projectsEl));
}

function triggerBounce(context) {
    context.bounceTween = gsap.to(context.targetPosition, {
        y: "+=2.",
        duration: 1.5,
        ease: "sine.inOut",
        delay: 2,
        repeat: -1,
        yoyo: true,
        repeatDelay: 2
    });
}