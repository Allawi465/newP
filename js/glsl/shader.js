export const vertexShader = /* glsl */`
uniform vec2 uOffset;

varying vec2 v_uv;

vec3 deformationCurve(vec3 position, vec2 uv, vec2 offset) {
    float M_PI = 3.1415926535897932384626433832795;
    position.x += sin(uv.y * M_PI) * offset.x;
    position.y += sin(uv.x * M_PI) * offset.y;
    return position;
}

void main() {
    v_uv = uv + (uOffset * 2.0);
    vec3 pos = position;
    pos = deformationCurve(pos, v_uv, uOffset);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const fragmentShader = /* glsl */`
uniform sampler2D u_texture;
uniform float u_zoom;

varying vec2 v_uv;

vec2 scaleUV(vec2 uv, float scale) {
    float center = 0.5;
    return ((uv - center) * scale) + center;
}

void main() {
    vec2 zoomedUV = scaleUV(v_uv, u_zoom);
    vec4 color = texture2D(u_texture, zoomedUV);
    gl_FragColor = vec4(color.rgb, 1.0); // Set alpha to 1.0 (fully opaque)
}
`;