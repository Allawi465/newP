import gsap from "gsap";
import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import closeInfoDiv from "../close";

import { horizontalLoop } from "./animation";

gsap.registerPlugin(ScrollTrigger);

function showAbout(context) {
    const aboutDiv = document.getElementById('about');
    aboutDiv.style.zIndex = 40;
    aboutDiv.classList.add('show');

    // Stop body scrolling and start aboutDiv scrolling
    context.stopBodyScrolling();

    const closeBtn = document.getElementById('close');
    closeBtn.style.display = 'block';
    closeBtn.addEventListener('click', () => closeInfoDiv(context));

    context.toggleAboutfbo(true);
    context.isDivOpen = true;

    // Initialize or restart the horizontalLoop animation
    const boxes = gsap.utils.toArray(".rolling_h1");
    if (!context.tl) {
        // Create the timeline only once and store it in context
        context.tl = horizontalLoop(boxes, {
            repeat: -1,
            speed: 0.8,
        });
    } else {
        // Restart the timeline if it already exists
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
                .to(context.tl, {
                    timeScale: 3 * self.direction,
                    duration: 0.25
                })
                .to(context.tl, {
                    timeScale: 1 * self.direction,
                    duration: 1.5
                }, "+=0.5");
        },
    });

    ScrollTrigger.refresh();
}

export default showAbout;