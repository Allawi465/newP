import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap';

export default function setupLenis(context) {
    const wrapper = document.querySelector('.lenis-wrapper');
    const content = document.querySelector('.lenis-content');
    const isTouch = window.matchMedia("(pointer: coarse)").matches;

    const lenis = new Lenis({
        wrapper,
        content,
        lerp: isTouch ? 0.09 : 0.1,
        syncTouch: false,
        autoRaf: false,
        touchMultiplier: isTouch ? 1.3 : 1.0,
    });

    context.bodyLenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    // Proper RAF handling
    if (isTouch) {
        const update = (time) => {
            lenis.raf(time);
            requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    } else {
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
    }

    // Connect to ScrollTrigger
    ScrollTrigger.scrollerProxy(wrapper, {
        scrollTop(value) {
            if (arguments.length) lenis.scrollTo(value, { immediate: true });
            return lenis.scroll;
        },
        getBoundingClientRect() {
            return {
                top: 0,
                left: 0,
                width: window.innerWidth,
                height: window.innerHeight,
            };
        },
        pinType: "transform",
    });

    lenis.scrollTo(0, { immediate: true });
    ScrollTrigger.refresh();

    return lenis;
}