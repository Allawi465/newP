export function onMouseMoveHover(event, context) {
    context.mouse.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);
    context.raycaster.setFromCamera(context.mouse, context.camera);

    const intersects = context.raycaster.intersectObjects(context.group.children);

    context.group.children.forEach(child => {
        const isIntersected = intersects.length > 0 && intersects[0].object === child;

        if (isIntersected && !child.userData.hovered) {
            child.userData.hovered = true;
            child.userData.tl.play();
        } else if (!isIntersected && child.userData.hovered) {
            child.userData.hovered = false;
            child.userData.tl.reverse();
        }
    });
}