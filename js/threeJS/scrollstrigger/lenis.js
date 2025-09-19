import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap';

export default function setupLenis(effectShell) {
    gsap.ticker.lagSmoothing(0);

    const lenis = new Lenis({
        wrapper: document.documentElement,
        content: document.body,
        smooth: true,
        direction: 'vertical',
        syncTouch: true,
        touchMultiplier: 1,
        wheelPropagation: false,
        lerp: 0.12,
        syncTouchLerp: 0.1,
        autoRaf: false,
    });
    effectShell.bodyLenis = lenis;

    // Use GSAP ticker (single RAF loop)
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    lenis.on('scroll', ScrollTrigger.update);

    // Proxy <html> for ST
    ScrollTrigger.scrollerProxy(document.documentElement, {
        scrollTop(value) {
            if (arguments.length) {
                lenis.scrollTo(value, { immediate: true });
            }
            return lenis.scroll; // current scroll position in px
        },
        getBoundingClientRect() {
            return { top: 0, left: 0, width: innerWidth, height: innerHeight };
        },
        pinType: document.documentElement.style.transform ? 'transform' : 'fixed',
    });

    // Force start at top through Lenis, then one refresh
    lenis.scrollTo(0, { immediate: true });
    ScrollTrigger.refresh();

    return lenis;
}