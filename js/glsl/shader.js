export const vertexShader = `
    uniform vec2 uOffset;
    uniform float uDistanceScale;
    varying vec2 vUv;
    
    vec3 setPosition(vec3 position) {
        vec3 positionNew = position;

        float distanceFromCenter = abs((modelMatrix * vec4(position, 1.0)).x * uDistanceScale);

        positionNew.y *= 1. + 0.2 * pow(distanceFromCenter, 2.); 

        return positionNew;
    }

    vec3 deformationCurve(vec3 position, vec2 uv, vec2 offset) {
        float PI = 3.141592653589793238;
        float amplitudeX = 0.0045;

        float topCurve = pow(uv.y, 1.0) * (uv.y * (uv.y * 1.0 - 24.0) + 10.0);
        float bottomCurve = pow(1.0 - uv.y, 1.0) * ((1.0 - uv.y) * (1.0 - uv.y * 1.0 - 24.0) + 10.0);

        float bezierCurve = topCurve + bottomCurve;

        position.x += bezierCurve * offset.x * amplitudeX * 0.9;

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
    uniform float uBorderRadius;
    varying vec2 vUv;

    void main() {
        vec2 uv = (vUv - 0.5) * uzom + 0.5;
        vec4 textureColor = texture2D(uTexture, uv);

        vec2 center = vec2(0.5, 0.5);
        vec2 diff = abs((uv - 0.5) / uzom);
        vec2 size = vec2(0.5) - uBorderRadius;

        if (diff.x > size.x && diff.y > size.y) {
            float dx = diff.x - size.x;
            float dy = diff.y - size.y;
            if (dx * dx + dy * dy > uBorderRadius * uBorderRadius) {
                discard;
            }
        } else if (diff.x > size.x) {
            if (diff.x - size.x > uBorderRadius) {
                discard;
            }
        } else if (diff.y > size.y) {
            if (diff.y - size.y > uBorderRadius) {
                discard;
            }
        }

        gl_FragColor = vec4(textureColor.rgb, textureColor.a);
    }
`;