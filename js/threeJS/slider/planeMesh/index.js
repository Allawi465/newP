import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { vertexShader, fragmentShader } from '../../glsl/shader';

gsap.registerPlugin(ScrollTrigger);

export default function createPlaneMesh(content, texture, index) {

    const planeGeometry = new THREE.PlaneGeometry(
        content.slideWidth * content.scaleFactor,
        content.slideHeight * content.scaleFactor,
        32,
        32
    );

    const textureAspect = texture.image.width / texture.image.height;
    const planeAspect = content.slideWidth / content.slideHeight;
    const aspectRatio = planeAspect > textureAspect
        ? new THREE.Vector2(1, textureAspect / planeAspect)
        : new THREE.Vector2(planeAspect / textureAspect, 1);

    const shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uTexture: { value: texture },
            uOffset: { value: new THREE.Vector2(0.0, 0.0) },
            uzom: { value: 1.0 },
            uBorderRadius: { value: 0.02 },
            uGrayscale: { value: 0.0 },
            opacity: { value: 0 },
            uAspectRatio: { value: aspectRatio },
            uMaxDist: { value: content.maxDist },
            uRotation: { value: 0.0 },
            uDistanceScale: { value: 1.0 },
            uIsDragging: { value: 0.0 },
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true,
        depthWrite: true,
        depthTest: true,
    });

    const planeMesh = new THREE.Mesh(planeGeometry, shaderMaterial);

    planeMesh.position.x = content.calculatePositionX(index, 0, content.meshSpacing);
    planeMesh.position.y = -10;
    planeMesh.userData = {
        index,
        hovered: false,
        tl: gsap.timeline({ paused: true }),
        id: `slider_${index + 1}`
    };

    planeMesh.userData.tl
        .to(shaderMaterial.uniforms.uRotation, { value: -0.09, ease: "power2.inOut", duration: 0.5 })
        .to(shaderMaterial.uniforms.uzom, { value: .9, duration: 0.5, ease: "power2.inOut" }, 0);

    planeMesh.layers.set(content.slider_mesh);

    planeMesh.renderOrder = 999;
    planeMesh.position.x = content.calculatePositionX(index, 0, content.meshSpacing);

    content.meshArray = content.meshArray || [];
    content.meshArray.push(planeMesh);

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".projects",
            start: "top bottom",
            end: "bottom top",
            scrub: .5,
            scroller: document.documentElement,
        }
    });

    tl.to(planeMesh.position, {
        y: 8,
        ease: "none",
    }, 0);

    ScrollTrigger.create({
        trigger: '.hero',
        start: 'bottom center',
        scrub: true,
        scroller: document.documentElement,
        onUpdate: (self) => {
            planeMesh.material.uniforms.uGrayscale.value = self.progress;
            planeMesh.material.uniforms.opacity.value = self.progress;
        }
    });

    ScrollTrigger.update();
    /*    content.bodyLenis.on('scroll', () => ScrollTrigger.update()); */

    return planeMesh;
}