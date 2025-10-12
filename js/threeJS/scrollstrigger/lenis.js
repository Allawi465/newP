import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap';

export default function setupLenis(context) {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;

    const lenis = new Lenis({
        wrapper: document.documentElement,
        content: document.body,
        lerp: isTouch ? 0.09 : 0.1,
        syncTouch: true,
        touchMultiplier: isTouch ? 1.0 : 2,
    });

    context.bodyLenis = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    if (isTouch) {
        const update = (time) => {
            lenis.raf(time);
            requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    } else {
        gsap.ticker.add((t) => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);
    }

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

    lenis.scrollTo(0, { immediate: true });
    ScrollTrigger.refresh();

    context.startBodyScrolling = () => lenis.start();
    context.stopBodyScrolling = () => lenis.stop();

    return lenis;
}