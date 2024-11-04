import curlNoise from "./curlGlsl";

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

    vec2 mouse = uMouse;

    float radius = length(pos.xy);

    float circlularForce = 1. - smoothstep(0.3, 1.4, abs(pos.x - radius));

    float angle = atan(pos.y, pos.x) - info.y * 0.2 * mix(0.5, 1., circlularForce);

    float targetRadius = mix(
    info.x, 2.2, 
    0.5 + 0.05 * sin(angle*2. + time*0.2)
    );

    radius +=(targetRadius - radius) * mix(0.2,0.5,circlularForce);

    vec3 targetPos = vec3(cos(angle), sin(angle), 0.0) * radius;


    pos.xy += (targetPos.xy - pos.xy) * 0.16;

    pos.xy += curl(pos.xyz * 4., time * 0.1, 0.1).xy * 0.004;

    float dist = length(pos.xy - mouse);
    vec2 dir = normalize(pos.xy - mouse);
    pos.xy += dir * 0.1 * smoothstep(0.2,0.0, dist);

    gl_FragColor = vec4(pos.xy, 1., 1.);
}
`;

export default simFragment;
