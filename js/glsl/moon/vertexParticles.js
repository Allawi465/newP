const vertexParticles = /*glsl*/ `
uniform float time; 
varying vec2 vUv;
varying vec3 vPosition;
varying vec4 vColor;
uniform sampler2D uPositions;
float PI = 3.141592653589793238;

void main() {
  vUv = uv;
  vec4 pos = texture2D(uPositions, uv);

  float angle = atan(pos.y, pos.x );

 vec4 baseColor = 0.8 * vec4(0.5 + 0.45 * sin(angle + time * 0.4));

// Modify the color to create darker tones
baseColor.rgb *= vec3(
    0.7 + 0.3 * sin(time * 0.05), // Red oscillates between 0.7 and 1
    0.7 + 0.3 * cos(time * 0.05), // Green oscillates between 0.7 and 1
    0.7 + 0.3 * sin(time * 0.05)  // Blue oscillates between 0.7 and 1
);

// Scale down the intensity slightly
baseColor.rgb *= 0.7; // Adjust this factor as needed to keep it vibrant but suitable for a light background

// Ensure no color value exceeds a certain threshold to keep the colors bright but not too saturated
baseColor.rgb = min(baseColor.rgb, vec3(0.95)); // Allowing slightly lower than white

// Assign the final color
vColor = baseColor;

  vec4 mvPosition = modelViewMatrix * vec4(pos.xyz, 1.);

  gl_PointSize = 1. * (1. / - mvPosition.z); 

  gl_Position = projectionMatrix * mvPosition;
}
`;

export default vertexParticles;