import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { vertexShader, fragmentShader } from '../../glsl/shader';

gsap.registerPlugin(ScrollTrigger);

export default function createPlaneMesh(content, texture, index) {

    const planeGeometry = new THREE.PlaneGeometry(
        content.slideWidth * content.scaleFactor_cards,
        content.slideHeight * content.scaleFactor_cards,
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
            uGrayscale: { value: 0. },
            opacity: { value: 0. },
            uAspectRatio: { value: aspectRatio },
            uRotation: { value: 0.0 },
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true,
        depthWrite: false,
        depthTest: false
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

    content.meshArray = content.meshArray || [];
    content.meshArray.push(planeMesh);

    return planeMesh;
}