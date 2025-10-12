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
        lerp: isTouch ? 0.07 : 0.1,
        syncTouch: false,
        touchMultiplier: 2,
        autoRaf: false,
        autoResize: true,
    });

    context.aboutLenis = lenis;

    lenis.on('scroll', () => {
        ScrollTrigger.update();
    });

    if (isTouch) {
        let lastTime = 0;
        const update = (time) => {
            const delta = time - lastTime;
            if (delta > 16) {
                lenis.raf(time);
                lastTime = time;
            }
            requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    } else {
        gsap.ticker.add((t) => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);
    }

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