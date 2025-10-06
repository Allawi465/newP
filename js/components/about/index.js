import gsap from "gsap";
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setupAboutLenis } from "./lenis";
import SplitType from "split-type";

gsap.registerPlugin(ScrollTrigger);

const creativeCards = document.querySelectorAll(".creative_cards");
const valuesCards = document.querySelectorAll(".values_section");

function showAbout(context) {
    if (context.isLoading || context.isDivOpen || context.isProjectsOpen) return;

    context.stopBodyScrolling?.();

    if (!context.aboutLenis) {
        setupAboutLenis(context);
    }

    const aboutDiv = document.getElementById('about');
    aboutDiv.classList.add('show');
    aboutDiv.style.display = "block"

    requestAnimationFrame(() => {
        if (context.aboutLenis) {
            context.aboutLenis.resize();
            context.aboutLenis.scrollTo(0, { immediate: true });
            context.aboutLenis.start();
        }

        reset(context);

        animateProgress(context);
        setupScrollAnimations();

        context.tm = setupTimeline(context);

        gsap.to(aboutDiv, {
            opacity: 1,
            duration: 1,
            onComplete: () => {
                ScrollTrigger.refresh();
            }
        });
    });

    context.isDivOpen = true;

    setTimeout(() => {
        document.getElementById('openAbout').style.opacity = '0';
        document.getElementById('openAbout').style.pointerEvents = 'none';
        document.getElementById('close').style.opacity = '1';
        document.getElementById('close').style.pointerEvents = 'auto';
        document.getElementById('close').style.zIndex = '35';
    }, 600);
}

export function animateProgress(context) {
    gsap.to(context.largeShaderMaterial.uniforms.progress, {
        value: 0,
        duration: 1,
        ease: "sine.in",
        onComplete: () => {
            document.documentElement.classList.add('canvas-hidden');

        }
    });
}

function reset(context) {
    gsap.killTweensOf([
        context.largeShaderMaterial.uniforms.progress,
        ".about_wrapper",
        ".about-badge",
        ".about-heading",
        ".about-text",
        ".stats_group",
        ".header-image",
        ".creative_cards",
        ".values_section",
    ]);

    gsap.killTweensOf("*");

    creativeCards.forEach(card => {
        card.classList.remove("transition", "duration-300");
        card.style.transition = "none";
    });

    valuesCards.forEach(card => {
        card.classList.remove("transition", "duration-300");
        card.style.transition = "none";
    });

    if (context.tm) context.tm.kill();
}

function setupTimeline(context) {
    const timeline = gsap.timeline({});

    timeline
        .to(".about_wrapper", {
            opacity: 1,
            ease: "power2.inOut",
            duration: 0.5,
            delay: 0.5,
        },)
        .fromTo(
            [".about-badge", ".about-heading", ".about-text"],
            {
                opacity: 0,
                y: 30
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: "power2.out",
                stagger: 0.1
            },
            0.8
        )
        .fromTo(
            ".stats_group",
            {
                opacity: 0,
                y: 50
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: "power2.out",
                stagger: 0.1
            },
            1.2
        ).fromTo(
            ".header-image",
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
            1.4
        ).fromTo(
            ".creative_cards",
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power3.out",
                stagger: 0.1,
                onComplete: () => {
                    creativeCards.forEach(card => {
                        card.classList.add("transition-all", "duration-300");
                    });
                }
            },
            1.6
        ).fromTo(
            ".values_section",
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power3.out",
                stagger: 0.1,
                onComplete: () => {
                    valuesCards.forEach(card => {
                        card.classList.add("transition-all", "duration-300");
                    });
                }
            },
            1.8
        );

    return timeline;
}

function setupScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    const wrapper = document.querySelector('#about');
    if (!wrapper) {
        console.error('Wrapper element #about not found');
        return;
    }

    const typeSplitH2 = new SplitType('.skills_h2', { types: 'chars', tagName: 'span' });
    const typeSplitP = new SplitType('.skills_p', { types: 'words', tagName: 'span' });
    const typeSplitJourneyH2 = new SplitType('.journey_h2', { types: 'chars', tagName: 'span' });
    const typeSplitJourneyP = new SplitType('.journey_p', { types: 'words', tagName: 'span' });

    ScrollTrigger.create({
        trigger: '.skills_section',
        scroller: wrapper,
        start: 'top 60%',
        end: 'top 30%',
        scrub: 1,
        markers: false,
        scrub: true,
        animation: gsap.fromTo(
            '.skills_h2 .char',
            { opacity: 0, x: '-1em' },
            {
                opacity: 1,
                x: 0,
                duration: 0.6,
                ease: 'power2.out',
                stagger: { amount: 0.2 },
                delay: 0.5
            }
        )
    });

    ScrollTrigger.create({
        trigger: '.skills_section',
        scroller: wrapper,
        start: 'top 60%',
        end: 'top 30%',
        scrub: 1,
        markers: false,
        scrub: true,
        animation: gsap.fromTo(
            '.skills_p .word',
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: 'power2.inOut',
                stagger: { amount: 0.5 }
            }
        )
    });

    ScrollTrigger.create({
        trigger: '.skills_section',
        scroller: wrapper,
        start: 'top 50%',
        end: 'top 30%',
        scrub: 1,
        scrub: true,
        animation: gsap.fromTo(
            '.skill_card',
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power2.inOut',
                stagger: 1,
            }
        )
    });

    ScrollTrigger.create({
        trigger: '.journey_section',
        scroller: wrapper,
        start: 'top 75%',
        end: 'top 60%',
        scrub: 1,
        markers: false,
        animation: gsap.fromTo(
            '.journey_h2 .char',
            { opacity: 0, x: '-1em' },
            {
                opacity: 1,
                x: 0,
                duration: 0.6,
                ease: 'power2.out',
                stagger: { amount: 0.2 },
                delay: 0
            }
        )
    });

    ScrollTrigger.create({
        trigger: '.journey_section',
        scroller: wrapper,
        start: 'top 75%',
        end: 'top 60%',
        scrub: 1,
        markers: false,
        animation: gsap.fromTo(
            '.journey_p .word',
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: 'power2.out',
                stagger: { amount: 0.3 },
                delay: 0.2
            }
        )
    });

    ScrollTrigger.create({
        trigger: '.journey_section',
        scroller: wrapper,
        start: 'top 60%',
        end: 'bottom 30%',
        scrub: 1,
        markers: false,
        animation: gsap.fromTo(
            '.journey_item',
            { borderLeftWidth: 0 },
            {
                borderLeftWidth: 2,
                duration: 1,
                ease: 'power2.out',
                stagger: { amount: 0.6 }
            }
        )
    });

    ScrollTrigger.create({
        trigger: '.journey_section',
        scroller: wrapper,
        start: 'top 60%',
        end: 'bottom 30%',
        scrub: 1,
        markers: false,
        animation: gsap.fromTo(
            '.journey_dot',
            { scale: 0, opacity: 0 },
            {
                scale: 1,
                opacity: 1,
                duration: 0.6,
                ease: 'power3.out',
                stagger: { amount: 0.3 },
                delay: 0.2
            }
        )
    });

    ScrollTrigger.create({
        trigger: '.journey_section',
        scroller: wrapper,
        start: 'top 60%',
        end: 'bottom 30%',
        scrub: 1,
        markers: false,
        animation: gsap.fromTo(
            '.journey_content',
            { opacity: 0, x: 30, scale: 0.95 },
            {
                opacity: 1,
                x: 0,
                scale: 1,
                duration: 0.8,
                ease: 'power3.out',
                stagger: { amount: 0.4 },
                delay: 0.4
            }
        )
    });

    const typeSplitCtaH2 = new SplitType('.cta_h2', { types: 'chars', tagName: 'span' });
    const typeSplitCtaP = new SplitType('.cta_p', { types: 'words', tagName: 'span' });

    ScrollTrigger.create({
        trigger: '.cta_section',
        scroller: wrapper,
        start: 'top 90%',
        end: 'top 60%',
        scrub: 1,
        markers: false,
        animation: gsap.fromTo(
            '.cta_h2 .char',
            { opacity: 0, x: '-1em' },
            {
                opacity: 1,
                x: 0,
                duration: 0.6,
                ease: 'power2.out',
                stagger: { amount: 0.2 },
                delay: 0
            }
        )
    });

    ScrollTrigger.create({
        trigger: '.cta_section',
        scroller: wrapper,
        start: 'top 90%',
        end: 'top 60%',
        scrub: 1,
        markers: false,
        animation: gsap.fromTo(
            '.cta_p .word',
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: 'power2.out',
                stagger: { amount: 0.3 },
                delay: 0.2
            }
        )
    });

    ScrollTrigger.create({
        trigger: '.cta_section',
        scroller: wrapper,
        start: 'top 75%',
        end: 'top 70%',
        scrub: 1,
        animation: gsap.fromTo(
            '.cta_button',
            { opacity: 0, y: 50, scale: 0.9 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.8,
                ease: 'power3.out',
                stagger: { amount: 0.2 },
            }
        )
    });

}

export default showAbout;