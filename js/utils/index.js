import * as THREE from 'three';

export const images = [
    {
        id: 'slider_1',
        src: '1.jpg',
        title: 'Adventure',
        slogan: 'Explore the Uncharted',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_2',
        src: '2.jpg',
        title: 'Holidaze',
        slogan: 'Relax in Style',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_3',
        src: '1.jpg',
        title: 'NoxB',
        slogan: 'Innovating Tomorrow',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_4',
        src: '4.jpg',
        title: 'Buyers',
        slogan: 'Shop Smart',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_5',
        src: '5.jpg',
        title: 'Portfolio 02',
        slogan: 'Digital Craftsmanship',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_6',
        src: '6.jpg',
        title: 'Note',
        slogan: 'Moments That Matter',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_7',
        src: '6.jpg',
        title: 'Note',
        slogan: 'Moments That Matter',
        link: 'https://robelmahta.netlify.app/'
    }
];

export const defaultConfig = {
    textures: [],
    cssObjects: [],
    meshArray: [],
    mouse: new THREE.Vector2(),
    targetPositionSphre: new THREE.Vector3(0, 0, 0),
    raycaster: new THREE.Raycaster(),
    pointer: new THREE.Vector2(),
    pointerPrev: new THREE.Vector2(),
    clock: new THREE.Clock(),
    time: 0,

    width: window.innerWidth,
    height: window.innerHeight,
    PARTICLE_LAYER: 0,
    SPHERE_LAYER: 1,
    PLANE_LAYER: 3,
    slider_mesh: 4,
    size: 1024,

    movementSensitivity: 150,
    smoothingFactor: 0.03,
    defaultCameraZ: 10.5,
    friction: 0.97,
    currentPosition: 0,
    targetPosition: 0,
    startX: 0,
    isDragging: false,
    dragDelta: 0,
    lastX: 0,
    scaleFactor: 1,
    dragSpeed: 0,
    velocity: 0,

    slideHeight: 3.,
    slideWidth: 1.8,
    meshSpacing: 2.2,
    scaleFactor_cards: 1,

    desiredOffset: 0,
    offsetFactor: 1,
    offsetLerpSpeed: 0.25,
    offsetMax: 50,
    smoothingFactorDrag: 0.2,
    smoothingFactorDefault: 0.03,
    lerpFactor: 0.1,
    lastTime: performance.now(),
    isMoving: false,


    largePlane: null,
    isLoading: true,
    isDivOpen: false,
    largeShaderMaterial: null,
    followMouse: true,

    isSmall: () => window.innerWidth <= 1000,
};                      