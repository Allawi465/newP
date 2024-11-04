import showDivWithContent from "../../components/projects";

export function handleClick(event, context) {
    if (context.isDivOpen) {
        return;
    }

    // Normalize mouse position
    context.mouse.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);

    // Set the raycaster based on the camera and mouse position
    context.raycaster.setFromCamera(context.mouse, context.camera);

    const intersects = context.raycaster.intersectObjects(context.group.children);

    if (intersects.length > 0) {
        const mesh = intersects[0].object;
        const meshIndex = mesh.userData.index;

        // Check if the images array is initialized and meshIndex is valid
        if (context.images && meshIndex >= 0 && meshIndex < context.images.length) {
            showDivWithContent(meshIndex, context);
        } else {
            console.error(`Invalid mesh index: ${meshIndex} or images array is not initialized`);
        }
    }
}