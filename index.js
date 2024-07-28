import * as THREE from "/node_modules/.vite/deps/three.js?v=372d1c56";
import { DragGesture } from '@use-gesture/vanilla';

const vertexShader = /* glsl */`
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;

const fragmentShader = /* glsl */`
uniform sampler2D uTex;
uniform vec2 uRes;
uniform vec2 uImageRes;

vec2 CoverUV(vec2 u, vec2 s, vec2 i) {
    float rs = s.x / s.y; 
    float ri = i.x / i.y; 
    vec2 st = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
    vec2 o = (rs < ri ? vec2((st.x - s.x) / 2.0, 0.0) : vec2(0.0, (st.y - s.y) / 2.0)) / st;
    return u * s / st + o;
}

varying vec2 vUv;
void main() {
    vec2 uv = CoverUV(vUv, uRes, uImageRes);
    vec3 tex = texture2D(uTex, uv).rgb;
    gl_FragColor = vec4(tex, 1.0);
}
`;

const images = [
    { src: '1.png', title: 'Adventure Trail Hikes' },
    { src: '2.png', title: 'Holidaze' },
    { src: '3.png', title: 'NoxB' },
    { src: '4.png', title: 'Buyers' },
    { src: '5.png', title: 'Portfolio 02' },
    { src: '6.png', title: 'Note' },
];

let scene, camera, renderer, group;
let position = 0;
const movementSensitivity = 250;
const meshSpacing = 7.2;
let currentPosition = 0;

function loadTextures() {
    const loader = new THREE.TextureLoader();
    const texturePromises = images.map(img => {
        return new Promise((resolve, reject) => {
            loader.load(
                img.src,
                texture => resolve(texture),
                undefined,
                err => reject(err)
            );
        });
    });
    return Promise.all(texturePromises);
}

function calculatePositionX(index, currentPosition) {
    const totalLength = meshSpacing * images.length;
    return ((((index * meshSpacing + currentPosition) % totalLength) + totalLength) % totalLength) - totalLength / 2;
}

function init(textures) {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100);
    camera.position.z = 10;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    group = new THREE.Group();
    scene.add(group);

    for (let i = 0; i < textures.length; i++) {
        const texture = textures[i];
        const planeGeometry = new THREE.PlaneGeometry(6, 9);
        const shaderMaterial = new THREE.ShaderMaterial({
            transparent: true,
            uniforms: {
                uTex: { value: texture },
                uRes: { value: { x: 1, y: 1 } },
                uImageRes: {
                    value: new THREE.Vector2(texture.image.width, texture.image.height),
                },
                uPlaneResolution: {
                    value: new THREE.Vector2(window.innerWidth, window.innerHeight),
                },
                time: { value: 0.0 },
            },
            vertexShader,
            fragmentShader
        });

        const planeMesh = new THREE.Mesh(planeGeometry, shaderMaterial);
        planeMesh.position.x = calculatePositionX(i, position);

        group.add(planeMesh);
    }

    // Add drag gesture
    const gesture = new DragGesture(renderer.domElement, ({ active, movement: [mx], memo = currentPosition }) => {
        if (active) {
            currentPosition = memo + mx / movementSensitivity;
            updatePositions();
        } else {
            return currentPosition;
        }
    });

    window.addEventListener('resize', onWindowResize, false);
    animate();
}

function updatePositions() {
    group.children.forEach((child, index) => {
        child.position.x = calculatePositionX(index, currentPosition);
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

loadTextures().then(loadedTextures => {
    init(loadedTextures);
}).catch(err => {
    console.error('Error loading textures:', err);
});