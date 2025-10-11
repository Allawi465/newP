import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap';

export default function setupLenis(context) {

    const lenis = new Lenis({
        wrapper: document.documentElement,
        content: document.body,
        lerp: 0.12,
        syncTouch: false,
        touchMultiplier: 2.0,
        autoToggle: true,
        autoRaf: false,
        infinite: false
    });

    context.bodyLenis = lenis;

    lenis.on('scroll', ScrollTrigger.update)

    // drive Lenis with GSAP’s ticker
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    ;

    // ScrollTrigger proxy
    ScrollTrigger.scrollerProxy(document.documentElement, {
        scrollTop(value) {
            if (arguments.length) {
                lenis.scrollTo(value, { immediate: true });
            }
            return lenis.scroll;
        },
        getBoundingClientRect() {
            return { top: 0, left: 0, width: innerWidth, height: innerHeight };
        },
        pinType: document.documentElement.style.transform ? 'transform' : 'fixed',
    });

    lenis.scrollTo(0, { immediate: true });
    ScrollTrigger.refresh();

    context.startBodyScrolling = () => lenis.start();
    context.stopBodyScrolling = () => lenis.stop();

    return lenis;
}