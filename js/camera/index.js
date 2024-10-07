export function calculateTargetFov(newWidth) {
    const baseWidth = 1707;
    const defaultFov = 75;
    const midFov = 90;
    const maxFov = 130;

    let calculatedFov;


    if (newWidth < 585) {

        const factor = (980 - newWidth) / (980 - 611);
        calculatedFov = midFov + (maxFov - midFov) * factor;
    } else if (newWidth < 980) {

        const factor = (980 - newWidth) / (980 - 611);
        calculatedFov = midFov + (maxFov - midFov) * factor;
    } else if (newWidth < baseWidth) {

        const factor = (baseWidth - newWidth) / (baseWidth - 980);
        calculatedFov = defaultFov + (midFov - defaultFov) * factor;
    } else {

        calculatedFov = defaultFov;
    }

    return Math.min(calculatedFov, maxFov);
}

export function updateCameraProperties(camera, targetFov, newHeight, defaultCameraZ) {
    const baseHeight = 1024;
    const heightScaleFactor = newHeight / baseHeight;

    camera.fov = targetFov;
    camera.position.z = defaultCameraZ * heightScaleFactor;
    camera.updateProjectionMatrix();
}