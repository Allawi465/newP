import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";

export default function setupScrollAnimation() {
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
            start: "top top",
            end: "top+=100px top",
            scrub: 1,
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
                    start: "top top",
                    end: "top+=100px top",
                    scrub: 1,
                    animation: gsap.to(self.chars, {
                        color: "rgba(255, 255, 255, 0)",
                        stagger: 0.05,
                        ease: "none",
                    }),
                });
            },
        });

        SplitText.create(".name_scroll", {
            type: "chars",
            onSplit: (self) => {
                ScrollTrigger.create({
                    trigger: ".hero",
                    start: "bottom 25%",
                    end: "bottom 25%",
                    scrub: 2,
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
                    scrub: 1,
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
    });
}