const vertex = /*glsl*/ `
#define PI acos(-1.0)

attribute vec2 aIndex;
attribute float aId;

uniform sampler2D uPositions;
uniform float uTime;
uniform float pointSize;
uniform vec3 uCameraPos;

varying vec4 vData;
varying vec2 vIndex;
varying float vDist;

void main() {
    // Sample position data from the texture using aIndex as UV coordinates
    vec4 data = texture2D(uPositions, aIndex);
    vec3 pos = data.rgb;

    // Transform into clip space
    vec4 mvPosition = viewMatrix * modelMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Pass data to fragment shader
    vData = data;
    vIndex = aIndex;
    vDist = distance(pos, uCameraPos);

    // Adjust point size dynamically
    gl_PointSize = 1. + aIndex.x * 4.;
}
`;
export default vertex;