

const fragment = /*glsl*/ `
#define PI acos(-1.0)

uniform sampler2D uPositions;
uniform vec3 uCameraPos;
uniform float uScrollProgress;
uniform float uOpacity;

varying vec4 vData;
varying vec2 vIndex;

float parabola(float x) {
    return pow(sin(x * PI), 2.0);
}

vec3 fog( vec3 color, float near, float far ) {
    float fogFactor = smoothstep(far, near, distance(vData.xyz, uCameraPos));
    vec3 fogColor = mix(color, vec3(0., 0., 1.), fogFactor);
    return fogColor;
}

void main() {
    vec4 data = texture2D(uPositions, vIndex);
    
    float dist = distance(vec2(0.5), gl_PointCoord);
    if (dist > .5) discard;

    // Smooth Fade-Out based on alpha
    float alpha = pow(sin(pow((1. - data.a), .4) * PI), 3.);
    alpha *= (1.0 - uScrollProgress) * uOpacity;

    vec3 color = vec3(0.9);


    gl_FragColor = vec4(color, alpha);
}
`;


export default fragment;