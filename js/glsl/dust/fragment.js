const fragment = /*glsl*/ `
#define PI acos(-1.0)

uniform sampler2D uPositions;
uniform vec4 pointColor;
uniform vec3 uCameraPos;

varying vec4 vData;
varying vec2 vIndex;
varying float vDist;

float parabola(float x) {
    return pow(sin(x * PI), 2.0);
}

vec3 fog( vec3 color, float near, float far ) {
    float fogFactor = smoothstep(far, near, distance(vData.xyz, uCameraPos));
    vec3 fogColor = mix(color, vec3(0.0, 0.0, 1.0), fogFactor);
    return fogColor;
}

void main() {
    vec4 data = texture2D(uPositions, vIndex);
    
    float dist = distance(vec2(0.05), gl_PointCoord);
    if (dist > .5) discard;

    // **Smooth Fade-Out based on alpha**
    float fadeAlpha = 1.0 - smoothstep(.5, .9, data.a); // Smooth fade

    vec3 modulatedColor = data.rgb; 

    vec3 glowColor = mix(vec3(.0), modulatedColor, pointColor.a);
    vec3 finalColor = mix(glowColor, pointColor.rgb, pointColor.a);

    finalColor = fog(finalColor, 0.0, .5);

    gl_FragColor = vec4(finalColor, fadeAlpha * data.a * pointColor.a);
}
`;


export default fragment;


/* precision mediump float;
uniform vec4 pointColor; 
uniform sampler2D ; // Texture containing positions & age
uniform vec2 iResolution;

varying vec2 vUv;

vec2 normalizeToZeroOne(vec2 v) {
    return (v + 1.0) * 0.5;
}

float lineDist(vec2 a, vec2 b, vec2 p) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
}

void main() {
    vec2 uv = vUv;
    vec4 col = texture2D(iChannel0, uv);
    
    // Use the new threshold (2.0) to compute the fade:
    float individualFade = 1.0 - smoothstep(0.0, 1.0, col.a);
    
    float dist = smoothstep(0.5, 2.0, length(uv - vec2(0.05)));
    vec3 glowColor = mix(vec3(0.0), col.rgb, pointColor.a);
    
    vec3 finalColor = mix(glowColor, pointColor.rgb, pointColor.rgb);
    
    gl_FragColor = vec4(finalColor, individualFade * dist * col.a * pointColor.a);
} */