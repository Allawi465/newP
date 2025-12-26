import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { loadingContainer } from "./loading";

export default function initLoadingSequence(context) {
    gsap.registerPlugin(SplitText);

    const aboutElement = document.querySelector(".about");
    if (aboutElement) {
        aboutElement.style.pointerEvents = 'none';
    }

    const timeline = gsap.timeline({});

    document.fonts.ready.then(() => {

        const title = new SplitText(".hero_title", { type: ",words, chars" });
        const title_2 = new SplitText(".hero_title_2", { type: "words, chars" });
        context.splits.heroText = SplitText.create(".hero_text", { type: "chars, words, lines" });

        timeline.to(context.largeShaderMaterial.uniforms.progress, {
            value: 1,
            duration: 1,
            ease: "sine.out",
            onStart: () => {
                context.largePlane.renderOrder = 999;
            },
            onUpdate: () => {
                const progress = context.largeShaderMaterial.uniforms.progress.value;
                gsap.to(loadingContainer, {
                    opacity: -progress,
                    duration: 0.5,
                    display: "none"
                });
            },
            onComplete: () => {
                context.startBodyScrolling();
                context.isLoading = false;
                document.documentElement.style.overflow = '';
                document.body.style.overflow = '';
            }
        }, 0)
            .to(".header", {
                opacity: 1,
                duration: 1,
            }, 0.5)
            .to(".hero", {
                opacity: 1,
                duration: 1,
            }, 0.5)
            .to(".about", {
                opacity: 1,
                duration: 1,
            }, 0.5)
            .to(context.glassMaterial, {
                opacity: 1.0,
                duration: 0.5,
                ease: "power2.out",
                onUpdate: () => {
                    context.glassMaterial.needsUpdate = true;
                }
            }, 0.5).to(context.material.uniforms.uOpacity, {
                value: 1.0,
                duration: 1.0,
                ease: "power2.out",
                onUpdate: () => {
                    context.material.needsUpdate = true;
                },
            }, 0.5)
            .from(title.chars, {
                x: "-1em",
                duration: 1.0,
                ease: "power2.out",
                stagger: { amount: 0.2 },
                opacity: 0,
            }, 0.5)
            .from(".line", {
                height: 0,
                duration: 1.0,
                ease: "power2.out",
                stagger: 0.2,
            }, 0.5)
            .from(title_2.chars, {
                opacity: 0,
                x: "1em",
                duration: 1.0,
                ease: "power2.out",
                stagger: { amount: 0.2 },
            }, 0.5)
            .from(".divider_line", {
                width: 0,
                duration: 1.0,
                ease: "power2.out",
            }, 0.8)
            .from(".divider_short", {
                width: 0,
                duration: 1.0,
                ease: "power2.out",
            }, 0.8)
            .from(context.splits.heroText.lines, {
                duration: 1,
                yPercent: 100,
                opacity: 0,
                stagger: 0.1,
                ease: "expo.out",
            }, 1.2)
            .from(" .badge", {
                opacity: 0,
                stagger: 0.1,
                duration: 1,
                ease: "power2.out",
            }, 1.4)
            .to(".scroll", {
                opacity: 1,
                duration: 1.0,
                ease: "power2.out",
            }, 1.4)
            .to(".scroll-line", {
                opacity: 1,
                duration: 1.0,
                ease: "power2.out",
                onComplete: () => {
                    if (aboutElement) {
                        aboutElement.style.pointerEvents = 'auto';
                    }
                }
            }, 1.4);
    });
}