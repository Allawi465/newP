import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap';

export function setupAboutLenis(context) {
    gsap.ticker.lagSmoothing(0);

    const wrapper = document.querySelector('#about');
    const contentElement = wrapper.querySelector('.about_wrapper');

    const lenis = new Lenis({
        wrapper: wrapper,
        content: contentElement,
        lerp: 0.12,
        syncTouch: false,
        touchMultiplier: 2.0,
        autoToggle: true,
        autoRaf: false,
    });

    context.aboutLenis = lenis;

    gsap.ticker.add((t) => lenis.raf(t * 1000));
    lenis.on('scroll', ScrollTrigger.update);


    ScrollTrigger.scrollerProxy(wrapper, {
        scrollTop(value) {
            if (arguments.length) {
                lenis.scrollTo(value, { immediate: true });
            }
            return lenis.scroll;
        },
        getBoundingClientRect() {
            return { top: 0, left: 0, width: wrapper.clientWidth, height: wrapper.clientHeight };
        },
        pinType: 'transform'
    });


    lenis.scrollTo(0, { immediate: true });
    ScrollTrigger.refresh();
    return lenis;
}