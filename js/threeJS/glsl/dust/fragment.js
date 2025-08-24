const fragment = /*glsl*/ `
#define PI acos(-1.0)

uniform sampler2D uPositions;
uniform vec3 uCameraPos;
uniform float uScrollProgress;
uniform float uOpacity;
uniform vec3 uColor; 
uniform vec3 uFogColor;

varying vec4 vData;
varying vec2 vIndex;

vec3 fog(vec3 color, float near, float far) {
    float fogFactor = smoothstep(2.0, 10.0, distance(vData.xyz, uCameraPos)) * 0.5;
    return mix(color, uFogColor, fogFactor);
}

void main() {
    vec4 data = texture2D(uPositions, vIndex);
    float dist = distance(vec2(0.5), gl_PointCoord);
    if (dist > 0.5) discard;

    float age = clamp(data.a, 0.0, .85);

    // Adjusted for faster fade-out with higher exponents
    float alpha = pow(sin(pow((1. - age), 2.5) * PI), 3.);
    alpha *= (1.0 - uScrollProgress) * uOpacity;
    alpha *= 0.5;

    if (alpha < 0.005) discard;

    vec3 color = fog(uColor, 10.0, 2.0); 
    gl_FragColor = vec4(color, alpha);
}
`;

export default fragment;