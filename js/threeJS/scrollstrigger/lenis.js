import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap';

export default function setupLenis(context) {
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
        autoToggle: true,
    });

    context.bodyLenis = lenis;

    // drive Lenis with GSAP’s ticker
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    lenis.on('scroll', ScrollTrigger.update);

    // ScrollTrigger proxy
    ScrollTrigger.scrollerProxy(document.documentElement, {
        scrollTop(value) {
            if (arguments.length) {
                lenis.scrollTo(value, { immediate: true });
            }
            return lenis.scroll;
        },
        getBoundingClientRect() {
            return { top: 0, left: 0, width: innerWidth, height: innerHeight };
        },
        pinType: document.documentElement.style.transform ? 'transform' : 'fixed',
    });

    // reset scroll position on init
    lenis.scrollTo(0, { immediate: true });
    ScrollTrigger.refresh();

    // 🔑 add helpers like the jQuery demo
    context.startBodyScrolling = () => lenis.start();
    context.stopBodyScrolling = () => lenis.stop();

    return lenis;
}