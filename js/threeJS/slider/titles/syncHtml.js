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

        objectCSS.position.y = (mesh.position.y - offsetY + offsetYAdd) + content.group.position.y;

        const targetX = ((((index * content.meshSpacing + content.currentPosition) % totalLength) + totalLength) % totalLength) - totalLength / 2;

        const leftOffset = -content.meshSpacing / 2.5;
        const finalTargetX = targetX + leftOffset;

        const distanceToTargetX = Math.abs(finalTargetX - objectCSS.position.x);
        if (distanceToTargetX < threshold) {
            objectCSS.position.x += (finalTargetX - objectCSS.position.x) * followSpeed;
        } else {
            objectCSS.position.x = finalTargetX;
        }

        objectCSS.position.z = mesh.position.z;

        objectCSS.element.style.transform = `translate(-50%, -50%) translate3d(${objectCSS.position.x}px, ${objectCSS.position.y}px, 0)`;

        objectCSS.updateMatrixWorld();
    });
}