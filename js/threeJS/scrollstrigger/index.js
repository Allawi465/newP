import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";

export default function setupScrollAnimation(content) {
    gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
    CustomEase.create("customBezier", "0.455, 0.03, 0.515, 0.955");

    const resetText = (selector) => {
        const el = document.querySelector(selector);
        if (!el) return;
        if (el.querySelector("div, span")) {
            el.textContent = el.getAttribute("aria-label") || el.textContent;
        }
    };

    resetText(".scroll");
    resetText(".name_scroll");
    resetText(".projects__title");
    resetText(".footer-heading-muted");
    resetText(".footer-heading-bright");

    document.fonts.ready.then(() => {
        gsap.fromTo(".scroll_line",
            { "--scaleY": 0, "--opacity": 0 },
            {
                "--scaleY": 1,
                "--opacity": 1,
                duration: 2,
                ease: "customBezier",
                repeat: -1,
                yoyo: true,
            }
        );

        ScrollTrigger.create({
            trigger: ".hero",
            start: "top top",
            end: "top+=100px top",
            scrub: true,
            scroller: content.wrapper,
            animation: gsap.to(".scroll_line", {
                opacity: 0,
                duration: 2,
                ease: "customBezier",
            }),
        });

        SplitText.create(".scroll", {
            type: "chars",
            onSplit: (self) => {
                ScrollTrigger.create({
                    trigger: ".hero",
                    start: "top top",
                    end: "bottom 45%",
                    scroller: content.wrapper,
                    scrub: true,
                    animation: gsap.to(self.chars, {
                        color: "rgba(255, 255, 255, 0)",
                        stagger: 0.05,
                        ease: "customBezier",
                    }),
                });
            },
        });

        SplitText.create(".name_scroll", {
            type: "chars",
            onSplit: (self) => {
                ScrollTrigger.create({
                    trigger: ".hero",
                    start: "bottom 50%",
                    end: "bottom 25%",
                    scroller: content.wrapper,
                    scrub: true,
                    animation: gsap.to(self.chars, {
                        color: "rgba(255, 255, 255, 1)",
                        stagger: 0.05,
                        ease: "customBezier",
                    }),
                });
            },
        });

        SplitText.create(".projects__title", {
            type: "chars",
            onSplit: (self) => {
                ScrollTrigger.create({
                    trigger: ".hero",
                    start: "bottom 50%",
                    scrub: true,
                    scroller: content.wrapper,
                    animation: gsap.fromTo(
                        self.chars,
                        { color: "rgba(255, 255, 255, 0)", yPercent: 100, opacity: 0 },
                        {
                            color: "rgba(255, 255, 255, 1)",
                            yPercent: 0,
                            opacity: 1,
                            stagger: 0.05,
                            ease: "customBezier",
                        }
                    ),
                });
            },
        });

        SplitText.create(".footer-heading-muted", {
            type: "chars",
            onSplit: (self) => {
                ScrollTrigger.create({
                    trigger: ".footer",
                    start: "top 55%",
                    end: "bottom bottom",
                    scroller: content.wrapper,
                    scrub: true,
                    animation: gsap.fromTo(
                        self.chars,
                        { color: "rgba(255, 255, 255, 0)", opacity: 0 },
                        {
                            color: "rgba(255, 255, 255, 1)",
                            opacity: 1,
                            stagger: 0.05,
                            ease: "customBezier",
                        }
                    ),
                });
            },
        });

        SplitText.create(".footer-heading-bright", {
            type: "chars",
            onSplit: (self) => {
                ScrollTrigger.create({
                    trigger: ".footer",
                    start: "top 20%",
                    end: "bottom bottom",
                    scroller: content.wrapper,
                    scrub: true,
                    animation: gsap.fromTo(
                        self.chars,
                        { color: "rgba(255, 255, 255, 0)", opacity: 0, },
                        {
                            color: "rgba(255, 255, 255, 0.6)",
                            opacity: 1,
                            stagger: 0.05,
                            ease: "customBezier",
                        }
                    ),
                });
            },
        });

        ScrollTrigger.create({
            trigger: ".footer",
            start: "center 60%",
            end: "bottom bottom",
            scroller: content.wrapper,
            scrub: true,
            animation: gsap.fromTo(
                [".footer-link", ".footer-social-link"],
                {
                    opacity: 0,
                    y: 20,
                },
                {
                    opacity: 1,
                    y: 0,
                    stagger: 0.1,
                    ease: "power2.out",
                }
            ),
        });
    });

    ScrollTrigger.create({
        trigger: '.hero',
        start: 'bottom center',
        scrub: true,
        scroller: content.wrapper,
        onUpdate: (self) => {
            if (!content.meshArray || !content.meshArray.length) return;

            const p = self.progress;

            content.meshArray.forEach(mesh => {
                const uniforms = mesh.material.uniforms;
                uniforms.uGrayscale.value = p;
                uniforms.opacity.value = p;
            });
        }
    });

    ScrollTrigger.create({
        trigger: ".hero",
        start: "top top",
        end: "55% top",
        scroller: content.wrapper,
        scrub: true,
        onEnterBack: () => {
            content.enableParticles(content);
            content.chromaticBendPass.uniforms.offset.value.set(0.001, 0.001);
        },
        onUpdate: self => {
            if (!content.particlesActive) return;

            content.glassMaterial.opacity = 1 - self.progress;
            content.glassMaterial.needsUpdate = true;
            content.material.uniforms.uScrollProgress.value = self.progress;
        },
        onLeave: () => {
            content.chromaticBendPass.uniforms.offset.value.set(0.000, 0.000);
            content.glassMaterial.opacity = 0;
            content.glassMaterial.needsUpdate = true;

            content.disableParticles(content);
        },
    });

    ScrollTrigger.create({
        trigger: ".footer",
        start: "top 55%",
        end: "bottom bottom",
        scrub: true,
        scroller: content.wrapper,
        onEnter: () => {
            content.enableParticles(content);
        },
        onUpdate: (self) => {
            if (!content.particlesActive) return;

            content.glassMaterial.opacity = self.progress;
            content.glassMaterial.needsUpdate = true;

            content.material.uniforms.uScrollProgress.value = 1 - self.progress;
            content.material.uniforms.uFooter.value = self.progress;
            content.fboMaterial.uniforms.uFooter.value = self.progress;

            content.glassMaterial.roughness = Math.min(
                0.4,
                Math.max(0.1, self.progress - 0.6)
            );

            content.glassMaterial.thickness = Math.min(
                0.5,
                Math.max(0.3, self.progress - 0.5)
            );

            if (!content.isTouchDevice() || !content.bounceTween) return;

            const dir = self.progress > 0 ? 'x' : 'y';
            if (content.bounceDirection !== dir) {
                gsap.set(content.targetPositionSphre, dir === 'x' ? { y: 0 } : { x: 0 });
                content.startBounce(content, dir, dir === 'x' ? 1.5 : 2, 5);
            }
        },
        onLeaveBack: () => {
            content.fboMaterial.uniforms.uFooter.value = 0;
            content.disableParticles(content);
        }
    });
};