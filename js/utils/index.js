import * as THREE from 'three';


export const images = [
    {
        id: 'slider_1',
        src: '1.jpg',
        src2: '1.jpg',
        title: 'Adventure',
        slogan: 'Explore the Uncharted',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_2',
        src: '2.jpg',
        src2: '2.jpg',
        title: 'Holidaze',
        slogan: 'Relax in Style',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_3',
        src: '1.jpg',
        src2: '1.jpg',
        title: 'NoxB',
        slogan: 'Innovating Tomorrow',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_4',
        src: '4.jpg',
        src2: '4.jpg',
        title: 'Buyers',
        slogan: 'Shop Smart',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_5',
        src: '5.jpg',
        src2: '5.jpg',
        title: 'Portfolio 02',
        slogan: 'Digital Craftsmanship',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_6',
        src: '6.jpg',
        src2: '6.jpg',
        title: 'Note',
        slogan: 'Moments That Matter',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_1',
        src: '1.jpg',
        src2: '1.jpg',
        title: 'Adventure',
        slogan: 'Explore the Uncharted',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_2',
        src: '2.jpg',
        src2: '2.jpg',
        title: 'Holidaze',
        slogan: 'Relax in Style',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_3',
        src: '1.jpg',
        src2: '1.jpg',
        title: 'NoxB',
        slogan: 'Innovating Tomorrow',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_4',
        src: '4.jpg',
        src2: '4.jpg',
        title: 'Buyers',
        slogan: 'Shop Smart',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_5',
        src: '5.jpg',
        src2: '5.jpg',
        title: 'Portfolio 02',
        slogan: 'Digital Craftsmanship',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_6',
        src: '6.jpg',
        src2: '6.jpg',
        title: 'Note',
        slogan: 'Moments That Matter',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_1',
        src: '1.jpg',
        src2: '1.jpg',
        title: 'Adventure',
        slogan: 'Explore the Uncharted',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_2',
        src: '2.jpg',
        src2: '2.jpg',
        title: 'Holidaze',
        slogan: 'Relax in Style',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_3',
        src: '1.jpg',
        src2: '1.jpg',
        title: 'NoxB',
        slogan: 'Innovating Tomorrow',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_4',
        src: '4.jpg',
        src2: '4.jpg',
        title: 'Buyers',
        slogan: 'Shop Smart',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_5',
        src: '5.jpg',
        src2: '5.jpg',
        title: 'Portfolio 02',
        slogan: 'Digital Craftsmanship',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
    {
        id: 'slider_6',
        src: '6.jpg',
        src2: '6.jpg',
        title: 'Note',
        slogan: 'Moments That Matter',
        description: 'Adventure calls! Venture into the wild, embrace the thrill of the unknown, and create memories that last a lifetime.',
        link: 'https://robelmahta.netlify.app/'
    },
];

export const defaultConfig = {
    textures: [],
    cssObjects: [],
    meshes: [],
    meshArray: [],
    images: images,
    mouse: new THREE.Vector2(),
    raycaster: new THREE.Raycaster(),
    pointer: new THREE.Vector2(),
    pointerPrev: new THREE.Vector2(),
    targetPosition: new THREE.Vector3(0, 0, 0),
    clock: new THREE.Clock(),
    time: 0,
    baseMeshSpacing: 2.2,
    width: window.innerWidth,
    height: window.innerHeight,
    PARTICLE_LAYER: 0,
    SPHERE_LAYER: 1,
    PLANE_LAYER: 3,
    slider_mesh: 4,
    size: 1024,
    moon_LAYER: 5,
    aspect: window.innerWidth / window.innerHeight,
    movementSensitivity: 150,
    defaultCameraZ: 10.5,
    friction: 0.95,
    startX: 0,
    isDragging: false,
    currentPosition: 0,
    dragDelta: 0,
    lastX: 0,
    scaleFactor: 1,
    dragSpeed: 0,
    velocity: 0,
    slideHeight: 3.2,
    slideWidth: 1.8,
    scaleFactor_cards: 1,
    meshSpacing: 2.3,
    frustumSize: 1,
    largePlane: null,
    isLoading: true,
    isDivOpen: false,
    isProjectsOpen: false,
    isAnimating: false,
    largeShaderMaterial: null,
    moonShaderMaterial: null,
    followMouse: true,
};

export function calculatePositionX(index, currentPosition, meshSpacing) {
    const totalLength = meshSpacing * images.length;
    return ((((index * meshSpacing + currentPosition) % totalLength) + totalLength) % totalLength) - totalLength / 2;
}

export function loadTextures(imageArray, context) {
    const textureLoader = new THREE.TextureLoader();
    return Promise.all(imageArray.map(image => new Promise((resolve, reject) => {
        textureLoader.load(image.src, (texture) => {
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;

            texture.generateMipmaps = true;
            texture.minFilter = THREE.LinearMipMapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = Math.min(context.renderer.capabilities.getMaxAnisotropy(), 8);
            texture.needsUpdate = true;

            resolve(texture);
        }, undefined, (err) => {
            console.error(`Failed to load texture: ${image.src}`, err);
            reject(err);
        });
    })));
}

