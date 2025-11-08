import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { createPlaneMesh } from '../../index';

export default function createMeshes(context) {
    context.group = new THREE.Group();

    context.textures.forEach((texture, i) => {
        const planeMesh = createPlaneMesh(context, texture, i, context.renderer);

        planeMesh.layers.set(context.slider_mesh);

        context.group.add(planeMesh);
    });

    context.scene.add(context.group);
    context.titleElement = document.querySelector(".projects__title");

    context.titleLabel = new CSS2DObject(context.titleElement);
    context.titleLabel.layers.set(context.slider_mesh);
    context.scene.add(context.titleLabel);

    context.titleLabel = new CSS2DObject(context.titleElement);
    context.titleLabel.layers.set(context.slider_mesh);
    context.scene.add(context.titleLabel);

    context.projectsElement = document.querySelector(".projects");
    context.titleWorldPos = new THREE.Vector3();
}