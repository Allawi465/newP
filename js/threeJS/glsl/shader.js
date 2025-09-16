export const vertexShader = `
  uniform vec2 uOffset;
  uniform float uRotation;
  uniform float uDistanceScale; 
  uniform float uIsDragging; 
  varying vec2 vUv;
  const float PI = 3.141592653589793;

  vec3 setPosition(vec3 position) {
      vec3 positionNew = position;
      // Auto-adapt to viewport width for consistent panoramic effect on resize
      float viewWidth = 2.0 / projectionMatrix[0][0];
      float normalizedX = abs((modelMatrix * vec4(position, 1.0)).x);
      float distanceFromCenter = normalizedX * uDistanceScale;
      float bulge = 0.029 * pow(distanceFromCenter, 2.) * uIsDragging;
      positionNew.y *= 1. + bulge;
      return positionNew;
  }

  vec3 deformation(vec3 position, vec2 uv, vec2 offset) {
      float PI = 3.141592653589793238;
      float amplitudeX = 0.0035; // Reduced amplitude
      float top = pow(uv.y, 1.0) * (uv.y * (uv.y * 1.0 - 15.0) + 10.0);
      float bottom = pow(1.0 - uv.y, 1.0) * ((1.0 - uv.y) * (1.0 - uv.y * 1.0 - 15.0) + 10.0);
      float bezier = top + bottom;
      position.x += bezier * offset.x * amplitudeX * 1.;
      return position;
  }

  void main() {
      vUv = uv;
      vec3 pos = deformation(position, uv, uOffset);
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
