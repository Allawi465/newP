import gsap from "gsap";
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

gsap.registerPlugin(ScrollTrigger);

function showAbout(context) {
    if (context.isLoading || context.isDivOpen || context.isProjectsOpen) {
        return;
    }

    reset(context);

    animateProgress(context)

    context.isDivOpen = true;

    context.tm = setupTimeline(context);

    const aboutDiv = document.getElementById('about');
    aboutDiv.style.zIndex = 60
    aboutDiv.classList.add('show');
    gsap.to(aboutDiv, { opacity: 1, duration: 1 });;

    context.stopBodyScrolling();
    context.isDivOpen = true;

    document.getElementById('openAbout').style.display = 'none';
    document.getElementById('close').style.display = 'block';

}

export function animateProgress(context) {
    gsap.to(context.largeShaderMaterial.uniforms.progress, {
        value: 0,
        duration: 1,
        ease: "sine.in",
    });
}

function reset(context) {
    gsap.killTweensOf([
        context.largeShaderMaterial.uniforms.progress,
        ".about-parent",
        ".about_headings .char",
        ".about_headings2 .char",
        ".text_about",
        ".contact_info",
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

    });

    timeline.to(
        ".about-parent",
        { opacity: 1, ease: "power2.inOut" },
        0.5
    );

    timeline.fromTo(
        '.about_headings .char',
        { opacity: 0, x: "-1em" },
        { opacity: 1, x: 0, duration: 0.5, ease: "power2.out", stagger: { amount: 0.1 } },
        0.5
    ).fromTo(
        '.about_headings2 .char',
        { opacity: 0, x: "1em" },
        { opacity: 1, x: 0, duration: 0.5, ease: "power2.out", stagger: { amount: 0.1 } },
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

    return timeline;
}

export default showAbout;