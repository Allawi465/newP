import * as THREE from 'three';

export const images = [
    {
        id: 'slider_1',
        src: '1.jpg',
        title: 'Buyers',
        slogan: 'Explore Buyers',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://buyers.netlify.app/'
    },
    {
        id: 'slider_2',
        src: '7.jpg',
        title: 'Note',
        slogan: 'Text editor',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://allawi465.github.io/notebook/index.html'
    },
    {
        id: 'slider_3',
        src: '4.jpg',
        title: 'Holidaze',
        slogan: 'Plan your next trip',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_4',
        src: '1.jpg',
        title: 'Buyers',
        slogan: 'Shop Smart',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_5',
        src: '2.jpg',
        title: 'Portfolio 02',
        slogan: 'Digital Craftsmanship',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_6',
        src: '6.jpg',
        title: 'Particles',
        slogan: 'Moments That Matter',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_7',
        src: '3.jpg',
        title: 'Storo Grill',
        slogan: 'Restaurant i Oslo',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://storo-grill.vercel.app/'
    }
];


export const defaultConfig = {
    textures: [],
    cssObjects: [],
    meshArray: [],
    images: images,
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

    VIEW_WIDTH: 4.5,
    bounceDirection: 'y',
    baseMeshSpacing: 2.2,
    bounceTween: null,
    splits: {
        heroText: null,
        aboutText: null,
        projectsText: null
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
    isProjectsOpen: false,
    followMouse: true,

    scrollMinY: 0,
    scrollMaxY: 20,
};
