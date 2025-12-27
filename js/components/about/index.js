import gsap from "gsap";
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import setupAboutLenis from "./lenis";

const isMobile = window.matchMedia("(max-width: 1023px)").matches;

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
CustomEase.create("customBezier", "0.455, 0.03, 0.515, 0.955");

function showAbout(context) {
    if (context.isLoading || context.isDivOpen || context.isProjectsOpen) return;

    context.isDivOpen = true;

    context.stopBodyScrolling();

    if (!context.aboutLenis) {
        setupAboutLenis(context);
    }

    const aboutDiv = document.getElementById('about');
    aboutDiv.classList.add('show');

    requestAnimationFrame(() => {
        if (context.aboutLenis) {
            context.aboutLenis.scrollTo(0, { immediate: true });
            context.startAboutScrolling();
        }

        reset(context);

        animateProgress(context);
        scrollAnimations(context);

        context.tm = setupTimeline(context);

        gsap.to(aboutDiv, {
            opacity: 1,
            duration: 1,
        });
    });

    setTimeout(() => {
        document.getElementById('openAbout').style.opacity = '0';
        document.getElementById('openAbout').style.pointerEvents = 'none';
        document.getElementById('close').style.opacity = '1';
        document.getElementById('close').style.pointerEvents = 'auto';
        document.getElementById('close').style.zIndex = '999';
    }, 600);
}

export function animateProgress(context) {
    const uniform = context.largeShaderMaterial.uniforms.progress;

    gsap.killTweensOf(uniform);

    gsap.to(uniform, {
        value: 0,
        duration: 1,
        ease: "sine.in",
        onStart: () => {
            context.largePlane.renderOrder = 999;
        }
    });
}


function setupTimeline(context) {
    const timeline = gsap.timeline({});

    timeline
        .from(".about-title", {
            x: "1em",
            duration: 1,
            ease: "power2.out",
            opacity: 0,
        }, 0.5)
        .from(".about-divider-line", {
            scaleX: 0,
            duration: 1.0,
            ease: "power2.out",
        }, 0.5)
        .from(".about-divider-short", {
            scaleX: 0,
            duration: 1.0,
            ease: "power2.out",
        }, isMobile ? 0.8 : 1.)
        .from(".about-text", {
            duration: 1,
            opacity: 0,
            x: -50,
            ease: "power2.out",
        }, isMobile ? 0.8 : 1.)
        .from(".about-badge-link", {
            opacity: 0,
            x: -100,
            stagger: 0.1,
            duration: 1,
            ease: "expo.out"
        }, isMobile ? 1. : 1.2)
        .fromTo(".scroll_about",
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 1, ease: "power2.out" },
            isMobile ? 1.5 : 2.
        );
    return timeline;
}

function scrollAnimations(context) {
    const wrapper = document.querySelector('#about');

    context.journey_title = new SplitText(".journey_h2", { type: "words" });
    context.journey_text = new SplitText(".journey_p", { type: "words" });
    context.scroll = new SplitText(".scroll_about", { type: "words, chars" });

    ScrollTrigger.create({
        trigger: '.journey_section',
        scroller: wrapper,
        start: 'top 75%',
        end: 'top 50%',
        scrub: true,
        animation: gsap.from(context.journey_title.words, {
            opacity: 0,
            duration: 1,
            ease: "sine.out",
            stagger: 0.1,
        })
    });

    ScrollTrigger.create({
        trigger: '.journey_section',
        scroller: wrapper,
        start: 'top 60%',
        end: 'top 50%',
        scrub: true,
        animation: gsap.from(context.journey_text.words, {
            opacity: 0,
            duration: 2,
            ease: "sine.out",
            stagger: 0.1,
        })
    });


    ScrollTrigger.create({
        trigger: '.journey_section',
        scroller: wrapper,
        start: 'top 55%',
        end: 'bottom bottom',
        scrub: true,
        animation: gsap.fromTo(
            '.journey_item',
            {
                borderLeftWidth: 0,
                borderLeftColor: 'rgba(0, 0, 0, 0)',
            },
            {
                borderLeftWidth: 2,
                borderLeftColor: 'rgba(0, 0, 0, 0.1)',
                duration: 1,
                ease: 'power2.out',
                stagger: { amount: 2.0 },
            }
        ),
    });

    ScrollTrigger.create({
        trigger: '.journey_section',
        scroller: wrapper,
        start: 'top 55%',
        end: 'bottom bottom',
        scrub: true,
        animation: gsap.fromTo(
            '.journey_dot',
            { scale: 0, opacity: 0 },
            {
                scale: 1,
                opacity: 1,
                duration: 0.6,
                ease: 'power3.out',
                stagger: { amount: 2.0 },
                delay: 0.2
            }
        )
    });

    ScrollTrigger.create({
        trigger: '.journey_section',
        scroller: wrapper,
        start: 'top 55%',
        end: 'bottom bottom',
        scrub: true,
        animation: gsap.fromTo(
            '.journey_content',
            { opacity: 0, scale: 0.95 },
            {
                opacity: 1,
                scale: 1,
                duration: 0.8,
                ease: 'power3.out',
                stagger: { amount: 2.0 },
                delay: 0.4
            }
        )
    });

    ScrollTrigger.create({
        trigger: ".about_wrapper",
        scroller: wrapper,
        start: "top top",
        end: "top+=120 top",
        scrub: 1,
        animation: gsap.to(context.scroll.chars, {
            color: "rgba(255,255,255,0)",
            stagger: 0.05,
            ease: "customBezier",
        }),
    });

}

function reset(context) {
    gsap.killTweensOf([
        context.largeShaderMaterial.uniforms.progress,
        "#about",
        ".about-title",
        ".about-text",
        ".about-divider-line",
        ".about-divider-short",
        ".about-badge-link",
        ".journey_h2",
        ".scroll_about",
        ".journey_p",
        ".journey_item",
        ".journey_dot",
        ".journey_content",
    ]);

    if (context.scroll && context.scroll.chars) {
        context.scroll.revert();
        context.scroll = null;
    }

    if (context.journey_title) {
        context.journey_title.revert();
        context.journey_title = null;
    }

    if (context.journey_text) {
        context.journey_text.revert();
        context.journey_text = null;
    }

    gsap.set([
        ".about-badge-link",
        ".about-divider-line",
        ".about-divider-short",
        ".about-title",
        ".about-text",
    ], { clearProps: "all" });

    if (context.tm) context.tm.kill();
}

export default showAbout;

