import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap';

export default function setupLenis(context) {
    const lenis = new Lenis({
        wrapper: document.documentElement,
        content: document.body,
        lerp: 0.12,
        syncTouch: false,
        autoToggle: true,
        autoRaf: true,
    });

    context.bodyLenis = lenis;

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));

    gsap.ticker.lagSmoothing(0);


    context.startBodyScrolling = () => lenis.start();
    context.stopBodyScrolling = () => lenis.stop();

    return lenis;
}