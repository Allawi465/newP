import showDivWithContent from "../../../components/projects";

export function handleClick(event, context) {
    if (context.isLoading || context.isProjectsOpen || context.isDivOpen) return;
    if (event.target.closest('#openAbout') || event.target.closest('#close')) return;

    const { x, y } = context.getClientPosition(event);

    const canvas = context.renderer.domElement;
    const rect = canvas.getBoundingClientRect();

    const ndcX = ((x - rect.left) / rect.width) * 2 - 1;
    const ndcY = -((y - rect.top) / rect.height) * 2 + 1;

    context.mouse.set(ndcX, ndcY);

    context.raycaster.layers.set(context.slider_mesh);
    context.raycaster.setFromCamera(context.mouse, context.camera);

    const intersects = context.raycaster.intersectObjects(context.group.children, true);

    if (intersects.length === 0) return;

    const mesh = intersects[0].object;
    const meshId = mesh.userData.id;
    if (!meshId) return;

    const imageIndex = parseInt(meshId.split('_')[1]) - 1;

    if (context.images && imageIndex >= 0 && imageIndex < context.images.length) {
        showDivWithContent(imageIndex, context);
    } else {
        console.error(`Invalid mesh index: ${imageIndex} or images array is not initialized`);
    }
}