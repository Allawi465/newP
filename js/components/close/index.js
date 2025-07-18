import gsap from "gsap";
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import setupScrollAnimation from "../../threeJS/scrollstrigger/index.js";

function closeInfoDiv(context) {
    const infoDiv = document.getElementById('projects_info');
    const aboutDiv = document.getElementById('about');

    const isInfoDivOpen = infoDiv && infoDiv.classList.contains('show');
    const isAboutDivOpen = aboutDiv && aboutDiv.classList.contains('show');

    gsap.killTweensOf([
        context.largeShaderMaterial.uniforms.progress,
        ...context.meshArray.map(mesh => mesh.material.uniforms.opacity),
    ]);

    gsap.killTweensOf("*");

    if (isInfoDivOpen) {
        context.tm = projectCloseTimeline();
        gsap.to(infoDiv, {
            opacity: 0, duration: 0.5, onComplete: () => {
                infoDiv.style.zIndex = 0;
                infoDiv.classList.remove('show');
                context.isProjectsOpen = false;
            }
        });
    }

    if (isAboutDivOpen) {
        context.tm = aboutCloseTimeline(context);

        gsap.to(aboutDiv, {
            opacity: 0, duration: 0.5, onComplete: () => {
                aboutDiv.style.zIndex = 0;
                aboutDiv.classList.remove('show');
            }
        });
    }

    gsap.to(context.largeShaderMaterial.uniforms.progress, {
        value: 1,
        duration: 1.2,
        ease: "sine.out",
    });

    document.getElementById('openAbout').style.display = 'block';
    document.getElementById('close').style.display = 'none';
    gsap.set(".scroll_line", { opacity: 1, "--scaleY": 1 });

    context.startBodyScrolling();
    setupScrollAnimation();
    ScrollTrigger.refresh();

    context.isDivOpen = false;
}

function aboutCloseTimeline(context) {
    return gsap.timeline({})
        .to(".about-parent", { opacity: 0, duration: 0.3, ease: "power2.out" },)
        .to(".contact_info", { opacity: 0, duration: 0.3, ease: "power2.out" }, "<")
        .set("#about", { zIndex: 0 }, ">");
}


function projectCloseTimeline() {
    return gsap.timeline({})
        .to(".project_details", { opacity: 0, duration: 0.3, ease: "power2.out" }, "<")
        .to(".projects_titles_hidden", { opacity: 0, duration: 0.3, ease: "power2.out" }, "<")
        .to(".hidden_link", { opacity: 0, duration: 0.3, ease: "power2.out" }, "<")
        .set("#projects_info", { zIndex: 0 }, ">");
}


export default closeInfoDiv;