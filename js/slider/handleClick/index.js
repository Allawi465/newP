import showDivWithContent from "../../components/projects";

export function handleClick(event, context) {
    if (context.isLoading || context.isProjectsOpen || context.isDivOpen) {
        return;
    }


    context.mouse.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);

    context.raycaster.setFromCamera(context.mouse, context.camera);

    const intersects = context.raycaster.intersectObjects(context.group.children);

    if (intersects.length > 0) {
        const mesh = intersects[0].object;
        const meshId = mesh.userData.id;

        const imageIndex = parseInt(meshId.split('_')[1]) - 1;

        // Check if the images array is initialized and imageIndex is valid
        if (context.images && imageIndex >= 0 && imageIndex < context.images.length) {
            showDivWithContent(imageIndex, context);
        } else {
            console.error(`Invalid mesh index: ${imageIndex} or images array is not initialized`);
        }
    }
}