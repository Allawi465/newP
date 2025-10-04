import gsap from "gsap";
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import setupScrollAnimation from "../../threeJS/scrollstrigger/index.js";

function closeInfoDiv(context) {
    const aboutDiv = document.getElementById('about');

    const isAboutDivOpen = aboutDiv && aboutDiv.classList.contains('show');

    gsap.killTweensOf([
        context.largeShaderMaterial.uniforms.progress,
        ...context.meshArray.map(mesh => mesh.material.uniforms.opacity),
    ]);

    gsap.killTweensOf("*");

    if (isAboutDivOpen) {
        context.tm = aboutCloseTimeline(context);
        gsap.to(aboutDiv, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
                aboutDiv.style.zIndex = 0;
                aboutDiv.classList.remove('show');
                if (context.aboutLenis) {
                    context.aboutLenis.scrollTo(0, { immediate: true });

                    requestAnimationFrame(() => {
                        context.aboutLenis.stop();
                    });
                }

            }
        });
    }

    document.documentElement.classList.remove('canvas-hidden');

    gsap.to(context.largeShaderMaterial.uniforms.progress, {
        value: 1,
        duration: 1.2,
        ease: "sine.out",
    });

    document.getElementById('openAbout').style.opacity = '1';
    document.getElementById('openAbout').style.pointerEvents = 'auto';
    document.getElementById('close').style.opacity = '0';
    document.getElementById('close').style.pointerEvents = 'none';
    document.getElementById('close').style.zIndex = '899';
    gsap.set(".scroll_line", { opacity: 1, "--scaleY": 1 });

    context.startBodyScrolling();
    setupScrollAnimation();
    ScrollTrigger.refresh();

    context.isDivOpen = false;
}


function aboutCloseTimeline(context) {
    return gsap.timeline({})
        .to(".about_wrapper", { opacity: 0, duration: 0.3, ease: "power2.out" },)
        .to(".about-badge", { opacity: 0, duration: 0.3, ease: "power2.out" }, "<")
        .to(".about-heading", { opacity: 0, duration: 0.3, ease: "power2.out" },)
        .to(".about-text", { opacity: 0, duration: 0.3, ease: "power2.out" },)
        .to(".stats_group", { opacity: 0, duration: 0.3, ease: "power2.out" },)
        .to(".header-image", { opacity: 0, duration: 0.3, ease: "power2.out" },)
        .to(".creative_cards", { opacity: 0, duration: 0.3, ease: "power2.out" },)
        .to(".values_section", { opacity: 0, duration: 0.3, ease: "power2.out" },)
        .set("#about", { zIndex: 0 }, ">");
}


export default closeInfoDiv;