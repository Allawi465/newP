import noise from '../noise/noise';

const transitionFragment = /*glsl*/ `
varying vec2 vUv;
uniform float progress;
uniform float width;
uniform float scaleY;
uniform float scaleX;
uniform float time;

${noise}

void main() {
  vec4 resolution = vec4(1.0);
  
  float dt = parabola(progress, 1.0);
  float border = 1.0;
  vec2 newUV = (vUv - vec2(0.05)) * resolution.zw + vec2(0.05);

  float realnoise = 0.7 * (cnoise(vec4(
    newUV.x * scaleX + 0. * time / 3.,
    newUV.y * scaleY,
    0. * time / 3.,
    0.
  )) + 1.0);

  // original mask logic
  float w = width * dt;
  float maskvalue = smoothstep(
    1.0 - w,
    1.0,
    vUv.y + mix(-w / 2.0, 1.0 - w / 2.0, progress)
  );
  float mask = maskvalue + maskvalue * realnoise;

  float final = smoothstep(border, border + 0.01, mask);

  float alpha = 1.0 - final;
  vec3 white = vec3(1.0);

  gl_FragColor = vec4(white, alpha);
}
`;

export default transitionFragment;
