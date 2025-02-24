const vertex = /*glsl*/ `
varying float vAge;
varying vec2 vUv;
varying vec3 vPosition;
uniform sampler2D uPositions;
uniform float pointSize;

void main() {
    vUv = uv; 
    vec4 pos = texture2D(uPositions, uv); 
    vAge = pos.a;  
    vPosition = pos.xyz;
    
    vec4 mvPosition = modelViewMatrix * vec4(vPosition, 1.0);
    gl_PointSize = pointSize;
    gl_Position = projectionMatrix * mvPosition;
}
`;
export default vertex;