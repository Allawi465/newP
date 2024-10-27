import gsap from 'gsap';


export function applyDistanceScale(context) {
    let distanceScaleValue = context.velocity * context.velocityScale;

    distanceScaleValue = Math.max(Math.min(distanceScaleValue, context.maxDistanceScale), -context.maxDistanceScale);

    context.group.children.forEach(child => {
        gsap.to(child.material.uniforms.uDistanceScale, {
            value: distanceScaleValue,
            duration: 0.5,
            ease: "power1.out",
        });
    });
}


/* export function applyOffset(context) {
    if (context.isMoving) return;

    context.group.children.forEach(child => {
        gsap.to(child.material.uniforms.uOffset.value, {
            x: context.dragSpeed,
            ease: "power4.out",
            duration: 0.5,
        });
    });
}  */