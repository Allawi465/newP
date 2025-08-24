import gsap from "gsap";
import SplitType from 'split-type';
import { ScrollTrigger } from 'gsap/ScrollTrigger';


gsap.registerPlugin(ScrollTrigger);

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

    timeline.add(() => animateCounters(), 0);

    timeline.to("#canvas", {
        zIndex: 50
    },).to(context.largeShaderMaterial.uniforms.progress, {
        value: 1,
        duration: 1,
        delay: 2.5,
        ease: "sine.out",
        onUpdate: () => {
            const progress = context.largeShaderMaterial.uniforms.progress.value;

            gsap.to(".counter", {
                opacity: -progress,
                duration: 1,
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
    }, 3).fromTo(
        '.hero_heading .char',
        {
            opacity: 0,
            x: "-1em"
        },
        {
            opacity: 1,
            x: 0,
            duration: 0.5,
            ease: "power2.out",
            stagger: { amount: 0.2 },
        }, 3
    ).fromTo(
        '.hero_heading2 .char',
        {
            opacity: 0,
            x: "1em"
        },
        {
            opacity: 1,
            x: 0,
            duration: 0.5,
            ease: "power2.out",
            stagger: { amount: 0.2 },
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

export const animateCounters = () => {
    return new Promise((resolve) => {
        const tl = gsap.timeline({ onComplete: resolve });

        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 10; j++) {
                const div = document.createElement('div');
                div.className = 'num';
                div.textContent = j;
                document.querySelector('.counter-3').appendChild(div);
            }
        }

        const finalDiv = document.createElement('div');
        finalDiv.className = 'num';
        finalDiv.textContent = '0';
        document.querySelector('.counter-3').appendChild(finalDiv);

        function animate(counter, duration, delay = 0) {
            const numHeight = document.querySelector(counter + ' .num').clientHeight;
            const totalDistance =
                (document.querySelectorAll(counter + ' .num').length - 1) * numHeight;

            return gsap.to(counter, {
                duration: duration,
                delay: delay,
                y: -totalDistance,
                ease: 'power2.inOut',
            });
        }

        tl.add(animate('.counter-3', 1.5), 0)
            .add(animate('.counter-2', 2.5), '<')
            .add(animate('.counter-1', 1.5, 1), '<')
            .to('.num', {
                duration: 0.5,
                opacity: 0,
                delay: 1.,
                ease: 'power2.out',
            }, '<').to('.counter_percent', {
                duration: 0.5,
                opacity: 0,
                ease: 'power2.out',
            }, '<');
    });
};