import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap';
export default function setupLenis(context) {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;

    // --- Mobile: disable Lenis ---
    if (isTouch) {
        console.log("Lenis disabled on mobile, using native scroll");

        const scroller = document.documentElement;
        ScrollTrigger.scrollerProxy(scroller, {
            scrollTop(value) {
                if (arguments.length) scroller.scrollTop = value;
                return scroller.scrollTop;
            },
            getBoundingClientRect() {
                return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
            },
            pinType: 'fixed',
        });

        // Make sure ScrollTrigger defaults to native scroll
        ScrollTrigger.defaults({ scroller });
        ScrollTrigger.refresh();

        context.bodyLenis = null;
        return null;
    }

    // --- Desktop: use Lenis ---
    const lenis = new Lenis({
        wrapper: document.documentElement,
        content: document.body,
        lerp: 0.1,
        syncTouch: false,
        touchMultiplier: 1.0,
        autoRaf: false,
        autoResize: true,
    });

    context.bodyLenis = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);

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

    return lenis;
}