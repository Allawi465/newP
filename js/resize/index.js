import * as THREE from 'three';

export function onWindowResize(context) {
    const BREAKPOINT = 1000;
    const MIN_WIDTH = 420;
    const DEFAULT_VIEW_WIDTH = 4.5;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const aspect = w / h;

    let viewWidth;
    if (w > BREAKPOINT) {
        viewWidth = DEFAULT_VIEW_WIDTH * (w / BREAKPOINT);
    } else if (w <= MIN_WIDTH) {
        // Zoom in by scaling viewWidth to match the proportion at 300px
        viewWidth = DEFAULT_VIEW_WIDTH * (w / MIN_WIDTH);
    } else {
        viewWidth = DEFAULT_VIEW_WIDTH;
    }
    let viewHeight = viewWidth / aspect;

    // Apply size to renderer (full screen always)
    context.renderer.setSize(w, h);
    context.labelRenderer.setSize(w, h);
    context.renderer.setPixelRatio(window.devicePixelRatio);

    // Update camera
    context.camera.left = -viewWidth / 2;
    context.camera.right = viewWidth / 2;
    context.camera.top = viewHeight / 2;
    context.camera.bottom = -viewHeight / 2;
    context.camera.updateProjectionMatrix();

    // Resize large plane
    const planeHeight = context.camera.top - context.camera.bottom;
    const planeWidth = context.camera.right - context.camera.left;
    context.largePlane.geometry.dispose();
    context.largePlane.geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, 24, 24);

    // Reposition meshes
    const projectsEl = document.querySelector('.projects');
    context.meshes.forEach(m => context.setMeshPosition(m, projectsEl));
}
