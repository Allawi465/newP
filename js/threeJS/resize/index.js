import * as THREE from 'three';
import gsap from "gsap";

export default function onWindowResize(context) {
    const w = document.documentElement.clientWidth || window.innerWidth;
    const h = document.documentElement.clientHeight || window.innerHeight;
    const aspect = w / h;
    const BREAKPOINT = 1000;
    const MIN_WIDTH = 300;
    const MIN_HEIGHT = 1000;
    const CLAMP_HEIGHT = 300;
    const MIN_SCALE = 2.5;
    const MAX_SCALE = 3.8;

    const tWidth = Math.min(1, Math.max(0, (w - MIN_WIDTH) / (2000 - MIN_WIDTH)));

    const tHeight = Math.min(1, Math.max(0, (h - CLAMP_HEIGHT) / (MIN_HEIGHT - CLAMP_HEIGHT)));

    const t = Math.min(tWidth, tHeight);

    const pow = 2.5;
    const eased = context.smootherstep(Math.pow(t, pow));

    let effectiveMin = MIN_SCALE;
    if (w > h && h < MIN_HEIGHT) {
        const lowerBound = 1.3;
        effectiveMin = lowerBound + (MIN_SCALE - lowerBound) * (h / MIN_HEIGHT);
    }

    const scale = effectiveMin + (MAX_SCALE - effectiveMin) * eased;

    if (context.fboMaterial?.uniforms?.uLetterScale) {
        context.fboMaterial.uniforms.uLetterScale.value = scale;
    }

    let viewWidth;

    if (w > BREAKPOINT) {
        viewWidth = 4.5 * (w / BREAKPOINT);
    } else if (w <= MIN_WIDTH) {
        viewWidth = context.VIEW_WIDTH * (w / MIN_WIDTH);
    } else {
        viewWidth = context.VIEW_WIDTH;
    }

    const viewHeight = viewWidth / aspect;
    const objectScale = typeof factor !== 'undefined' ? factor : 1;

    if (context.points) {
        const base = context.points.userData?.baseScale ?? new THREE.Vector3(1, 1, 1);
        context.points.scale.set(base.x * objectScale, base.y * objectScale, base.z * objectScale);
    }

    if (context.glassBall) {
        const base = context.glassBall.userData?.baseScale ?? new THREE.Vector3(1, 1, 1);
        context.glassBall.scale.set(base.x * objectScale, base.y * objectScale, base.z * objectScale);
        if (context.cubeCamera) {
            context.cubeCamera.position.copy(context.glassBall.position);
        }
    }

    context.renderer.setSize(w, h);
    context.labelRenderer.setSize(w, h);
    context.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    context.camera.left = -viewWidth / 2;
    context.camera.right = viewWidth / 2;
    context.camera.top = viewHeight / 2;
    context.camera.bottom = -viewHeight / 2;
    context.camera.updateProjectionMatrix();

    const planeHeight = context.camera.top - context.camera.bottom;
    const planeWidth = context.camera.right - context.camera.left;
    const transitionSegments = Math.max(1, Math.floor(context.transitionPlaneSegments || 12));
    context.largePlane.geometry.dispose();
    context.largePlane.geometry = new THREE.PlaneGeometry(
        planeWidth,
        planeHeight,
        transitionSegments,
        transitionSegments
    );

    context.smoothingFactor = w <= 1024 ? 0.2 : 0.03;
    context.lerpFactor = w <= 1024 ? 0.25 : 0.12;
    context.friction = w <= 1024 ? 0.95 : 0.96;
    context.lastTime = performance.now();

    context.updatePositions();

    if (context.isSmall()) {
        context.followMouse = false;
        if (!context.bounceTween) {
            gsap.set(context.targetPositionSphre, { x: 0, y: 0 });
            context.startBounce(context, 'y');
        }
    } else {
        context.followMouse = true;
        context.stopBounce(context);
        gsap.set(context.targetPositionSphre, { x: 0, y: 0 });
    }
}

