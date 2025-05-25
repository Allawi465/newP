export const vertexShader = `
    uniform vec2 uOffset;
    uniform float uDistanceScale;
    uniform float uRotation;
    uniform float uExtraDown;
    varying vec2 vUv;
    const float PI = 3.141592653589793;

    vec3 setPosition(vec3 position) {
        vec3 positionNew = position;
        float distanceFromCenter = abs((modelMatrix * vec4(position, 1.0)).x * uDistanceScale);
        float edgeThreshold = 0.01;
        float scaleEffect = 1.0 + smoothstep(edgeThreshold, 1.0, distanceFromCenter) * 0.05 * distanceFromCenter; // Reduced intensity
        positionNew.y *= scaleEffect;
        return positionNew;
    }

    vec3 deformationCurve(vec3 position, vec2 uv, vec2 offset) {
        float PI = 3.141592653589793238;
        float amplitudeX = 0.002; // Reduced amplitude
        float topCurve = pow(uv.y, 1.0) * (uv.y * (uv.y * 1.0 - 24.0) + 10.0);
        float bottomCurve = pow(1.0 - uv.y, 1.0) * ((1.0 - uv.y) * (1.0 - uv.y * 1.0 - 24.0) + 10.0);
        float bezierCurve = topCurve + bottomCurve;
        position.x += bezierCurve * offset.x * amplitudeX * 0.9;
        return position;
    }

  
    void main() {
    vUv = uv;
    vec3 pos = deformationCurve(position, uv, uOffset);
    pos = setPosition(pos);

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
varying vec2 vUv;

void main() {
    // Adjust UVs
    vec2 textureUv = (vUv - 0.5) * uzom * uAspectRatio + 0.5;

    // Sample the texture
    vec4 texColor = texture2D(uTexture, textureUv);

    vec3 preColor = texColor.rgb * texColor.a;

    // Rounded corners alpha mask
    vec2 diff = abs(vUv - 0.5);
    vec2 limit = vec2(0.5 - uBorderRadius);
    float dist = max(diff.x - limit.x, 0.0) * max(diff.x - limit.x, 0.0) +
                 max(diff.y - limit.y, 0.0) * max(diff.y - limit.y, 0.0);
    float edge = uBorderRadius * uBorderRadius;
    float edgeAlpha = 1.0 - smoothstep(edge - 0.0001, edge + 0.0001, dist);

    // Final fragment color
    gl_FragColor = vec4(preColor, texColor.a * opacity * edgeAlpha);
}
`;
