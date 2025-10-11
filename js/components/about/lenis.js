import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap';

export function setupAboutLenis(context) {
    const wrapper = document.querySelector('#about');
    const contentElement = wrapper.querySelector('.about_wrapper');

    const isTouch = window.matchMedia("(pointer: coarse)").matches; // detect touch devices

    const lenis = new Lenis({
        wrapper: wrapper,
        content: contentElement,
        lerp: isTouch ? 0.08 : 0.12,        // slightly tighter on mobile
        syncTouch: isTouch ? true : false,  // natural touch feel
        touchMultiplier: isTouch ? 1.0 : 2, // lower multiplier for mobile
        autoRaf: false,
        autoToggle: true,
    });

    context.aboutLenis = lenis;

    // Update ScrollTrigger on scroll
    lenis.on('scroll', ScrollTrigger.update);

    // Drive Lenis frame updates
    if (isTouch) {
        // Mobile / touch: requestAnimationFrame loop
        const update = (time) => {
            lenis.raf(time);
            requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    } else {
        // Desktop: use GSAP ticker
        gsap.ticker.add((t) => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);
    }

    // ScrollTrigger scroller proxy
    ScrollTrigger.scrollerProxy(wrapper, {
        scrollTop(value) {
            if (arguments.length) lenis.scrollTo(value, { immediate: true });
            return lenis.scroll;
        },
        getBoundingClientRect() {
            return { top: 0, left: 0, width: wrapper.clientWidth, height: wrapper.clientHeight };
        },
        pinType: wrapper.style.transform ? 'transform' : 'fixed',
    });

    // Initialize scroll
    lenis.scrollTo(0, { immediate: true });
    ScrollTrigger.refresh();

    return lenis;
}