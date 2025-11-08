import gsap from "gsap";
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import setupScrollAnimation from "../../threeJS/scrollstrigger/index.js";

gsap.registerPlugin(ScrollTrigger);


function closeInfoDiv(context) {
    const aboutDiv = document.getElementById('about');
    const isAboutDivOpen = aboutDiv;

    gsap.killTweensOf([
        context.largeShaderMaterial.uniforms.progress,
    ]);

    gsap.killTweensOf("*");

    if (isAboutDivOpen) {
        gsap.to(aboutDiv, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                if (context.aboutLenis) {
                    context.aboutLenis.scrollTo(0, { immediate: true });
                    requestAnimationFrame(() => {
                        context.aboutLenis.stop();
                    });
                } else {
                    if (aboutDiv) aboutDiv.scrollTo({ top: 0, behavior: 'instant' });
                }
                aboutDiv.classList.remove('show');
            }
        });
    }

    gsap.to(context.largeShaderMaterial.uniforms.progress, {
        value: 1,
        duration: 1.2,
        ease: "sine.out",
        overwrite: "auto",
    });

    document.getElementById('openAbout').style.opacity = '1';
    document.getElementById('openAbout').style.pointerEvents = 'auto';
    document.getElementById('close').style.opacity = '0';
    document.getElementById('close').style.pointerEvents = 'none';
    document.getElementById('close').style.zIndex = '0';
    gsap.set(".scroll_line", { opacity: 1, "--scaleY": 1 });

    context.startBodyScrolling();
    setupScrollAnimation();
    ScrollTrigger.refresh();

    context.isDivOpen = false;
}

export default closeInfoDiv;