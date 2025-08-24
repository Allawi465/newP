import * as THREE from 'three';
import gsap from "gsap";

export default function onWindowResize(context) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const aspect = w / h;

    const BREAKPOINT = 1000;
    const MIN_WIDTH = 380;

    // 1) Eased letter scale (smoothstep)
    const MIN_SCALE = 2.0;
    const MAX_SCALE = 3.5;
    const t = Math.min(1, Math.max(0, (w - MIN_WIDTH) / (2000 - MIN_WIDTH)));
    const pow = 5.5;
    const eased = smootherstep(Math.pow(t, pow));
    const scale = MIN_SCALE + (MAX_SCALE - MIN_SCALE) * eased;

    if (context.fboMaterial?.uniforms?.uLetterScale) {
        context.fboMaterial.uniforms.uLetterScale.value = scale;
    }

    // 2) Camera view width/height AFTER scale
    let viewWidth;
    if (w > BREAKPOINT) {
        viewWidth = 4.5 * (w / BREAKPOINT);
    } else if (w <= MIN_WIDTH) {
        viewWidth = context.VIEW_WIDTH * (w / MIN_WIDTH);
    } else {
        viewWidth = context.VIEW_WIDTH;
    }
    const viewHeight = viewWidth / aspect;

    // 3) Renderer + camera updates
    context.renderer.setSize(w, h);
    context.labelRenderer.setSize(w, h);
    context.renderer.setPixelRatio(window.devicePixelRatio);

    context.camera.left = -viewWidth / 2;
    context.camera.right = viewWidth / 2;
    context.camera.top = viewHeight / 2;
    context.camera.bottom = -viewHeight / 2;
    context.camera.updateProjectionMatrix();

    if (context.material && context.material.uniforms) {
        context.material.uniforms.iResolution.value.set(w, h);
        context.material.uniforms.uPixelRatio = { value: Math.min(window.devicePixelRatio, 2) };
    }

    if (context.fboMaterial && context.fboMaterial.uniforms) {
        context.fboMaterial.uniforms.resolution.value.set(w, h);
    }

    // Update large plane geometry
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
            context.followMouse = true;
        }
    }

    if (w <= 640) {
        context.movementSensitivity = 100;
    } else {
        context.movementSensitivity = 150;
    }

    // Update mesh positions
    const projectsEl = document.querySelector('.projects');
    context.meshes.forEach(m => context.setMeshPosition(m, projectsEl));
}

export function triggerBounce(context) {
    if (context.bounceTween) context.bounceTween.kill();

    const tl = gsap.timeline({ repeat: -1, yoyo: true });

    tl.to(context.targetPosition, {
        y: 2,
        duration: 5,
        ease: "power2.inOut",
    });

    tl.to(context.targetPosition, {
        y: -2,
        duration: 5,
        ease: "power2.inOut",
    });

    context.bounceTween = tl;
    context.bounceDirection = 'y';
}

function smootherstep(x) {
    return x * x * x * (x * (x * 6 - 15) + 10);
}
