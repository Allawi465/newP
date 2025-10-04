import gsap from "gsap";
import SplitType from 'split-type';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setupLenis } from "../../threeJS";

export default function initLoadingSequence(context) {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    let typeSplit = new SplitType('.hero_title', {
        types: 'words, chars',
        tagName: 'span',
    });

    let typeSplit_2 = new SplitType('.hero_title_2', {
        types: 'words, chars',
        tagName: 'span',
    });

    let typeSplit_3 = new SplitType('.hero_text', {
        types: 'words',
        tagName: 'span',
    });

    const aboutElement = document.querySelector(".about");
    if (aboutElement) {
        aboutElement.classList.remove("transition", "duration-300");
        aboutElement.style.transition = "none";
        aboutElement.style.pointerEvents = 'none';
    }

    const timeline = gsap.timeline({
        duration: 1,
        ease: "power2.inOut",
    });

    timeline.to(context.largeShaderMaterial.uniforms.progress, {
        value: 1,
        duration: 1,
        delay: 2.5,
        ease: "sine.out",
        onUpdate: () => {
            const progress = context.largeShaderMaterial.uniforms.progress.value;
            gsap.to(".loader_screen", {
                opacity: -progress,
                duration: 0.5,
                display: "none"
            });
        },
        onComplete: () => {
            context.isLoading = false;
            setupLenis(context);
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            ScrollTrigger.refresh();
        }
    }, 0).to(context.glassMaterial, {
        opacity: 1.0,
        duration: 0.5,
        ease: "power2.out",
        onUpdate: () => {
            context.glassMaterial.needsUpdate = true;
        }
    }, 3).to(context.material.uniforms.uOpacity, {
        value: 1.0,
        duration: 1.0,
        ease: "power2.out",
        onUpdate: () => {
            context.material.needsUpdate = true;
        },
    }, 3).to(".header", {
        opacity: 1,
        duration: 1,
    }, 3).to(".hero", {
        opacity: 1,
        duration: 1,
    }, 3).to(".about", {
        opacity: 1,
        onComplete: () => {
            if (aboutElement) {
                aboutElement.classList.add("transition-all", "duration-300");
            }
        }
    }, 3).from(
        '.hero_title .char',
        {
            x: "-1em",
            duration: 1.0,
            ease: "power2.out",
            stagger: { amount: 0.2 },
            opacity: 0,
        }, 3
    ).from(
        '.hero_title_2 .char',
        {
            opacity: 0,
            x: "1em",
            duration: 1.0,
            ease: "power2.out",
            stagger: { amount: 0.2 }
        }, 3
    ).from(
        '.line-dot-container .line-top, .line-dot-container .line-bottom',
        {
            height: 0,
            duration: 1.0,
            ease: "power2.out",
            stagger: 0.2
        }, 3
    ).from(
        '.line-dot-container .dot',
        {
            scale: 0,
            opacity: 0,
            duration: 0.4,
            ease: "power2.out"
        }, 3.2
    ).from(
        '.divider_line',
        {
            width: 0,
            duration: 1.0,
            ease: "power2.out"
        }, 3.4
    ).from(
        '.divider_short',
        {
            width: 0,
            duration: 1.0,
            ease: "power2.out"
        }, 3.4
    ).from(
        '.hero_text .word',
        {
            opacity: 0,
            duration: 1.0,
            ease: "power2.out",
            stagger: { amount: 0.5 },
            onComplete: () => {
                if (aboutElement) {
                    aboutElement.style.pointerEvents = 'auto';
                }
            }
        }, 3.6
    ).from(
        '.badges-container .badge-design, .badges-container .badge-code, .badges-container .badge-deploy',
        {
            opacity: 0,
            duration: 1.0,
            ease: "power2.out",
            stagger: { amount: 0.3 },
        }, 4
    ).to(".scroll", {
        opacity: 1,
        duration: 1.0,
        ease: "power2.out"
    }, 4.5).to(".scroll-line", {
        opacity: 1,
        duration: 1.0,
        ease: "power2.out",
    }, 4.5);
}