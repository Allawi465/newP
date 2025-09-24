import gsap from "gsap";
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

gsap.registerPlugin(ScrollTrigger);

function showAbout(context) {
    if (context.isLoading || context.isDivOpen || context.isProjectsOpen) {
        return;
    }

    context.stopBodyScrolling();

    reset(context);

    animateProgress(context)

    context.tm = setupTimeline(context);

    const aboutDiv = document.getElementById('about');
    aboutDiv.style.zIndex = 200
    aboutDiv.classList.add('show');
    gsap.to(aboutDiv, { opacity: 1, duration: 1 });;

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

    timeline.from(
        '.about_headings .char',
        { x: "-1em", duration: 0.6, ease: "power2.out", stagger: { amount: 0.2 }, opacity: 0, },
        0.5
    ).from(
        '.about_headings2 .char',
        { x: "1em", duration: 0.6, ease: "power2.out", stagger: { amount: 0.2 }, opacity: 0, },
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