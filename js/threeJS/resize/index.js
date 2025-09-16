import * as THREE from 'three';
import gsap from "gsap";
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function onWindowResize(context) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const aspect = w / h;

    const BREAKPOINT = 1000;
    const MIN_WIDTH = 300;
    const MIN_HEIGHT = 1000;
    const CLAMP_HEIGHT = 300;

    const MIN_SCALE = 2.1;
    const MAX_SCALE = 3.5;
    const t = Math.min(1, Math.max(0, (w - MIN_WIDTH) / (2000 - MIN_WIDTH)));
    const pow = 2.5;
    const eased = context.smootherstep(Math.pow(t, pow));
    const scale = MIN_SCALE + (MAX_SCALE - MIN_SCALE) * eased;

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

    let factor = 1;
    if (h <= MIN_HEIGHT) {
        let effective_h = Math.max(h, CLAMP_HEIGHT);
        factor = MIN_HEIGHT / effective_h;
        factor = Math.min(factor, 2.);
        if (w <= 500) {
            factor = 1.1;
        }
        viewWidth *= factor;
    }

    if (context.fboMaterial?.uniforms?.uLetterScale) {
        context.fboMaterial.uniforms.uLetterScale.value = scale * factor;
    }

    if (context.glassBall?.uniforms && factor > 1) {
        context.glassBall.scale.set(factor, factor, factor);
    }

    if (context.points?.uniforms && factor > 1) {
        context.points.scale.set(factor, factor, factor);
    }

    const viewHeight = viewWidth / aspect;
    const referenceViewWidth = 8.5;
    const distanceScale = referenceViewWidth / viewWidth;

    if (context.meshArray) {
        context.meshArray.forEach(mesh => {
            const currentScale = mesh.material.uniforms.uDistanceScale.value;
            if (Math.abs(distanceScale - currentScale) > 0.001) {
                gsap.to(mesh.material.uniforms.uDistanceScale, {
                    value: distanceScale,
                    duration: 0.2,
                    ease: "power2.inOut",
                    onUpdate: () => {
                        mesh.material.uniforms.uDistanceScale.needsUpdate = true;
                    }
                });
            } else {
                mesh.material.uniforms.uDistanceScale.value = distanceScale;
                mesh.material.uniforms.uDistanceScale.needsUpdate = true;
            }
        });
    }

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

    context.movementSensitivity = window.innerWidth <= 1024 ? 100 : 150;
    context.smoothingFactor = window.innerWidth <= 1024 ? 0.2 : 0.03;
    context.lerpFactor = window.innerWidth <= 1024 ? 0.2 : 0.1;
    context.friction = 0.95;
    context.lastTime = performance.now();

    const projectsEl = document.querySelector('.projects');
    context.meshes.forEach(m => context.setMeshPosition(m, projectsEl));

    ScrollTrigger.refresh();
}