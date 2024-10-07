import gsap from 'gsap';


export function screenFactors(context) {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const smallScreenThreshold = 960;
    const mediumScreenThreshold = 1637;

    const widthFactor = windowWidth < smallScreenThreshold ? (smallScreenThreshold / windowWidth) :
        (windowWidth < mediumScreenThreshold ? (mediumScreenThreshold / windowWidth) : 1);

    const heightFactor = windowHeight < smallScreenThreshold ? (smallScreenThreshold / windowHeight) :
        (windowHeight < mediumScreenThreshold ? (mediumScreenThreshold / windowHeight) : 1);

    const maxDragSpeed = windowWidth < smallScreenThreshold ? 15 :
        (windowWidth < mediumScreenThreshold ? 30 : 25);

    const dragSpeedAbs = Math.min(Math.abs(context.dragSpeed), maxDragSpeed);

    return { dragSpeedAbs, widthFactor, heightFactor, maxDragSpeed };
}

export function applyDistanceScale(context, dynamicDistanceScale) {
    if (context.isMoving) return;
    context.group.children.forEach(child => {
        gsap.to(child.material.uniforms.uDistanceScale, {
            value: dynamicDistanceScale,
            duration: 0.5, // Smooth transition duration
            ease: "power3.out", // Easing for smooth effect
        });
    });
}

// Updated applyOffset function to handle smooth resetting
export function applyOffset(context) {
    if (context.isMoving) return;

    context.group.children.forEach(child => {
        gsap.to(child.material.uniforms.uOffset.value, {
            x: context.dragSpeed,
            duration: 0.6, // Duration of the animation for smoother reset
            ease: "power3.out", // Easing function for smooth effect
        });
    });
}

export function distanceScale(context, dragSpeedAbs, widthFactor, heightFactor) {
    const maxDragDistanceScale = 0.2;
    return context.initialDistanceScale + Math.min(dragSpeedAbs / (180), maxDragDistanceScale) * widthFactor * heightFactor;
}