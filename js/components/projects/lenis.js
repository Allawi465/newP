import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap';

gsap.registerPlugin(ScrollTrigger);

export default function setupProjectsLenis(context) {
    const wrapper = document.querySelector('#projects');
    const content = wrapper.querySelector('.projects_wrapper');

    let lenis = null;

    if (!context.isTouchDevice()) {
        lenis = new Lenis({
            wrapper,
            content,
            smoothWheel: true,
            smoothTouch: false,
            autoRaf: false,
        });

        context.projectsLenis = lenis;

        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);

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
            pinType: wrapper.style.transform ? 'transform' : 'fixed',
        });
        lenis.scrollTo(0, { immediate: true });
        ScrollTrigger.refresh();
    }
    else {
        wrapper.style.overflowY = 'auto';
        ScrollTrigger.defaults({});
        context.projectsLenis = null;
        ScrollTrigger.refresh();
    }

    return lenis;
}