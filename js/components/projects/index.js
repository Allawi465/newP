import gsap from "gsap";
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import setInfoDivContent from "./content";

gsap.registerPlugin(ScrollTrigger);

import { animateProgress } from "../about";

function showDivWithContent(index, context) {

    context.isProjectsOpen = true;

    reset(context);

    const selectedImage = context.images[index];

    setInfoDivContent(selectedImage);

    animateProgress(context);

    context.projectsLenis.resize();
    context.stopBodyScrolling();
    const projectsDiv = document.getElementById('projects_info');
    projectsDiv.style.zIndex = 60;
    projectsDiv.classList.add('show');

    document.getElementById('openAbout').style.display = 'none';
    document.getElementById('close').style.display = 'block';

    context.tm = setupTimeline();
}

function setupTimeline() {
    const timeline = gsap.timeline();

    const elements = [
        ".project_details",
        ".projects_titles_hidden",
        ".hidden_link",
        ".project_details",
    ];

    elements.forEach(selector => {
        timeline.to(selector, { opacity: 1, ease: "power2.inOut", duration: 1. }, 0.8);
    });

    return timeline;
}

function reset(context) {
    gsap.killTweensOf([
        context.largeShaderMaterial.uniforms.progress,
        context.material.uniforms.opacity,
        ...context.meshArray.map(mesh => mesh.material.uniforms.opacity),
        ".project_details",
        ".projects_titles_hidden",
        ".hidden_link",
        ".project_details",
    ]);

    gsap.killTweensOf("*");

    if (context.tm) context.tm.kill();
}



export default showDivWithContent;