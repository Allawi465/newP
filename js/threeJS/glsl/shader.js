export const vertexShader = `
    uniform vec2 uOffset;
    uniform float uRotation;
    uniform float uExtraDown;
    varying vec2 vUv;
    const float PI = 3.141592653589793;

    vec3 deformationCurve(vec3 position, vec2 uv, vec2 offset) {
        float PI = 3.141592653589793238;
        float amplitudeX = 0.0035; // Reduced amplitude
        float topCurve = pow(uv.y, 1.0) * (uv.y * (uv.y * 1.0 - 24.0) + 10.0);
        float bottomCurve = pow(1.0 - uv.y, 1.0) * ((1.0 - uv.y) * (1.0 - uv.y * 1.0 - 24.0) + 10.0);
        float bezierCurve = topCurve + bottomCurve;
        position.x += bezierCurve * offset.x * amplitudeX * 1.;
        return position;
    }

    void main() {
    vUv = uv;
    vec3 pos = deformationCurve(position, uv, uOffset);

    float cosA = cos(uRotation);
    float sinA = sin(uRotation);
    float x = pos.x;
    float y = pos.y;
    pos.x = cosA * x - sinA * y;
    pos.y = sinA * x + cosA * y;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const fragmentShader = `
uniform sampler2D uTexture;
uniform float uzom;
uniform vec2 uAspectRatio;
uniform float uBorderRadius;
uniform float opacity;
uniform float uGrayscale;
varying vec2 vUv;

void main() {
    // Adjust UVs
    vec2 textureUv = (vUv - 0.5) * uzom * uAspectRatio + 0.5;

    // Sample the texture
    vec4 texColor = texture2D(uTexture, textureUv);

    // Apply grayscale effect
    vec3 preColor = texColor.rgb * texColor.a;
    float gray = dot(preColor, vec3(0.299, 0.587, 0.114));
    vec3 finalColor = mix(vec3(gray), preColor, uGrayscale);

    // Rounded corners alpha mask
    vec2 diff = abs(vUv - 0.5);
    vec2 limit = vec2(0.5 - uBorderRadius);
    float dist = max(diff.x - limit.x, 0.0) * max(diff.x - limit.x, 0.0) +
                 max(diff.y - limit.y, 0.0) * max(diff.y - limit.y, 0.0);
    float edge = uBorderRadius * uBorderRadius;
    float edgeAlpha = 1.0 - smoothstep(edge - 0.0001, edge + 0.0001, dist);

    // Final fragment color
    gl_FragColor = vec4(finalColor, texColor.a * opacity * edgeAlpha);
}
`;
