import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap';

export default function setupLenis(context) {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;

    // ✅ Disable Lenis completely on mobile
    if (isTouch) {
        console.log("Lenis disabled on mobile — using native scroll");
        ScrollTrigger.scrollerProxy(document.documentElement, {});
        ScrollTrigger.refresh();
        return null;
    }


    const lenis = new Lenis({
        wrapper: document.documentElement,
        content: document.body,
        lerp: 0.1,
        smoothWheel: true,
        smoothTouch: false,
        autoRaf: false,
        autoResize: true,
    });

    context.bodyLenis = lenis;

    // Sync ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);

    // ScrollTrigger scroller proxy
    ScrollTrigger.scrollerProxy(document.documentElement, {
        scrollTop(value) {
            if (arguments.length) lenis.scrollTo(value, { immediate: true });
            return lenis.scroll;
        },
        getBoundingClientRect() {
            return { top: 0, left: 0, width: innerWidth, height: innerHeight };
        },
        pinType: document.documentElement.style.transform ? "transform" : "fixed",
    });

    // Initialize
    lenis.scrollTo(0, { immediate: true });
    ScrollTrigger.refresh();

    // Control functions
    context.startBodyScrolling = () => lenis.start();
    context.stopBodyScrolling = () => lenis.stop();

    return lenis;
}