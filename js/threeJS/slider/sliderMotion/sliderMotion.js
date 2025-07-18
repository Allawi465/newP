import gsap from 'gsap';

function startMomentumMotion(context) {
    if (!context.isMoving && !context.isDragging) return;

    context.currentPosition += context.velocity;
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
        });
    }
}

export default startMomentumMotion;