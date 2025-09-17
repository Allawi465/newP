import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap';

export default function setupLenis(effectShell) {

    gsap.ticker.lagSmoothing(0);

    effectShell.bodyLenis = new Lenis({
        wrapper: document.documentElement,
        content: document.body,
        smooth: true,
        direction: 'vertical',
        syncTouch: true,
        touchMultiplier: 1.,
        wheelPropagation: false,
        lerp: 0.12,
        syncTouchLerp: 0.1,
        autoRaf: false,
    });

    gsap.ticker.lagSmoothing(0);

    // Prevent native scrolling when Lenis is stopped
    const preventDefaultScroll = (e) => {
        if (effectShell.bodyLenis.isStopped) {
            e.preventDefault();
        }
    };

    document.addEventListener('wheel', preventDefaultScroll, { passive: false });
    document.addEventListener('touchmove', preventDefaultScroll, { passive: false });

    // Use GSAP ticker instead of custom RAF to avoid duplication
    gsap.ticker.add((time) => {
        effectShell.bodyLenis.raf(time * 1000);
    });

    // Update ScrollTrigger on Lenis scroll
    effectShell.bodyLenis.on('scroll', () => {
        if (!effectShell.bodyLenis.isStopped) {
            ScrollTrigger.update();
        }
    });

    // Configure scrollerProxy for Lenis integration
    ScrollTrigger.scrollerProxy(document.documentElement, {
        scrollTop(value) {
            if (arguments.length) {
                effectShell.bodyLenis.scrollTo(value, { immediate: true });
            }
            return effectShell.bodyLenis.scroll;
        },
        getBoundingClientRect() {
            return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
        },
        pinType: document.documentElement.style.transform ? 'transform' : 'fixed',
    });

    // Disable normalizeScroll to prevent nested scrolling
    ScrollTrigger.normalizeScroll(false);

    // Refresh ScrollTrigger after setup
    ScrollTrigger.refresh();
}