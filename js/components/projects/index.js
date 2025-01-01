import gsap from "gsap";
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import setInfoDivContent from "./content";

gsap.registerPlugin(ScrollTrigger);

import { animateProgress } from "../about";

function showDivWithContent(index, context) {

    const selectedImage = context.images[index];

    setInfoDivContent(selectedImage)

    animateProgress(context);

    context.projectsLenis.resize();
    context.stopBodyScrolling();
    context.isProjectsOpen = true;


    const projectsDiv = document.getElementById('projects_info');
    projectsDiv.style.zIndex = 60;
    projectsDiv.classList.add('show');

    const image = document.querySelector(".projectsImg");
    const imageSmall = document.querySelector(".projectsImg_small");

    gsap.set(image, {
        height: "calc(100% + 25vw)",
        top: "-25vw",
        transform: "none",
    });

    gsap.set(imageSmall, {
        height: "calc(100% + 10vw)",
        top: "-10vw",
        transform: "none",
    });

    gsap.to(projectsDiv, {
        opacity: 1,
        duration: 1,
    });

    gsap.to(image, {
        scrollTrigger: {
            scroller: projectsDiv,
            trigger: ".project_img",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
        },
        y: "25vw",
        ease: "none",
    });

    gsap.to(imageSmall, {
        scrollTrigger: {
            scroller: projectsDiv,
            trigger: ".project_img",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
        },
        y: "10vw",
        ease: "none"

    });

    document.getElementById('openAbout').style.display = 'none';
    document.getElementById('close').style.display = 'block';

    context.tm = setupTimeline();

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
        timeline.to(selector, { opacity: 1, ease: "power2.inOut", duration: 1.1 }, 0.8);
    });

    return timeline;
}



export default showDivWithContent;