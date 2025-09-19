import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import SplitType from "split-type";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.normalizeScroll(true);



export default function setupScrollAnimation() {
    gsap.registerPlugin(CustomEase)
    CustomEase.create("customBezier", "0.455, 0.03, 0.515, 0.955");

    // Set safe initial states (so reloading mid-page won’t “flash”)
    gsap.set('.scroll_line', { '--scaleY': 1, '--opacity': 1, opacity: 1 });
    gsap.set('.scroll .char', { color: 'rgba(255,255,255,1)' });
    gsap.set('.name_scroll .char', { color: 'rgba(255,255,255,0)' });
    gsap.set('.projects__title .char', { color: 'rgba(255,255,255,0)' });


    gsap.fromTo(
        '.scroll_line',
        { '--scaleY': 0, '--opacity': 0 },
        {
            '--scaleY': 1,
            '--opacity': 1,
            duration: 2,
            ease: 'customBezier',
            repeat: -1,
            yoyo: true,
            immediateRender: false,
        }
    );
    ScrollTrigger.create({
        start: 'top top',
        end: 'top+=100 top',
        scrub: 1,
        animation: gsap.to('.scroll_line', {
            opacity: 0,
            duration: 2,
            ease: 'customBezier',
            immediateRender: false,
        }),
        invalidateOnRefresh: true,
    });


    const scrollText = new SplitType('.scroll', { types: 'chars' });
    ScrollTrigger.create({
        start: 'top top',
        end: 'top+=100 top',
        scrub: 1,
        animation: gsap.to('.scroll .char', {
            color: 'rgba(255,255,255,0)',
            stagger: 0.05,
            immediateRender: false,
        }),
        invalidateOnRefresh: true,
    });

    const scrollNameText = new SplitType('.name_scroll', { types: 'chars' });
    ScrollTrigger.create({
        trigger: '.hero',
        start: 'bottom 25%',
        end: 'bottom 25%',
        scrub: 2,
        animation: gsap.to('.name_scroll .char', {
            color: 'rgba(255,255,255,1)',
            stagger: 0.05,
            ease: 'customBezier',
            immediateRender: false,
        }),
        invalidateOnRefresh: true,
    });

    const typeSplit = new SplitType(".projects__title", { types: 'char', tagName: 'span' });

    ScrollTrigger.create({
        trigger: '.hero',
        start: 'bottom 25%',
        scrub: 1,
        animation: gsap.fromTo(
            '.projects__title .char',
            { color: 'rgba(255,255,255,0)', immediateRender: false },
            { color: 'rgba(255,255,255,1)' }
        ),
        invalidateOnRefresh: true,
    });

    ScrollTrigger.refresh();
}