import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { calculatePositionX } from '../../../utils/index.js';
import { vertexShader, fragmentShader } from '../../glsl/shader';

gsap.registerPlugin(ScrollTrigger);

export default function createPlaneMesh(content, texture, index, context) {

    const planeGeometry = new THREE.PlaneGeometry(
        content.slideWidth * content.scaleFactor,
        content.slideHeight * content.scaleFactor,
        64,
        64
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
            uRotation: { value: 0.0 },
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true,
        depthWrite: true,
        depthTest: true,
    });

    const planeMesh = new THREE.Mesh(planeGeometry, shaderMaterial);

    planeMesh.position.x = calculatePositionX(index, 0, content.meshSpacing);
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
    planeMesh.position.x = calculatePositionX(index, 0, content.meshSpacing);

    content.meshArray = content.meshArray || [];
    content.meshArray.push(planeMesh);

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".projects",
            start: "top bottom",
            end: "bottom top",
            scrub: 0.5,
            scroller: document.body
        }
    });

    tl.to(planeMesh.position, {
        y: 8,
        ease: "none",
        immediateRender: false
    }, 0);

    ScrollTrigger.create({
        trigger: '.hero',
        start: 'bottom center',
        scrub: true,
        scroller: document.body,
        onUpdate: (self) => {
            planeMesh.material.uniforms.uGrayscale.value = self.progress;
            planeMesh.material.uniforms.opacity.value = self.progress;
        }
    });

    return planeMesh;
}