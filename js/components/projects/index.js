import gsap from "gsap";
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from "gsap/SplitText";
import { animateProgress } from "../about";
import setInfoDivContent from "./content";
import setupProjectsLenis from "./lenis";
import setupScrollAnimation from "../../threeJS/scrollstrigger";

gsap.registerPlugin(ScrollTrigger, SplitText);

function showDivWithContent(index, context) {
    if (context.isLoading || context.isDivOpen || context.isProjectsOpen) return;

    context.isProjectsOpen = true;

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

        reset(context);

        animateProgress(context);

        const selectedImage = context.images[index];

        setInfoDivContent(selectedImage)

        context.tm = setupTimeline(context);

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

function setupTimeline(context) {
    const timeline = gsap.timeline();

    context.splits.projectsText = SplitText.create(".projects_description", { type: "chars, words, lines" });

    timeline
        .from(".project_img", {
            duration: 2,
            ease: "power2.out",
            opacity: 0,
        }, 0.8)
        .from(".project_title", {
            duration: 1,
            yPercent: 100,
            opacity: 0,
            ease: "power2.out",
        }, 1.)
        .from(context.splits.projectsText.lines, {
            duration: 1,
            yPercent: 100,
            opacity: 0,
            stagger: 0.1,
            ease: "expo.out",
        }, 1.2)
        .from(".role_title", {
            duration: 1,
            yPercent: 100,
            opacity: 0,
            ease: "power2.out",
        }, 1.4)
        .from(".role_item", {
            duration: 1,
            opacity: 0,
            yPercent: 100,
            ease: "power2.out",
        }, 1.6)
        .from(".link_cta", {
            duration: 1,
            yPercent: 100,
            opacity: 0,
            ease: "power2.out",
        }, 1.8)

    return timeline;
}

function reset(context) {
    gsap.killTweensOf([
        context.largeShaderMaterial.uniforms.progress,
        ".project_img",
        ".project_title",
        ".projects_description",
        ".role",
        ".role_item",
        ".link_cta"
    ]);

    if (context.splits.projectsText) {
        context.splits.projectsText.revert();
        context.splits.projectsText = null;
    }

    gsap.set(
        [".project_img", ".project_title", ".projects_description", ".role", ".role_item", ".link_cta"],
        { clearProps: "all" }
    );


    if (context.tm) context.tm.kill();
}



export default showDivWithContent;