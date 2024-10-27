export const vertexShader = `
    uniform vec2 uOffset;
    uniform float uDistanceScale;
    varying vec2 vUv;

    vec3 setPosition(vec3 position) {
        vec3 positionNew = position;

        // Calculate the distance from the center along the X-axis
        float distanceFromCenter = abs((modelMatrix * vec4(position, 1.0)).x * uDistanceScale);

        // Apply scaling effect only at the edges
        float edgeThreshold = 0.01; // Adjust this threshold for more or less edge effect
        float scaleEffect = 1.0 + smoothstep(edgeThreshold, 1.0, distanceFromCenter) * 0.2 * pow(distanceFromCenter, 2.0);

        // Apply scaling effect to y position based on distance from center
        positionNew.y *= scaleEffect;

        return positionNew;
    }

    vec3 deformationCurve(vec3 position, vec2 uv, vec2 offset) {
        float PI = 3.141592653589793238;
        float amplitudeX = 0.0055;

        float topCurve = pow(uv.y, 1.0) * (uv.y * (uv.y * 1.0 - 24.0) + 10.0);
        float bottomCurve = pow(1.0 - uv.y, 1.0) * ((1.0 - uv.y) * (1.0 - uv.y * 1.0 - 24.0) + 10.0);

        float bezierCurve = topCurve + bottomCurve;

        position.x += bezierCurve * offset.x * amplitudeX * 0.8;

        return position;
    }

    void main() {
        vUv = uv;
        vec3 newPosition = deformationCurve(position, uv, uOffset);
        newPosition = setPosition(newPosition);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
`;

export const fragmentShader = `
    uniform sampler2D uTexture;
    uniform float uzom;
    uniform vec2 uAspectRatio; // Aspect ratio for object-fit
    uniform float uBorderRadius;
    uniform float opacity; // Opacity uniform
    varying vec2 vUv;

    void main() {
        // Adjust UV for zoom and aspect ratio
        vec2 uv = (vUv - 0.5) * uzom * uAspectRatio + 0.5;
        vec4 textureColor = texture2D(uTexture, uv);

        // Calculate border clipping
        vec2 diff = abs((uv - 0.5) / uzom);
        vec2 limit = vec2(0.5 - uBorderRadius);

        // Apply border radius discard
        if (max(diff.x - limit.x, 0.0) * max(diff.x - limit.x, 0.0) +
            max(diff.y - limit.y, 0.0) * max(diff.y - limit.y, 0.0) > uBorderRadius * uBorderRadius) {
            discard;
        }

        // Output with opacity applied
        gl_FragColor = vec4(textureColor.rgb, textureColor.a * opacity);
    }
`;