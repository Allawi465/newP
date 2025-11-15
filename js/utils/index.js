import * as THREE from 'three';

export const defaultConfig = {
    textures: [],
    cssObjects: [],
    meshArray: [],
    time: 0,
    size: 1024,
    mouse: new THREE.Vector2(),
    targetPositionSphre: new THREE.Vector3(0, 0, 0),
    raycaster: new THREE.Raycaster(),
    pointer: new THREE.Vector2(),
    pointerPrev: new THREE.Vector2(),
    clock: new THREE.Clock(),

    PARTICLE_LAYER: 0,
    SPHERE_LAYER: 1,
    PLANE_LAYER: 3,
    slider_mesh: 4,
    lastHeight: window.innerHeight,

    VIEW_WIDTH: 4.5,
    bounceDirection: 'y',
    baseMeshSpacing: 2.2,
    bounceTween: null,
    scrollMinY: 0,
    scrollMaxY: 18,
    splits: {
        heroText: null,
        aboutText: null,
    },
    slideHeight: 3.0,
    slideWidth: 1.8,
    meshSpacing: 2.2,
    scaleFactor_cards: 1,
    defaultCameraZ: 10.5,

    movementSensitivity: 120,
    smoothingFactor: 0.03,
    smoothingFactorDefault: 0.03,
    friction: 0.96,

    currentPosition: 0,
    targetPosition: 0,
    startX: 0,
    lastX: 0,
    velocity: 0,
    lastTime: performance.now(),
    dragSpeed: 0,
    dragDelta: 0,
    desiredOffset: 0,
    offsetFactor: 1,
    offsetLerpSpeed: 0.25,
    offsetMax: 50,
    lerpFactor: 0.1,
    isDragging: false,
    isMoving: false,

    largePlane: null,
    largeShaderMaterial: null,
    isLoading: true,
    isDivOpen: false,
    followMouse: true,
};


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
