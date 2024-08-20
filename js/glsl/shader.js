export const vertexShader = `
    uniform vec2 uOffset;
    uniform float uDistanceScale;
    varying vec2 vUv;
    
    vec3 setPosition(vec3 position) {
        vec3 positionNew = position;
        float distanceFromCenter = abs((modelMatrix * vec4(position, 1.0)).x * uDistanceScale);

        positionNew.y *= 1. + 0.02 * pow(distanceFromCenter, 2.);
        return positionNew;
    }

    vec3 deformationCurve(vec3 position, vec2 uv, vec2 offset) {
        float M_PI = 3.1415926535897932384626433832795;
        position.x += sin(uv.y * M_PI) * offset.x;
        position.y += sin(uv.x * M_PI) * offset.y;
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