import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function setupLenis(effectShell) {
    // 1. Create Lenis instances
    const bodyLenis = new Lenis({
        smooth: true,
        smoothWheel: true,
        direction: 'vertical',
        wrapper: document.body,
        content: document.documentElement,
        syncTouch: true,
        touchMultiplier: 0.5,
        autoRaf: false,
    })

    const aboutElement = document.getElementById('about')
    const projectsElement = document.getElementById('projects_info')

    const aboutLenis = aboutElement
        ? new Lenis({
            smooth: true,
            direction: 'vertical',
            wrapper: aboutElement,
            content: aboutElement,
            syncTouch: true,
            touchMultiplier: 0.5,
            autoRaf: false,
        })
        : null

    const projectsLenis = projectsElement
        ? new Lenis({
            smooth: true,
            direction: 'vertical',
            wrapper: projectsElement,
            content: projectsElement,
            syncTouch: true,
            touchMultiplier: 0.5,
            autoRaf: false,
        })
        : null

    // 2. Assign to effectShell
    effectShell.bodyLenis = bodyLenis
    effectShell.aboutLenis = aboutLenis
    effectShell.projectsLenis = projectsLenis

    // 3. Sync Lenis with ScrollTrigger
    gsap.ticker.add((time) => {
        const now = time * 1000

        if (effectShell.isProjectsOpen && projectsLenis) {
            projectsLenis.raf(now)
        } else if (effectShell.isDivOpen && aboutLenis) {
            aboutLenis.raf(now)
        } else {
            bodyLenis.raf(now)
        }

        ScrollTrigger.update()
    })

    gsap.ticker.lagSmoothing(0)

    // 4. Optional: listen to scroll event if needed
    bodyLenis.on('scroll', ScrollTrigger.update)
    aboutLenis?.on('scroll', ScrollTrigger.update)
    projectsLenis?.on('scroll', ScrollTrigger.update)
}