import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { createLargePlane, createPlaneMesh } from '../../index';

export default function createMeshes(context) {
    const largePlane = createLargePlane(context);
    context.scene.add(largePlane);
    largePlane.layers.set(context.PLANE_LAYER);
    largePlane.renderOrder = 0;

    context.group = new THREE.Group();

    /*  context.textures.forEach((texture, i) => {
         const planeMesh = createPlaneMesh(context, texture, i, context.renderer);
 
         planeMesh.layers.set(context.slider_mesh);
 
         context.group.add(planeMesh);
     }); */

    context.scene.add(context.group);

    context.projectsElement = document.querySelector(".projects")

    context.titleElement = document.querySelector(".projects__title");
    context.titleLabel = new CSS2DObject(context.titleElement);
    context.titleLabel.layers.set(context.slider_mesh);
    context.scene.add(context.titleLabel);

    context.titleWorldPos = new THREE.Vector3();
}