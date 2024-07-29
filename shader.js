export const vertexShader = /* glsl */`
  uniform float u_time;
  uniform float u_strength;
  uniform float u_speed;

  varying vec2 v_uv;

  void main() {
      v_uv = uv;
      vec3 pos = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;;

export const fragmentShader = /* glsl */`
uniform sampler2D u_texture;
uniform float u_time;
uniform float u_zoom; // Ensure this matches

varying vec2 v_uv;

void main() {
    // Adjust texture coordinates based on zoom
    vec2 zoomedUV = v_uv * u_zoom;

    vec4 colorR = texture2D(u_texture, zoomedUV + vec2(0.01, 0.0)); // Red channel
    vec4 colorG = texture2D(u_texture, zoomedUV); // Green channel
    vec4 colorB = texture2D(u_texture, zoomedUV - vec2(0.01, 0.0)); // Blue channel
    
    gl_FragColor = vec4(colorR.r, colorG.g, colorB.b, 1.0); // Combine channels
}
`;