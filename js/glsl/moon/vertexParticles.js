const vertexParticles = /*glsl*/ `
uniform float time;
uniform int colorMode; // Uniform to switch between modes
varying vec2 vUv;
varying vec4 vColor;
uniform sampler2D uPositions;
float PI = 3.141592653589793238;

void main() {
  vUv = uv;
  vec4 pos = texture2D(uPositions, uv);
  float angle = atan(pos.y, pos.x);
  vec4 baseColor; // Define baseColor only once

  // Mode 0: Original Color Scheme
  if (colorMode == 0) {
    baseColor = 0.8 * vec4(0.5 + 0.45 * sin(angle + time * 0.4));
    baseColor.rgb *= vec3(
    0.8 + 0.2 * sin(angle + time * 0.01),  // Red channel with oscillation
    0.5 + 0.4 * cos(angle + time * 0.01),  // Green channel, more subdued
    0.9 + 0.1 * sin(angle + time * 0.01)   // Blue channel, close to bright blue
  );
    baseColor.rgb *= 0.9;
    baseColor.rgb = min(baseColor.rgb, vec3(0.9));
  } 
  // Mode 1: Light Color Scheme for Small Screens
else {
    // Start with a medium-dark gray base color
    baseColor = vec4(0.05); // Overall gray intensity

    // Adjust RGB to be closer to a neutral gray, not near white
    baseColor.rgb *= vec3(
      0.09, // Darker red component for gray
      0.09, // Darker green component for gray
      0.09  // Darker blue component for gray
    );

    // Mix towards a slightly darker gray to make it more pronounced
    baseColor.rgb = mix(baseColor.rgb, vec3(0.09), 0.09); // Adjusted to medium gray
}

  vColor = baseColor;
  vec4 mvPosition = modelViewMatrix * vec4(pos.xyz, 1.0);
  gl_PointSize = 1.5 * (1. / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`;

export default vertexParticles;