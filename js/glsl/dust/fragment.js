const fragment = /*glsl*/ `
precision mediump float;
uniform vec4 pointColor; 
uniform sampler2D iChannel0; // Texture containing positions & age
uniform vec2 iResolution;
uniform vec2 uMouse;
uniform vec2 uMousePrev;

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
    
float individualFade = 1.0 - smoothstep(0.0, 1.0, col.a);
    
    float dist = smoothstep(0.5, 3.4, length(uv - vec2(0.05)));
    vec3 glowColor = mix(vec3(0.0), col.rgb, pointColor.a);
    
    vec3 finalColor = mix(glowColor, pointColor.rgb, pointColor.rgb);
    
    gl_FragColor = vec4(finalColor, individualFade * dist * col.a * pointColor.a);
}
`;

export default fragment;


