import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { calculatePositionX } from '../../utils';
import { vertexShader, fragmentShader } from '../../glsl/shader';

gsap.registerPlugin(ScrollTrigger);

export function createPlaneMesh(content, texture, index) {
    const planeGeometry = new THREE.PlaneGeometry(content.slideWidth * content.scaleFactor, content.slideHeight * content.scaleFactor, 24, 24);

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
            uBorderRadius: { value: 0.03 },
            uDistanceScale: { value: content.initialDistanceScale },
            opacity: { value: 1 },
            uAspectRatio: { value: aspectRatio }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true
    });

    const planeMesh = new THREE.Mesh(planeGeometry, shaderMaterial);

    planeMesh.position.x = calculatePositionX(index, 0, content.meshSpacing);
    planeMesh.userData = { index, hovered: false, tl: gsap.timeline({ paused: true }), id: `slider_${index + 1}` };

    planeMesh.userData.tl.to(planeMesh.rotation, { z: -0.09, duration: 0.5, ease: "power2.inOut" })
        .to(shaderMaterial.uniforms.uzom, { value: 0.9, duration: 0.5, ease: "power2.inOut" }, 0);

    const projectsElement = document.querySelector('.projects');
    content.setMeshPosition(planeMesh, projectsElement);

    content.meshArray = content.meshArray || [];
    content.meshArray.push(planeMesh);

    const titleElement = document.querySelector(".projects__title");
    const titleLabel = new CSS2DObject(titleElement);

    titleElement.style.transform = 'none';

    content.scene.add(titleLabel);

    ScrollTrigger.create({
        trigger: ".projects",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
            const progress = self.progress;
            planeMesh.position.y = THREE.MathUtils.lerp(-35, 35, progress);

            const projectsPosition = projectsElement.getBoundingClientRect();
            const titlePositionX = projectsPosition.left - (projectsElement.offsetWidth) / 2.69;

            titleLabel.position.y = planeMesh.position.y;
            titleElement.style.left = `${titlePositionX}px`;

        }
    });

    return planeMesh;
}