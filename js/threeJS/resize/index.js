import * as THREE from 'three';
import gsap from "gsap";

export default function onWindowResize(context) {
    const w = document.documentElement.clientWidth || window.innerWidth;
    const h = (window.visualViewport ? window.visualViewport.height : window.innerHeight);
    context.width = w;
    context.height = h;

    const aspect = w / h;
    const BREAKPOINT = 1050;
    const mPixel = 300;
    const MIN_SCALE = 2.5;

    const tWidth = THREE.MathUtils.clamp((w - mPixel) / (2000 - mPixel), 0, 1);
    const tHeight = THREE.MathUtils.clamp((h - mPixel) / (BREAKPOINT - mPixel), 0, 1);
    const t = Math.min(tWidth, tHeight);

    const eased = context.smootherstep(Math.pow(t, MIN_SCALE));

    let effectiveMin = MIN_SCALE;
    if (w > h && h < BREAKPOINT) {
        const lowerBound = 1.3;
        effectiveMin = lowerBound + (MIN_SCALE - lowerBound) * (h / BREAKPOINT);
    }

    const scale = effectiveMin + (3.8 - effectiveMin) * eased;

    if (context.fboMaterial?.uniforms?.uLetterScale) {
        context.fboMaterial.uniforms.uLetterScale.value = scale;
    }

    if (context.points) {
        const base = context.points.userData?.baseScale ?? new THREE.Vector3(1, 1, 1);
        context.points.scale.set(base.x * 1, base.y * 1, base.z * 1);
    }

    if (context.glassBall) {
        const base = context.glassBall.userData?.baseScale ?? new THREE.Vector3(1, 1, 1);
        context.glassBall.scale.set(base.x * 1, base.y * 1, base.z * 1);
        if (context.cubeCamera) {
            context.cubeCamera.position.copy(context.glassBall.position);
        }
    }

    let viewWidth;
    if (w > BREAKPOINT) {
        viewWidth = 4.5 * (w / BREAKPOINT);
    } else if (w <= mPixel) {
        viewWidth = context.VIEW_WIDTH * (w / mPixel);
    } else {
        viewWidth = context.VIEW_WIDTH;
    }

    const viewHeight = viewWidth / aspect;

    let sliderFactor = 1;
    if (w <= BREAKPOINT && h <= BREAKPOINT) {
        const effective_h = Math.max(h, mPixel);
        let tempFactor = BREAKPOINT / effective_h;
        tempFactor = Math.min(tempFactor, 2.0);
        if (w <= 650) tempFactor = 1.;
        sliderFactor = 1 / tempFactor;
    }

    context.sliderFactor = sliderFactor;

    if (context.meshArray?.length) {
        const newSpacing = context.baseMeshSpacing * sliderFactor;

        context.meshArray.forEach(mesh => {
            const base = mesh.userData.baseScale ?? new THREE.Vector3(1, 1, 1);
            if (!mesh.userData.baseScale) mesh.userData.baseScale = base;
            mesh.scale.set(base.x * sliderFactor, base.y * sliderFactor, base.z * sliderFactor);
        });

        context.meshSpacing = newSpacing;
    }

    const pixelRatio = Math.min(window.devicePixelRatio, 2);

    context.renderer.setPixelRatio(pixelRatio);
    context.renderer.setSize(w, h);

    context.labelRenderer.setSize(w, h);

    if (context.composer) {
        context.composer.setSize(w, h);
    }

    context.camera.left = -viewWidth / 2;
    context.camera.right = viewWidth / 2;
    context.camera.top = viewHeight / 2;
    context.camera.bottom = -viewHeight / 2;
    context.camera.updateProjectionMatrix();

    if (context.largePlane) {
        context.largePlane.scale.set(viewWidth, viewHeight, 1);
    }

    const isMobile = w <= 1024;
    context.smoothingFactor = isMobile ? 0.1 : 0.03;
    context.lerpFactor = isMobile ? 0.2 : 0.1;
    context.friction = isMobile ? 0.95 : 0.97;
    context.lastTime = performance.now();

    context.updatePositions?.();
    context.syncHtmlWithSlider?.();

    context.splits?.heroText?.revert?.();
    context.splits?.aboutText?.revert?.();

    if (context.material && context.fboMaterial) {
        context.resetParticles?.();
    }

    if (context.fxaaPass) {
        const pr = Math.min(window.devicePixelRatio, 2);
        context.fxaaPass.material.uniforms["resolution"].value.set(
            1 / (w * pr),
            1 / (h * pr)
        );
    }

    if (context.material?.uniforms?.uResolution) {
        context.material.uniforms.uResolution.value.set(w, h);
    }

    if (context.fboMaterial?.uniforms?.resolution) {
        context.fboMaterial.uniforms.resolution.value.set(w, h);
    }

    const prefersTouch = context.isTouchDevice() || (w < 1024);
    context.currentInputMode = prefersTouch ? 'touch' : 'mouse';

    if (prefersTouch) {
        context.followMouse = false;
        gsap.set(context.targetPositionSphre, { x: 0, y: 0 });
        context.stopBounce(context);
        context.startBounce(context, 'y');
    } else {
        context.followMouse = true;
        gsap.set(context.targetPositionSphre, { x: 0, y: 0 });
        context.stopBounce(context);
    }
}