export function animate(scene, camera, renderer, group) {
    requestAnimationFrame(() => animate(scene, camera, renderer, group));

    group.children.forEach(child => {
        child.material.uniforms.u_time.value += 0.01;
    });

    renderer.render(scene, camera);
}