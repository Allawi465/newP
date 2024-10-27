export function syncHtmlWithSlider(content) {
    const followSpeed = 0.09;

    content.group.children.forEach((mesh, index) => {
        const objectCSS = content.cssObjects[index];
        const targetX = mesh.position.x - (-content.slideWidth + 1.25);

        objectCSS.position.y = mesh.position.y - content.slideWidth - 0.28;

        const distanceToTargetX = Math.abs(targetX - objectCSS.position.x);

        if (distanceToTargetX < 10) {
            objectCSS.position.x += (targetX - objectCSS.position.x) * followSpeed;
        } else {
            objectCSS.position.x = targetX;
        }

        objectCSS.element.style.transform = `translate(-50%, -50%) translate3d(${objectCSS.position.x}px, 0)`;
    });
}