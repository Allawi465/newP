export default function syncHtmlWithSlider(content) {
    const followSpeed = 0.09;
    const sliderFactor = content.sliderFactor || 1;
    const offsetX = 3.09 * sliderFactor;
    const offsetY = content.slideWidth * sliderFactor;
    const offsetYAdd = 0.23 * sliderFactor;
    const threshold = 10 * sliderFactor; content.group.children.forEach((mesh, index) => {
        const objectCSS = content.cssObjects[index];
        const targetX = mesh.position.x - offsetX;

        objectCSS.position.y = mesh.position.y - offsetY + offsetYAdd;

        const distanceToTargetX = Math.abs(targetX - objectCSS.position.x);

        if (distanceToTargetX < threshold) {
            objectCSS.position.x += (targetX - objectCSS.position.x) * followSpeed;
        } else {
            objectCSS.position.x = targetX;
        }

        objectCSS.element.style.transform = `translate(-50%, -50%) translate3d(${objectCSS.position.x}px, 0)`;
    });
}

