import * as THREE from 'three';
import { createLargePlane, createPlaneMesh } from '../../index';

export default function createMeshes(context) {
    const largePlane = createLargePlane(context);
    context.scene.add(largePlane);
    largePlane.layers.set(context.PLANE_LAYER);
    largePlane.renderOrder = 0;

    context.group = new THREE.Group();

    context.scene.add(context.group);

}