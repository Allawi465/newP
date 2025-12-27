import gsap from "gsap";
import { loadingContainer } from "./loading";

const isMobile = window.matchMedia("(max-width: 1023px)").matches;

export default function initLoadingSequence(context) {

    const aboutElement = document.querySelector(".about");
    if (aboutElement) {
        aboutElement.style.pointerEvents = 'none';
    }

    const timeline = gsap.timeline({});

    document.fonts.ready.then(() => {

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
            .from(".hero_title", {
                x: "-1em",
                duration: 1.0,
                ease: "power2.out",
                opacity: 0,
            }, 0.5)
            .from(".hero_title_2", {
                opacity: 0,
                x: "1em",
                duration: 1.0,
                ease: "power2.out",
            }, 0.5)
            .from(".divider_line", {
                scaleX: 0,
                duration: 1.0,
                ease: "power2.out",
            }, 0.5)
            .from(".divider_short", {
                scaleX: 0,
                duration: 1.0,
                ease: "power2.out",
            }, isMobile ? 0.8 : 1)
            .from(".hero_text", {
                duration: 1,
                opacity: 0,
                x: -50,
                ease: "power2.out",
            }, isMobile ? 0.8 : 1)
            .from(" .badge", {
                opacity: 0,
                x: -100,
                stagger: 0.1,
                duration: 1,
                ease: "expo.out"
            }, isMobile ? 1. : 1.2)
            .to(".scroll", {
                opacity: 1,
                duration: 1.0,
                ease: "power2.out",
            }, isMobile ? 1.5 : 2.)
            .to(".scroll-line", {
                opacity: 1,
                duration: 1.0,
                ease: "power2.out",
                onComplete: () => {
                    if (aboutElement) {
                        aboutElement.style.pointerEvents = 'auto';
                    }
                }
            }, isMobile ? 1.5 : 2.);
    });
}