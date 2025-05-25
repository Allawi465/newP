import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import gsap from "gsap";

gsap.registerPlugin(ScrollTrigger);

export function setupLenis(effectShell) {
    effectShell.bodyLenis = new Lenis({
        smooth: true,
        direction: 'vertical',
        wrapper: document.body,
        content: document.documentElement,
        syncTouch: true,
        touchMultiplier: 0.5,
    });

    effectShell.aboutLenis = new Lenis({
        smooth: true,
        direction: 'vertical',
        wrapper: document.getElementById('about'),
        content: document.getElementById('about'),
        syncTouch: true,
        touchMultiplier: 0.5,
    });

    effectShell.projectsLenis = new Lenis({
        smooth: true,
        direction: 'vertical',
        wrapper: document.getElementById('projects_info'),
        content: document.getElementById('projects_info'),
        syncTouch: true,
        touchMultiplier: 0.5,
    });

    const rafCallback = (time) => {
        if (effectShell.isProjectsOpen) {
            effectShell.projectsLenis.raf(time);
        } else if (effectShell.isDivOpen) {
            effectShell.aboutLenis.raf(time);
        } else {
            effectShell.bodyLenis.raf(time);
        }

        ScrollTrigger.update();
        requestAnimationFrame(rafCallback);
    };

    requestAnimationFrame(rafCallback);
}