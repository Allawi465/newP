export default function syncHtmlWithSlider(content) {
    const followSpeed = 0.09;
    const sliderFactor = content.sliderFactor || 1;
    const offsetY = content.slideWidth * sliderFactor;
    const offsetYAdd = 0.23 * sliderFactor;
    const threshold = 10 * sliderFactor;

    const meshCount = content.group.children.length;
    const totalLength = content.meshSpacing * meshCount;

    content.group.children.forEach((mesh, index) => {
        const objectCSS = content.cssObjects[index];
        if (!objectCSS) return;

        // Keep titles aligned under cards on left
        objectCSS.position.y = mesh.position.y - offsetY + offsetYAdd;

        // Target X using same wrapping logic as slider
        const targetX = ((((index * content.meshSpacing + content.currentPosition) % totalLength) + totalLength) % totalLength) - totalLength / 2;

        // Shift left a bit to align under left of card
        const leftOffset = -content.meshSpacing / 2.5;
        const finalTargetX = targetX + leftOffset;

        // Smooth follow X with threshold
        const distanceToTargetX = Math.abs(finalTargetX - objectCSS.position.x);
        if (distanceToTargetX < threshold) {
            objectCSS.position.x += (finalTargetX - objectCSS.position.x) * followSpeed;
        } else {
            objectCSS.position.x = finalTargetX;
        }

        objectCSS.position.z = mesh.position.z;

        // Apply CSS2D transform for proper rendering
        objectCSS.element.style.transform = `translate(-50%, -50%) translate3d(${objectCSS.position.x}px, 0, 0)`;

        objectCSS.updateMatrixWorld();
    });
}