export default function syncHtmlWithSlider(content) {
    const sliderFactor = content.sliderFactor || 1;
    const offsetY = content.slideWidth * sliderFactor;
    const offsetYAdd = 0.23 * sliderFactor;

    const meshCount = content.group.children.length;
    const totalLength = content.meshSpacing * meshCount;

    content.group.children.forEach((mesh, index) => {
        const objectCSS = content.cssObjects[index];
        if (!objectCSS) return;

        objectCSS.position.y = (mesh.position.y - offsetY + offsetYAdd) + content.group.position.y;

        const targetX = ((((index * content.meshSpacing + content.currentPosition) % totalLength) + totalLength) % totalLength) - totalLength / 2;

        const cardOffsetX = -content.meshSpacing / 2.5;
        objectCSS.position.x = targetX + cardOffsetX;
        objectCSS.position.z = mesh.position.z;

        objectCSS.element.style.transform = `translateY(-50%) translate3d(${objectCSS.position.x}px, ${objectCSS.position.y}px, 0)`;
        objectCSS.updateMatrixWorld();
    });
}