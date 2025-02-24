import { CSS2DObject } from 'three/examples/jsm/Addons.js';

export function createCSS2DObjects(content, images) {
    images.forEach((image, index) => {
        const element = document.createElement('div');
        element.className = 'slider-project';
        element.dataset.index = index;

        element.id = image.id;

        const container = document.createElement('div');
        container.className = 'slider-project__container';

        const title = document.createElement('div');
        title.className = 'slider-project__title';
        title.textContent = image.title || '';
        container.appendChild(title);

        const description = document.createElement('div');
        description.className = 'slider-project__description';
        description.textContent = image.slogan || '';
        container.appendChild(description);

        element.appendChild(container);

        const objectCSS = new CSS2DObject(element);
        const mesh = content.group.children[index];
        objectCSS.position.copy(mesh.position);

        content.cssGroup.add(objectCSS);
        content.cssObjects.push(objectCSS);
    });
}