import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap';

gsap.registerPlugin(ScrollTrigger);

export default function setupAboutLenis(context) {
    const wrapper = document.querySelector('#about');
    const content = wrapper.querySelector('.about_wrapper');

    if (!context.isTouchDevice()) {
        const lenis = new Lenis({
            wrapper,
            content,
            smoothWheel: true,
            smoothTouch: false,
            autoRaf: false,
        });

        context.aboutLenis = lenis;

        lenis.on('scroll', ScrollTrigger.update);


        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);

        ScrollTrigger.scrollerProxy(wrapper, {
            scrollTop(value) {
                if (arguments.length) lenis.scrollTo(value, { immediate: true });
                return lenis.scroll;
            },
            getBoundingClientRect() {
                return { top: 0, left: 0, width: innerWidth, height: innerHeight };
            },
            pinType: wrapper.style.transform ? 'transform' : 'fixed',
        });

        context.startAboutScrolling = () => {
            ScrollTrigger.defaults({ scroller: wrapper });
            lenis.start();
            requestAnimationFrame(() => {
                lenis.scrollTo(0, { immediate: true });
                lenis.raf(performance.now());
            });
        };

        context.stopAboutScrolling = () => lenis.stop();

        ScrollTrigger.refresh();
    } else {
        wrapper.style.overflowY = 'auto';
        context.aboutLenis = null;
        ScrollTrigger.defaults({ scroller: wrapper });
        ScrollTrigger.refresh();
    }
}