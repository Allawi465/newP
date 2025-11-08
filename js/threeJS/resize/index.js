import * as THREE from 'three';

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

    const tWidth = THREE.MathUtils.clamp((w - MIN_WIDTH) / (2000 - MIN_WIDTH), 0, 1);
    const tHeight = THREE.MathUtils.clamp((h - CLAMP_HEIGHT) / (MIN_HEIGHT - CLAMP_HEIGHT), 0, 1);
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

    // --- view width logic ---
    let viewWidth;
    if (w > BREAKPOINT) {
        viewWidth = 4.5 * (w / BREAKPOINT);
    } else if (w <= MIN_WIDTH) {
        viewWidth = context.VIEW_WIDTH * (w / MIN_WIDTH);
    } else {
        viewWidth = context.VIEW_WIDTH;
    }

    const viewHeight = viewWidth / aspect;
    const objectScale = 1;

    // --- resize points and glassBall ---
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

    /*    let sliderFactor = 1;
       if (w <= 1050 && h <= 1050) {
           const effective_h = Math.max(h, CLAMP_HEIGHT);
           let tempFactor = 1000 / effective_h;
           tempFactor = Math.min(tempFactor, 2.0);
           if (w <= 500) tempFactor = 1.1;
           sliderFactor = 1 / tempFactor;
       }
   
       context.sliderFactor = sliderFactor;
       if (context.meshArray?.length) {
           context.meshArray.forEach((mesh) => {
               const base = mesh.userData.baseScale ?? new THREE.Vector3(1, 1, 1);
               if (!mesh.userData.baseScale) mesh.userData.baseScale = base;
   
               gsap.to(mesh.scale, {
                   x: base.x * sliderFactor,
                   y: base.y * sliderFactor,
                   z: base.z * sliderFactor,
                   duration: 0.6,
                   ease: "power2.out",
               });
           });
   
           // smooth spacing transition
           const newSpacing = context.baseMeshSpacing * sliderFactor;
           gsap.to(context, {
               meshSpacing: newSpacing,
               duration: 0.6,
               ease: "power2.out",
               onUpdate: () => {
                   context.updatePositions();
                   context.syncHtmlWithSlider();
               },
           });
       } */

    // --- update renderer & camera ---
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

    context.updatePositions();

    if (context.isTouchDevice()) {
        context.enableTouchMode(context);
    } else {
        context.enableMouseMode(context);
    }

    if (context.splits?.heroText) {
        context.splits.heroText.revert();
    }

    if (context.splits?.aboutText) {
        context.splits.aboutText.revert();
    }
}