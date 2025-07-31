const fragment = /*glsl*/ `
uniform vec3 uCameraPos;
uniform vec3 uFogColor;

varying vec2 vUv;
varying vec4 vColor;
varying vec3 vPositionWorld;

vec3 fog(vec3 color, float near, float far) {
    float fogFactor = smoothstep(near, far, distance(vPositionWorld, uCameraPos));
    return mix(color, uFogColor, fogFactor);
}

void main() {
    vec3 colorWithFog = fog(vColor.rgb, 2.0, 10.0);
    gl_FragColor = vec4(colorWithFog, vColor.a);
}
`;

export default fragment;