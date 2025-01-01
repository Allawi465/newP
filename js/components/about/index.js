import gsap from "gsap";
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import { horizontalLoop } from "./animation";

gsap.registerPlugin(ScrollTrigger);

function showAbout(context) {

    reset(context);

    context.tm = setupTimeline(context);

    animateProgress(context);

    const aboutDiv = document.getElementById('about');
    aboutDiv.style.zIndex = 60
    aboutDiv.classList.add('show');
    gsap.to(aboutDiv, { opacity: 1, duration: 1 });

    context.aboutLenis.resize();
    setupScrollTriggers(context, aboutDiv);

    context.stopBodyScrolling();
    context.isDivOpen = true;

    document.getElementById('openAbout').style.display = 'none';
    document.getElementById('close').style.display = 'block';
}


export function animateProgress(context) {
    gsap.to(context.largeShaderMaterial.uniforms.progress, {
        value: 0,
        duration: 2,
        ease: 'power2.inOut',
        onUpdate: () => {
            const progress = context.largeShaderMaterial.uniforms.progress.value;

            context.cssObjects.forEach(meshText => {
                const domElement = meshText.element;
                domElement.style.opacity = progress;
            });
        },
    });
}

function reset(context) {
    gsap.killTweensOf([
        context.largeShaderMaterial.uniforms.progress,
        context.material.uniforms.opacity,
        ".about-parent",
        ".about_headings .char",
        ".about_headings2 .char",
        ".text_about",
        ".contact_info",
        ".title_play",
        ".skills_text_wrap",
        ".skill_container"
    ]);

    if (context.tm) context.tm.kill();
}


// Helper: Setup main timeline
function setupTimeline(context) {
    if (context.typeSplit) context.typeSplit.revert();
    if (context.typeSplit_2) context.typeSplit_2.revert();

    context.typeSplit = new SplitType('.about_headings', { types: 'words, chars', tagName: 'span' });
    context.typeSplit_2 = new SplitType('.about_headings2', { types: 'words, chars', tagName: 'span' });

    const timeline = gsap.timeline({
        onStart: () => {
            context.toggleAboutfbo(true);
        },
    });


    timeline.to(context.largeShaderMaterial.uniforms.progress, {
        value: 0,
        duration: 2,
        ease: 'power2.inOut',
    });


    timeline.to(
        ".about-parent",
        { opacity: 1, ease: "power2.inOut" },
        0.8
    );


    timeline.fromTo(
        '.about_headings .char',
        { opacity: 0, x: "-1em" },
        { opacity: 1, x: 0, duration: 0.5, ease: "power2.out", stagger: { amount: 0.2 } },
        0.8
    ).fromTo(
        '.about_headings2 .char',
        { opacity: 0, x: "1em" },
        { opacity: 1, x: 0, duration: 0.5, ease: "power2.out", stagger: { amount: 0.2 } },
        0.8
    ).fromTo(
        '.text_about',
        { opacity: 0, },
        { opacity: 1, duration: 1.1, ease: "power2.inOut" },
        0.7
    ).fromTo(
        '.contact_info',
        { opacity: 0, },
        { opacity: 1, duration: 1.1, ease: "power2.inOut" },
        0.9
    ).fromTo(
        '.title_play',
        { opacity: 0, },
        { opacity: 1, duration: 1.1, ease: "power2.inOut" },
        1
    )

    timeline.to(context.material.uniforms.opacity, {
        value: 1,
        duration: 2,
        ease: 'power2.inOut',
    }, 0.8);

    timeline.to(".skills_text_wrap", { opacity: 1, duration: 1.1, ease: "power2.inOut" }, 1);
    timeline.to(".skill_container", { opacity: 1, duration: 1.1, ease: "power2.inOut" }, 1);

    return timeline;
}

// Helper: Setup scroll triggers
function setupScrollTriggers(context, aboutDiv) {
    const boxes = gsap.utils.toArray(".rolling_h1");
    if (!context.tl) {
        context.tl = horizontalLoop(boxes, { repeat: -1, speed: 0.8 });
    } else {
        context.tl.restart(true);
    }

    const titlePlayElement = document.querySelector(".title_play");
    let speedTween;

    ScrollTrigger.create({
        scroller: aboutDiv,
        trigger: titlePlayElement,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
            if (speedTween) speedTween.kill();
            speedTween = gsap.timeline()
                .to(context.tl, { timeScale: 3 * self.direction, duration: 0.25 })
                .to(context.tl, { timeScale: 1 * self.direction, duration: 1.5 }, "+=0.5");
        },
    });

    const skillsSplit = new SplitType('.skills_headings_skills', { types: 'words, chars', tagName: 'span' });
    const expertiseSplit = new SplitType('.skills_headings_expertise', { types: 'words, chars', tagName: 'span' });

    // Animate skill headings and wrappers
    gsap.timeline({
        scrollTrigger: {
            trigger: ".skills_headings",
            scroller: "#about",
            start: "top bottom",
            end: "bottom top",
        },
    })
        .fromTo(
            '.skills_headings_skills .char',
            { opacity: 0, x: "-1em" },
            { opacity: 1, x: 0, duration: 0.5, ease: "power2.out", stagger: { amount: 0.2 } }
        )
        .fromTo('.skills_headings_and', { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" }, "-=0.5")
        .fromTo(
            '.skills_headings_expertise .char',
            { opacity: 0, x: "1em" },
            { opacity: 1, x: 0, duration: 0.5, ease: "power2.out", stagger: { amount: 0.2 } },
            "-=0.6"
        )
        .fromTo(
            '.skills_parf',
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
            "-=0.6"
        );

    gsap.utils.toArray('.skill_wraper').forEach(wrapper => {
        const isMobile = window.innerWidth <= 768; // Detect mobile

        gsap.fromTo(
            wrapper,
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power2.inOut",
                scrollTrigger: {
                    trigger: wrapper,
                    scroller: "#about",
                    start: isMobile ? "top 90%" : "top 100%",
                    end: isMobile ? "top 85%" : "top 92%",
                    scrub: true,
                    invalidateOnRefresh: true, // Fixes resizing issues
                },
            }
        );
    });
}

export default showAbout;