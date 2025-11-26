import gsap from "gsap";
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animateProgress } from "../about";
import setInfoDivContent from "./content";
import setupProjectsLenis from "./lenis";
import setupScrollAnimation from "../../threeJS/scrollstrigger";

gsap.registerPlugin(ScrollTrigger);

function showDivWithContent(index, context) {
    if (context.isLoading || context.isDivOpen || context.isProjectsOpen) return;

    context.stopBodyScrolling();

    if (!context.projectsLenis) {
        setupProjectsLenis(context);
    }

    const projectsDiv = document.getElementById('projects');
    projectsDiv.classList.add('show');

    requestAnimationFrame(() => {
        if (context.projectsLenis) {
            context.projectsLenis.resize();
            context.projectsLenis.scrollTo(0, { immediate: true });
            context.projectsLenis.start();
        }

        /*     reset(context); */

        animateProgress(context);

        const selectedImage = context.images[index];

        setInfoDivContent(selectedImage)

        /*      context.tm = setupTimeline(context); */

        gsap.to(projectsDiv, {
            opacity: 1,
            duration: 1,
        });
    });

    setTimeout(() => {
        document.getElementById('openAbout').style.opacity = '0';
        document.getElementById('openAbout').style.pointerEvents = 'none';
        document.getElementById('close').style.opacity = '1';
        document.getElementById('close').style.pointerEvents = 'auto';
        document.getElementById('close').style.zIndex = '999';
    }, 600);

    ScrollTrigger.refresh(true);
    setupScrollAnimation(context);
}

function setupTimeline() {
    const timeline = gsap.timeline();

    const elements = [
        ".projects_titles",
        ".projects_title",
        ".project_slogan",
        ".projects_detils",
        ".hidden_link",
        ".projectsImg",
        ".projects_description"
    ];

    elements.forEach(selector => {
        timeline.to(selector, { opacity: 1, ease: "power2.inOut", duration: 1.1 }, 0.5);
    });

    return timeline;
}

function reset(context) {
    gsap.killTweensOf([
        context.largeShaderMaterial.uniforms.progress,
        context.material.uniforms.opacity,
        ...context.meshArray.map(mesh => mesh.material.uniforms.opacity),
        ".projects_titles",
        ".projects_title",
        ".project_slogan",
        ".projects_detils",
        ".hidden_link",
        ".projectsImg",
        ".projects_description"
    ]);

    gsap.killTweensOf("*");

    if (context.tm) context.tm.kill();
}



export default showDivWithContent;