import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap';

export function setupAboutLenis(context) {
    // Disable Lenis on touch devices
    if (ScrollTrigger.isTouch) {
        console.log("About Lenis disabled on touch devices");
        return null;
    }

    const wrapper = document.querySelector('#about');
    const contentElement = wrapper.querySelector('.about_wrapper');

    const lenis = new Lenis({
        wrapper: wrapper,
        content: contentElement,
        lerp: 0.12,
        syncTouch: false,
        autoToggle: true,
        autoRaf: false,
    });

    context.aboutLenis = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);

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

    lenis.scrollTo(0, { immediate: true });
    ScrollTrigger.refresh();

    return lenis;
}