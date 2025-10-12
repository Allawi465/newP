import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap';

export function setupAboutLenis(context) {
    const wrapper = document.querySelector('#about');
    const contentElement = wrapper.querySelector('.about_wrapper');

    const isTouch = window.matchMedia("(pointer: coarse)").matches;

    const lenis = new Lenis({
        wrapper,
        content: contentElement,
        lerp: isTouch ? 0.09 : 0.1,
        syncTouch: false,
        autoRaf: false,
        touchMultiplier: isTouch ? 1.0 : 2,
    });

    context.aboutLenis = lenis;

    lenis.on('scroll', () => {
        ScrollTrigger.update();
    });

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