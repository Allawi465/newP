import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function setupLenis(effectShell) {
    effectShell.bodyLenis = new Lenis({
        smooth: true,
        direction: 'vertical',
        wrapper: document.body,
        content: document.documentElement,
        syncTouch: true,
        touchMultiplier: 0.5,
    });

    const rafCallback = (time) => {
        if (effectShell.isProjectsOpen) {
            effectShell.projectsLenis.raf(time);
        } else {
            effectShell.bodyLenis.raf(time);
        }

        ScrollTrigger.update();
        requestAnimationFrame(rafCallback);
    };

    requestAnimationFrame(rafCallback);
}