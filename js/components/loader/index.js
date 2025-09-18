import gsap from "gsap";
import SplitType from 'split-type';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.normalizeScroll(true);

export default function initLoadingSequence(context) {

    context.bodyLenis.scrollTo(0, { immediate: true });

    let typeSplit = new SplitType('.hero_heading', {
        types: 'words, chars',
        tagName: 'span',
    });

    let typeSplit_2 = new SplitType('.hero_heading2', {
        types: 'words, chars',
        tagName: 'span',
    });

    const timeline = gsap.timeline({
        duration: 1,
        ease: "power2.inOut",
    });

    timeline.to("#canvas", {
        zIndex: 50
    },).to(context.largeShaderMaterial.uniforms.progress, {
        value: 1,
        duration: 1,
        delay: 2.5,
        ease: "sine.out",
        onUpdate: () => {
            const progress = context.largeShaderMaterial.uniforms.progress.value;

            gsap.to(".panel", {
                opacity: -progress,
                duration: 0.5,
            })
        },
    }, 0).to(".header ", {
        opacity: 1,
        duration: 1,
    }, 3).to(".about ", {
        opacity: 1,
        visibility: "visible",
    }, 3).to(".hero-parent", {
        opacity: 1,
    }, 3).from(
        '.hero_heading .char',
        {
            x: "-1em", duration: 0.6, ease: "power2.out", stagger: { amount: 0.2 }, opacity: 0,
        }, 3
    ).from(
        '.hero_heading2 .char',
        {
            opacity: 0, x: "1em", duration: 0.6, ease: "power2.out", stagger: { amount: 0.2 }
        }, 3
    ).to(".text_hero", {
        opacity: 1,
    }, 3).to(".scroll ", {
        opacity: 1,

    }, 3).to(".scroll-line ", {
        opacity: 1,
    }, 3).to(context.glassMaterial, {
        opacity: 1.0,
        duration: 0.5,
        ease: "power2.out",
        onUpdate: () => {
            context.glassMaterial.needsUpdate = true;
        }
    }, 3).to(context.material.uniforms.uOpacity, {
        value: 1.0,
        duration: 0.5,
        ease: "power2.out",
        onUpdate: () => {
            context.material.needsUpdate = true;
        },
        onComplete: () => {
            context.isLoading = false;
            context.startBodyScrolling();
            ScrollTrigger.refresh();
        },
    }, 3);
}