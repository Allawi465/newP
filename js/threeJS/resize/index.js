import * as THREE from 'three';

export default function onWindowResize(context) {
    const w = document.documentElement.clientWidth || window.innerWidth;
    const h = document.documentElement.clientHeight || window.innerHeight;
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

    if (context.largePlane) {
        context.largePlane.geometry.dispose();
        context.largePlane.geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, 24, 24);
    }

    const isMobile = w <= 1024;
    context.smoothingFactor = isMobile ? 0.1 : 0.03;
    context.lerpFactor = isMobile ? 0.2 : 0.1;
    context.friction = isMobile ? 0.95 : 0.97;
    context.lastTime = performance.now();

    context.updatePositions?.();
    context.syncHtmlWithSlider?.();

    context.isTouchDevice()
        ? context.enableTouchMode(context)
        : context.enableMouseMode(context);

    context.splits?.heroText?.revert?.();
    context.splits?.aboutText?.revert?.();
}