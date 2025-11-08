import gsap from "gsap";
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from "gsap/SplitText";
import setupScrollAnimation from "../../threeJS/scrollstrigger";
import { CustomEase } from "gsap/CustomEase";
import setupAboutLenis from "./lenis";

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
CustomEase.create("customBezier", "0.455, 0.03, 0.515, 0.955");

function showAbout(context) {
    if (context.isLoading || context.isDivOpen || context.isProjectsOpen) return;

    context.stopBodyScrolling();

    if (!context.aboutLenis) {
        setupAboutLenis(context);
    }

    const aboutDiv = document.getElementById('about');
    aboutDiv.classList.add('show');

    requestAnimationFrame(() => {
        if (context.aboutLenis) {
            context.aboutLenis.resize();
            context.aboutLenis.scrollTo(0, { immediate: true });
            context.aboutLenis.start();
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

    ScrollTrigger.refresh(true);
    setupScrollAnimation(context);

}

export function animateProgress(context) {

    gsap.killTweensOf(context.largeShaderMaterial.uniforms.progress);

    gsap.to(context.largeShaderMaterial.uniforms.progress, {
        value: 0,
        duration: 1,
        ease: "sine.in",
    });
}

function reset(context) {
    gsap.killTweensOf([
        context.largeShaderMaterial.uniforms.progress,
        "#about",
        ".about-title",
        ".about-text",
        ".about-line-top",
        ".about-divider-line",
        ".about-divider-short",
        ".about-badge-link",
        ".scroll_about",
        ".journey_h2",
        ".journey_p",
        ".journey_item",
        ".journey_dot",
        ".journey_content",
    ]);

    if (context.title) {
        context.title.revert();
        context.title = null;
    }

    if (context.splits.aboutText) {
        context.splits.aboutText.revert();
        context.splits.aboutText = null;
    }

    if (context.scroll && context.scroll.chars) {
        gsap.set(context.scroll.chars, { color: "rgba(0, 0, 0, 1)" });
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
    ], { clearProps: "all" });

    gsap.killTweensOf("*");
    if (context.tm) context.tm.kill();
}

function setupTimeline(context) {
    const timeline = gsap.timeline({});

    context.title = new SplitText(".about-title", { type: ",words, chars" });
    context.splits.aboutText = SplitText.create(".about-text", { type: "chars, words, lines" });
    context.scroll = new SplitText(".scroll_about", { type: "words, chars, lines" });

    timeline
        .from(context.title.chars, {
            y: -100,
            opacity: 0,
            rotation: "random(-80, 80)",
            stagger: 0.1,
            duration: 1,
            ease: "back"
        }, 0.5)
        .from(".about-line-top", {
            height: 0,
            duration: 1.0,
            ease: "power2.out",
            stagger: 0.2,
        }, 0.5)
        .from(".about-divider-line", {
            width: 0,
            duration: 1.0,
            ease: "power2.out",
        }, 0.8)
        .from(".about-divider-short", {
            width: 0,
            duration: 1.0,
            ease: "power2.out",
        }, 0.8)
        .from(context.splits.aboutText.lines, {
            duration: 0.6,
            yPercent: 100,
            opacity: 0,
            stagger: 0.1,
            ease: "expo.out",
        }, 0.8)
        .from(".about-badge-link", {
            y: 100,
            opacity: 0,
            rotation: "random(-80, 80)",
            stagger: 0.1,
            duration: 1,
            ease: "back",
        }, 1)
        .fromTo(".scroll_about",
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 1, ease: "power2.out" },
            1
        )
        .to(context.scroll.chars, {
            color: "rgba(0, 0, 0, 0.1)",
            repeat: -1,
            yoyo: true,
            duration: 1.2,
            ease: "customBezier",
            stagger: {
                each: 0.1,
                repeat: -1,
                yoyo: true
            },
            delay: 2.0
        }, 1);


    return timeline;
}

function scrollAnimations(context) {
    const wrapper = document.querySelector('#about');

    context.journey_title = new SplitText(".journey_h2", { type: "words" });
    context.journey_text = new SplitText(".journey_p", { type: "words" });

    ScrollTrigger.create({
        trigger: '.journey_section',
        scroller: wrapper,
        start: 'top 80%',
        end: 'top 30%',
        scrub: 1,
        animation: gsap.from(context.journey_title.words, {
            y: -100,
            opacity: 0,
            rotation: () => gsap.utils.random(-80, 80),
            stagger: 0.1,
            duration: 1,
            ease: "back"
        })
    });

    ScrollTrigger.create({
        trigger: '.journey_section',
        scroller: wrapper,
        start: 'top 80%',
        end: 'top 30%',
        scrub: 1,
        animation: gsap.from(context.journey_text.words, {
            y: 100,
            opacity: 0,
            rotation: () => gsap.utils.random(-80, 80),
            stagger: 0.1,
            duration: 1,
            ease: "back"
        })
    });


    ScrollTrigger.create({
        trigger: '.journey_section',
        scroller: wrapper,
        start: 'top 70%',
        end: 'bottom bottom',
        scrub: 1,
        markers: false,
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
        start: 'top 70%',
        end: 'bottom bottom',
        scrub: 1,
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
        start: 'top 70%',
        end: 'bottom bottom',
        scrub: 1,
        animation: gsap.fromTo(
            '.journey_content',
            { opacity: 0, x: 30, scale: 0.95 },
            {
                opacity: 1,
                x: 0,
                scale: 1,
                duration: 0.8,
                ease: 'power3.out',
                stagger: { amount: 2.0 },
                delay: 0.4
            }
        )
    });

}

export default showAbout; 