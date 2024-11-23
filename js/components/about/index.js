import gsap from "gsap";
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import { horizontalLoop } from "./animation";

gsap.registerPlugin(ScrollTrigger);

function showAbout(context) {
    gsap.killTweensOf(context.largeShaderMaterial.uniforms.progress);
    context.meshArray.forEach(mesh => gsap.killTweensOf(mesh.material.uniforms.opacity));

    if (context.typeSplit) context.typeSplit.revert();
    if (context.typeSplit_2) context.typeSplit_2.revert();

    gsap.to(context.largeShaderMaterial.uniforms.progress, {
        value: 0,
        duration: 2,
        ease: 'power2.inOut'
    });

    context.meshArray.forEach(mesh => {
        gsap.to(mesh.material.uniforms.opacity, {
            value: 0,
            duration: 0.3,
            onComplete: () => {
                mesh.visible = false;
            }
        });
    });

    context.cssObjects.forEach(meshText => {
        gsap.to(meshText.element, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                meshText.visible = false;
            }
        });
    });

    let typeSplit = new SplitType('.about_headings', {
        types: 'words, chars',
        tagName: 'span',
    });

    let typeSplit_2 = new SplitType('.about_headings2', {
        types: 'words, chars',
        tagName: 'span',
    });


    context.typeSplit = new SplitType('.about_headings', { types: 'words, chars', tagName: 'span' });
    context.typeSplit_2 = new SplitType('.about_headings2', { types: 'words, chars', tagName: 'span' });

    gsap.set(".text_about", { opacity: 0 });
    gsap.set(".contact_info", { opacity: 0 });
    gsap.set(".rolling_h1", { opacity: 0 });
    gsap.set(".skills_text_wrap", { opacity: 0 });
    gsap.set(".skill_container", { opacity: 0 });
    /*     gsap.set(context.material.uniforms.opacity, { opacity: 0 }); */

    if (context.tm) {
        context.tm.kill();
    }

    context.tm = gsap.timeline({});

    context.tm
        .to(".about-parent", {
            opacity: 1,
            ease: "power2.inOut",
        }, 0.5)
        .fromTo(
            '.about_headings .char',
            { opacity: 0, x: "-1em" },
            {
                opacity: 1, x: 0, duration: 0.5,
                ease: "power2.out",
                stagger: { amount: 0.2 },
            },
            0.5
        )
        .fromTo(
            '.about_headings2 .char',
            { opacity: 0, x: "1em" },
            {
                opacity: 1, x: 0, duration: 0.5,
                ease: "power2.out",
                stagger: { amount: 0.2 },
            },
            0.5
        )
        .to(".text_about", {
            opacity: 1,
            duration: 1.1,
            ease: "power2.inOut",
        }, 0.7)
        .to(".contact_info", {
            opacity: 1,
            duration: 1.1,
            ease: "power2.inOut",
        }, 0.9).to(".rolling_h1", {
            opacity: 1,
            duration: 1.1,
            ease: "power2.inOut",
        }, 1).to(context.material.uniforms.opacity, {
            value: 1,
            duration: 2,
            ease: 'power2.inOut',
        }, 0.8).to(".skills_text_wrap", {
            opacity: 1,
            duration: 1.1,
            ease: "power2.inOut",
        }, 1).to(".skill_container", {
            opacity: 1,
            duration: 1.1,
            ease: "power2.inOut",
        }, 1)

    document.getElementById('openAbout').style.display = 'none';
    document.getElementById('close').style.display = 'block';

    const aboutDiv = document.getElementById('about');
    aboutDiv.style.zIndex = 60;
    aboutDiv.classList.add('show');
    gsap.to(aboutDiv, { opacity: 1, duration: 1 });

    context.stopBodyScrolling();
    context.toggleAboutfbo(true);
    context.isDivOpen = true;

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

    gsap.timeline({
        scrollTrigger: {
            trigger: ".skills_headings",
            scroller: "#about",
            start: "top bottom",
            end: "bottom top",
        },
    }).fromTo(
        '.skills_headings_skills .char',
        { opacity: 0, x: "-1em" },
        {
            opacity: 1,
            x: 0,
            duration: 0.5,
            ease: "power2.out",
            stagger: { amount: 0.2 },
        }
    ).fromTo(
        '.skills_headings_and',
        { opacity: 0 },
        {
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
        }, "-=0.5"
    ).fromTo(
        '.skills_headings_expertise .char',
        { opacity: 0, x: "1em" },
        {
            opacity: 1,
            x: 0,
            duration: 0.5,
            ease: "power2.out",
            stagger: { amount: 0.2 },
        },
        "-=0.6"
    ).fromTo(
        '.skills_parf',
        { opacity: 0, y: 50 },
        {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
        }, "-=0.6"
    )

    gsap.utils.toArray('.skill_wraper').forEach((wrapper) => {
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
                    start: "top 100%",
                    end: "top 92%",
                    scrub: true,
                    markers: true,
                },
            }
        );
    });

    ScrollTrigger.refresh();
}

export default showAbout;