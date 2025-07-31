const vertexParticles = /*glsl*/ `
uniform float time;
uniform float opacity;
uniform sampler2D uPositions;
uniform vec3 uColor;

varying vec2 vUv;
varying vec4 vColor;
varying vec3 vPositionWorld;

void main() {
    vUv = uv;
    vec4 pos = texture2D(uPositions, uv);

    // World position for fog
    vec4 worldPos = modelMatrix * vec4(pos.xyz, 1.0);
    vPositionWorld = worldPos.xyz;

    float alpha = opacity * 0.1;

    vColor = vec4(uColor, alpha);

    vec4 mvPosition = viewMatrix * worldPos;
    gl_PointSize = 2.0;
    gl_Position = projectionMatrix * mvPosition;
}
`;

export default vertexParticles;