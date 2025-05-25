const vertexParticles = /*glsl*/ `
uniform float time;
uniform float opacity; // Uniform for opacity animation
uniform sampler2D uPositions; // Texture containing positions
varying vec2 vUv; // Pass UV coordinates to fragment shader
varying vec4 vColor; // Pass color to fragment shader
float PI = 3.141592653589793238;

void main() {
  vUv = uv; // Assign UV coordinates to the varying
  vec4 pos = texture2D(uPositions, uv); // Sample positions from the texture
  float angle = atan(pos.y, pos.x);
  vec4 baseColor;

    baseColor = vec4(1.); // Gray base color
    baseColor.rgb *= vec3(1.0);
    baseColor.rgb = mix(baseColor.rgb, vec3(0.5), 1.0);
    
  baseColor.a *= opacity;

  vColor = baseColor; // Pass final color to the fragment shader
  vec4 mvPosition = modelViewMatrix * vec4(pos.xyz, 1.0); // Apply model-view matrix
  gl_PointSize = 1.5 * (1. / -mvPosition.z); // Set point size
  gl_Position = projectionMatrix * mvPosition; // Apply projection matrix
}
`;

export default vertexParticles;


/*   // Mode 0: Original Color Scheme
  if (colorMode == 0) {
    baseColor = 0.8 * vec4(0.5 + 0.35 * sin(angle + time * 0.35), 
                       0.5 + 0.35, 
                       0.5 + 0.35, 
                       1.0); 
    baseColor.rgb *= vec3(
      0.5 + 0.3 * sin(angle + time * 0.04),  // Red channel
      0.5 + 0.45 * cos(angle + time * 0.04),  // Green channel
      0.5 + 0.25 * sin(angle + time * 0.04)   // Blue channel
    );
    baseColor.rgb *= 0.8;
    baseColor.rgb = min(baseColor.rgb, vec3(1.));
  } 

  else {
    baseColor = vec4(0.05); // Gray base color
    baseColor.rgb *= vec3(0.09, 0.09, 0.09); // Neutral gray
    baseColor.rgb = mix(baseColor.rgb, vec3(0.09), 0.09);
  } */