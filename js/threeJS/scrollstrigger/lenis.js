import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap';

export default function setupLenis(context) {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;

    if (isTouch) {
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
        ScrollTrigger.defaults({ scroller });
        ScrollTrigger.refresh();
        context.bodyLenis = null;
        return null;
    }
    // Desktop: Lenis smooth scroll
    const lenis = new Lenis({
        wrapper: document.documentElement,
        content: document.body,
        lerp: 0.1,
        syncTouch: false,
        autoRaf: false,
        touchMultiplier: 1.0,
    });

    context.bodyLenis = lenis;

    lenis.on('scroll', ScrollTrigger.update);
    ScrollTrigger.scrollerProxy(document.documentElement, {
        scrollTop(value) {
            if (arguments.length) lenis.scrollTo(value, { immediate: true });
            return lenis.scroll;
        },
        getBoundingClientRect() {
            return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
        },
        pinType: 'transform',
    });

    return lenis;
}