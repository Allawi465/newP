import showDivWithContent from "../../components/projects";

export function handleClick(event, context) {
    if (context.isLoading || context.isProjectsOpen || context.isDivOpen) return;
    if (event.target.closest('#openAbout') || event.target.closest('#close')) return;

    context.mouse.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );

    // Set raycaster to look only at the slider mesh layer
    context.raycaster.layers.set(context.slider_mesh);
    context.raycaster.setFromCamera(context.mouse, context.camera);

    const intersects = context.raycaster.intersectObjects(context.group.children);

    if (intersects.length > 0) {
        const mesh = intersects[0].object;
        const meshId = mesh.userData.id;
        const imageIndex = parseInt(meshId.split('_')[1]) - 1;

        if (context.images && imageIndex >= 0 && imageIndex < context.images.length) {
            showDivWithContent(imageIndex, context);
        } else {
            console.error(`Invalid mesh index: ${imageIndex} or images array is not initialized`);
        }
    }
}