import curlNoise from "../noise/curlGlsl.js";

const simFragment = /*glsl*/ `
uniform float time;
uniform float progress;
uniform sampler2D uPositions;
uniform sampler2D uInfo;
uniform vec4 resolution;
uniform vec2 uMouse;
varying vec2 vUv;
varying vec4 vPosition;
float PI = 3.141592653589793238;

${curlNoise}

void main() {
    vec4 pos = texture2D(uPositions, vUv);
    vec4 info = texture2D(uInfo, vUv);

    // Circular force: Forms a circle when progress is high
    float radius = length(pos.xy);
    float circularForce = (1. - clamp(abs(pos.x - radius) / 1., 0.0, 1.0));

    float angle = atan(pos.y, pos.x) - info.y * 0.2 * mix(0.5, 1.0, circularForce);

    float targetRadius = mix(
        info.x, 2.2,
        (0.5 + 0.05 * sin(angle * 2.0 + time * 2.0 * progress))
    );

    radius += (targetRadius - radius) * mix(0.2, 0.5, circularForce);

    vec3 targetPos = vec3(cos(angle), sin(angle), 0.0) * radius;

    // Scattering force: Disperses particles when progress is low
    vec2 scatterPos = pos.xy + vec2(
        sin(vUv.x * PI * 2.) * .5,
        sin(vUv.y * PI * -2.) *.5
    ) * (1. - progress);

    // Blend positions
    pos.xy += (targetPos.xy - pos.xy) * 0.1 * progress;
    pos.xy += (scatterPos - pos.xy) * 0.02;

    // Apply curl noise for subtle motion
    pos.xy += curl(pos.xyz * 2.0, time * 0.1, 0.1).xy * 0.003;

    gl_FragColor = vec4(pos.xy, 1.0, 1.0);
}
`;

export default simFragment; 