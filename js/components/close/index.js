import gsap from "gsap";

function closeInfoDiv(context) {

    gsap.killTweensOf(context.largeShaderMaterial.uniforms.progress);

    context.meshArray.forEach(mesh => gsap.killTweensOf(mesh.material.uniforms.opacity));

    gsap.killTweensOf(context.material.uniforms.opacity);

    gsap.to(context.largeShaderMaterial.uniforms.progress, {
        value: 1,
        duration: 2,
        ease: 'power2.inOut'
    });

    context.meshArray.forEach(mesh => {
        mesh.visible = true;
        gsap.to(mesh.material.uniforms.opacity, {
            value: 1,
            duration: 1,
            delay: 1.7
        });
    });

    context.cssObjects.forEach(meshText => {
        meshText.visible = true;
        gsap.to(meshText.element, {
            opacity: 1,
            duration: 1,
            delay: 1.7
        });
    });

    // Update buttons and about div visibility
    document.getElementById('openAbout').style.display = 'block';
    document.getElementById('close').style.display = 'none';

    context.tm = gsap.timeline({
        onComplete: () => {
            context.toggleAboutfbo(false);
            if (context.fboMesh) {
                context.fboMesh.visible = false;
            }
        }
    });

    context.tm
        .to(".about-parent", {
            opacity: 0,
            duration: 1.1,
            ease: "power2.inOut",
        }, 0.4)
        .to(".contact_info", {
            opacity: 0,
            duration: 1.1,
            ease: "power2.inOut",
        }, "<").to(".rolling_h1", {
            opacity: 0,
            duration: 1.1,
            ease: "power2.inOut",
        }, "<").to(context.material.uniforms.opacity, {
            value: 0,
            duration: 0.8,
            ease: 'power2.inOut',
        }, "<").to(".skills_text_wrap", {
            opacity: 0,
            duration: 1.1,
            ease: "power2.inOut",
        }, "<").to(".skill_container", {
            opacity: 0,
            duration: 1.1,
            ease: "power2.inOut",
        }, "<").set("#about", {
            zIndex: 0,
        }, ">");

    context.isDivOpen = false;
    context.startBodyScrolling();


    if (context.tl) {
        context.tl.pause();
    }
}

export default closeInfoDiv;