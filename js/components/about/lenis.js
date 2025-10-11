import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap';

export function setupAboutLenis(context) {

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


    lenis.scrollTo(0, { immediate: true });
    ScrollTrigger.refresh();
    return lenis;
}