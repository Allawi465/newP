import gsap from "gsap";

function closeInfoDiv(context) {
    const infoDiv = document.getElementById('projects_info');
    const aboutDiv = document.getElementById('about');

    // Check which div is currently open
    const isInfoDivOpen = infoDiv && infoDiv.classList.contains('show');
    const isAboutDivOpen = aboutDiv && aboutDiv.classList.contains('show');

    // Kill any ongoing GSAP animations
    gsap.killTweensOf([
        context.largeShaderMaterial.uniforms.progress,
        ...context.meshArray.map(mesh => mesh.material.uniforms.opacity),
        context.material.uniforms.opacity,
    ]);

    if (isInfoDivOpen) {
        context.tm = projectCloseTimeline();
        gsap.to(infoDiv, {
            opacity: 0, duration: 1, onComplete: () => {
                infoDiv.style.zIndex = 0;
                infoDiv.classList.remove('show');
            }
        });
    }


    if (isAboutDivOpen) {
        context.tm = aboutCloseTimeline(context);

        gsap.to(aboutDiv, {
            opacity: 0, duration: 1, onComplete: () => {
                aboutDiv.style.zIndex = 0;
                aboutDiv.classList.remove('show');
                if (context.fboMesh) context.fboMesh.visible = false;
            }
        });
    }

    gsap.to(context.largeShaderMaterial.uniforms.progress, {
        value: 1,
        duration: 2,
        ease: 'power2.inOut',
        onUpdate: () => {
            const progress = context.largeShaderMaterial.uniforms.progress.value;

            context.cssObjects.forEach(meshText => {
                const domElement = meshText.element;
                domElement.style.opacity = progress;
            });
        },
    });

    document.getElementById('openAbout').style.display = 'block';
    document.getElementById('close').style.display = 'none';

    context.startBodyScrolling();
    context.isDivOpen = false;
    context.isProjectsOpen = false;

}

function aboutCloseTimeline(context) {
    return gsap.timeline({
        onComplete: () => {
            context.toggleAboutfbo(false);
            if (context.fboMesh) {
                context.fboMesh.visible = false;
            }
        }
    })
        .to(".about-parent", { opacity: 0, duration: 1.1, ease: "power2.inOut" }, 0.2)
        .to(".contact_info", { opacity: 0, duration: 1.1, ease: "power2.inOut" }, "<")
        .to(".title_play", { opacity: 0, duration: 1.1, ease: "power2.inOut" }, "<")
        .to(context.material.uniforms.opacity, { value: 0, duration: 0.8, ease: 'power2.inOut' }, "<")
        .to(".skills_text_wrap", { opacity: 0, duration: 1.1, ease: "power2.inOut" }, "<")
        .to(".skill_container", { opacity: 0, duration: 1.1, ease: "power2.inOut" }, "<")
        .set("#about", { zIndex: 0 }, ">");
}


function projectCloseTimeline() {
    return gsap.timeline({})
        .to(".projects_titles", { opacity: 0, duration: 1.1, ease: "power2.inOut" }, 0.2)
        .to(".projects_title", { opacity: 0, duration: 1.1, ease: "power2.inOut" }, "<")
        .to(".project_slogan", { opacity: 0, duration: 1.1, ease: "power2.inOut" }, "<")
        .to(".projects_detils", { opacity: 0, duration: 1.1, ease: "power2.inOut" }, "<")
        .to(".hidden_link", { opacity: 0, duration: 1.1, ease: "power2.inOut" }, "<")
        .to(".projectsImg", { opacity: 0, duration: 1.1, ease: "power2.inOut" }, "<")
        .to(".projects_description", { opacity: 0, duration: 1.1, ease: "power2.inOut" }, "<")
        .set("#projects_info", { zIndex: 0 }, ">");
}


export default closeInfoDiv;