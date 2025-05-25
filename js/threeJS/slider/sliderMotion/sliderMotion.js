import gsap from 'gsap';

function startMomentumMotion(context) {
    if (!context.isMoving && !context.isDragging) return;

    context.currentPosition += context.velocity;

    applyDistanceScale(context);

    context.velocity *= context.friction;

    let offsetValue = context.velocity * 50;
    const maxOffset = 50;
    offsetValue = Math.max(Math.min(offsetValue, maxOffset), -maxOffset);

    context.group.children.forEach(child => {
        gsap.to(child.material.uniforms.uOffset.value, {
            x: offsetValue,
            ease: "power4.out",
            duration: 0.5,
        });
    });

    if (Math.abs(context.velocity) > 0.1 || context.isDragging) {
        requestAnimationFrame(() => startMomentumMotion(context));
    } else {
        context.velocity = 0;
        context.isMoving = false;

        context.group.children.forEach(child => {
            gsap.to(child.material.uniforms.uOffset.value, {
                x: 0,
                ease: "power4.out",
                duration: 0.5,
            });

            gsap.to(child.material.uniforms.uDistanceScale, {
                value: context.initialDistanceScale,
                duration: 0.5,
                ease: "power1.out",
            });
        });
    }
}


function applyDistanceScale(context) {
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

export default startMomentumMotion;