import gsap from "gsap";
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

gsap.registerPlugin(ScrollTrigger);

function showAbout(context) {
    if (context.isLoading || context.isDivOpen || context.isProjectsOpen) {
        return;
    }

    reset(context);

    context.tm = setupTimeline(context);

    document.getElementsByClassName('.projects__title').mixBlendMode = "normal";

    animateProgress(context);

    const aboutDiv = document.getElementById('about');
    aboutDiv.style.zIndex = 60
    aboutDiv.classList.add('show');
    gsap.to(aboutDiv, { opacity: 1, duration: 1 });

    context.aboutLenis.resize();
    setupScrollTriggers();

    context.stopBodyScrolling();
    context.isDivOpen = true;

    document.getElementById('openAbout').style.display = 'none';
    document.getElementById('close').style.display = 'block';

}

export function animateProgress(context) {
    gsap.to(context.largeShaderMaterial.uniforms.progress, {
        value: 0,
        duration: 1.1,
        ease: "sine.in",
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

    gsap.killTweensOf("*");

    if (context.tm) context.tm.kill();
}


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

    timeline.to(
        ".about-parent",
        { opacity: 1, ease: "power2.inOut" },
        0.5
    );

    timeline.fromTo(
        '.about_headings .char',
        { opacity: 0, x: "-1em" },
        { opacity: 1, x: 0, duration: 0.5, ease: "power2.out", stagger: { amount: 0.2 } },
        0.5
    ).fromTo(
        '.about_headings2 .char',
        { opacity: 0, x: "1em" },
        { opacity: 1, x: 0, duration: 0.5, ease: "power2.out", stagger: { amount: 0.2 } },
        0.5
    ).fromTo(
        '.text_about',
        { opacity: 0, },
        { opacity: 1, duration: 1, ease: "power2.inOut" },
        0.5
    ).fromTo(
        '.contact_info',
        { opacity: 0, },
        { opacity: 1, duration: 1, ease: "power2.inOut" },
        0.5
    )

    timeline.to(context.material.uniforms.opacity, {
        value: 1,
        duration: 1,
        ease: 'power2.inOut',
    }, 0.5);

    timeline.to(".skills_text_wrap", { opacity: 1, duration: 1, ease: "power2.inOut" }, 0.5);
    timeline.to(".skill_container", { opacity: 1, duration: 1, ease: "power2.inOut" }, 0.5);

    return timeline;
}

function setupScrollTriggers() {

    const skillsSplit = new SplitType('.skills_headings_skills', { types: 'words, chars', tagName: 'span' });
    const expertiseSplit = new SplitType('.skills_headings_expertise', { types: 'words, chars', tagName: 'span' });

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
        gsap.fromTo(
            wrapper,
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: wrapper,
                    scroller: "#about",
                    start: "top 96%",
                },
            }
        );
    });
}

export default showAbout;