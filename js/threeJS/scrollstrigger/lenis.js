import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap';

export default function setupLenis(context) {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;

    // --- Detect Firefox ---
    const ua = navigator.userAgent.toLowerCase();
    const isFirefox = ua.indexOf('firefox') > -1;

    // Use body for Firefox, documentElement otherwise
    const wrapper = isFirefox ? document.body : document.documentElement;

    const lenis = new Lenis({
        wrapper: wrapper,
        content: document.body,
        lerp: isTouch ? 0.07 : 0.1,
        syncTouch: !isTouch,
        touchMultiplier: 1.0,
        autoRaf: false,
    });

    context.bodyLenis = lenis;

    // Update ScrollTrigger on scroll
    lenis.on('scroll', ScrollTrigger.update);

    if (isTouch) {
        // Mobile: requestAnimationFrame loop
        const update = (time) => {
            lenis.raf(time);
            requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    } else {
        // Desktop: GSAP ticker
        gsap.ticker.add((t) => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);
    }

    // ScrollTrigger proxy
    ScrollTrigger.scrollerProxy(wrapper, {
        scrollTop(value) {
            if (arguments.length) lenis.scrollTo(value, { immediate: true });
            return lenis.scroll;
        },
        getBoundingClientRect() {
            return { top: 0, left: 0, width: innerWidth, height: innerHeight };
        },
        pinType: 'transform',
    });

    lenis.scrollTo(0, { immediate: true });
    ScrollTrigger.refresh();

    return lenis;
}