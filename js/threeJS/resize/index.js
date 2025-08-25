import * as THREE from 'three';
import gsap from "gsap";
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function onWindowResize(context) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const aspect = w / h;

    const BREAKPOINT = 1000;
    const MIN_WIDTH = 380;

    const MIN_SCALE = 2.0;
    const MAX_SCALE = 3.5;
    const t = Math.min(1, Math.max(0, (w - MIN_WIDTH) / (2000 - MIN_WIDTH)));
    const pow = 5.5;
    const eased = smootherstep(Math.pow(t, pow));
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
    const viewHeight = viewWidth / aspect;

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


    if (isSmall()) {
        context.followMouse = false;
        if (!context.bounceTween) {
            gsap.set(context.targetPosition, { x: 0, y: 0 });
            startBounce(context, 'y');
        }
    } else {
        context.followMouse = true;
        stopBounce(context);
        gsap.set(context.targetPosition, { x: 0, y: 0 });
    }

    context.movementSensitivity = window.innerWidth <= 1024 ? 50 : 180;

    // Update mesh positions
    const projectsEl = document.querySelector('.projects');
    context.meshes.forEach(m => context.setMeshPosition(m, projectsEl));

    ScrollTrigger.refresh();
}

export const isSmall = () => window.innerWidth <= 1000;

function stopBounce(ctx) {
    if (ctx.bounceTween) ctx.bounceTween.kill();
    ctx.bounceTween = null;
    ctx.bounceDirection = null;
}

export function startBounce(ctx, axis = 'y', amp = 2, duration = 5) {
    stopBounce(ctx);
    ctx.bounceTween = gsap.timeline({ repeat: -1, yoyo: true })
        .to(ctx.targetPosition, { [axis]: amp, duration, ease: "power2.inOut" })
        .to(ctx.targetPosition, { [axis]: -amp, duration, ease: "power2.inOut" });
    ctx.bounceDirection = axis;
}
function smootherstep(x) {
    return x * x * x * (x * (x * 6 - 15) + 10);
}
