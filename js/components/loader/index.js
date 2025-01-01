import gsap from "gsap";
import SplitType from 'split-type';

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

        tl.add(animate('.counter-3', 2.5), 0)
            .add(animate('.counter-2', 3), '<')
            .add(animate('.counter-1', 2, 1.2), '<');
    });
};


export default function initLoadingSequence(context) {

    let typeSplit = new SplitType('.hero_heading', {
        types: 'words, chars',
        tagName: 'span',
    });

    let typeSplit_2 = new SplitType('.hero_heading2', {
        types: 'words, chars',
        tagName: 'span',
    });


    context.stopBodyScrolling();
    const timeline = gsap.timeline({
        duration: 1.1,          // Default duration
        ease: "power2.inOut",   // Default ease
    });

    // Step 1: Animate the counter
    timeline.add(() => animateCounters(), 0);

    timeline.to("#canvas", {
        zIndex: 50
    }, 2.1).to(context.largeShaderMaterial.uniforms.progress, {
        value: 1,
        duration: 2,
        ease: "power2.inOut",
    });

    timeline.to(".loading_logo", {
        opacity: 0,
        duration: 1.1,
        ease: "power2.inOut"
    }, 3).to(".logo_section ", {
        opacity: 0,
        duration: 1.1,
        ease: "power2.inOut"
    }, 3).to(".counter", {
        opacity: 0,
        duration: 1.1,
        ease: "power2.inOut"
    }, 3).to(".header ", {
        opacity: 1,
        duration: 1.1,
        ease: "power2.inOut"
    }, 4.1).to(".about ", {
        opacity: 1,
        duration: 1.1,
        ease: "power2.inOut"
    }, 4.2).to(".hero-parent", {
        opacity: 1,
        ease: "power2.inOut",
    }, 4.2).fromTo(
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
        }, 4.5
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
        }, 4.5
    ).to(".text_hero", {
        opacity: 1,
        duration: 1.1,
        ease: "power2.inOut",
    }, 4.7).to(".scroll ", {
        opacity: 1,
        ease: "power2.inOut",
    }, 4.8).to(".scroll-line ", {
        opacity: 1,
        ease: "power2.inOut",
    }, 4.8)

    timeline.eventCallback("onComplete", () => {
        context.startBodyScrolling();

    });
}