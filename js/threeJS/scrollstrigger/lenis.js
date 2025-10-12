import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap';

export default function setupLenis(context) {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const ua = navigator.userAgent.toLowerCase();
    const isFirefox = ua.includes("firefox");

    // --- Mobile or touch devices: use native scroll ---
    if (isTouch) {
        console.log("Touch device: using native scroll");

        const scroller = isFirefox ? document.documentElement : document.body;

        ScrollTrigger.scrollerProxy(scroller, {
            scrollTop(value) {
                if (arguments.length) scroller.scrollTop = value;
                return scroller.scrollTop;
            },
            getBoundingClientRect() {
                return {
                    top: 0,
                    left: 0,
                    width: window.innerWidth,
                    height: window.innerHeight
                };
            },
            pinType: "fixed",
        });

        // Update ScrollTrigger on native scroll
        window.addEventListener("scroll", () => ScrollTrigger.update(), { passive: true });

        ScrollTrigger.refresh();
        context.bodyLenis = null;
        return null;
    }

    // --- Desktop: Lenis + GSAP integration ---
    const lenis = new Lenis({
        wrapper: document.documentElement,
        content: document.body,
        lerp: 0.1,
        syncTouch: false, // don’t override touch here
        autoRaf: false,
        touchMultiplier: 1.0,
    });

    context.bodyLenis = lenis;

    // Update ScrollTrigger when Lenis scrolls
    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.scrollerProxy(document.documentElement, {
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

    ScrollTrigger.refresh();
    return lenis;
}