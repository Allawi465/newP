const vertex = /*glsl*/ `
#define PI acos(-1.0)

attribute vec2 aIndex;
attribute float aId;

uniform sampler2D uPositions;
uniform float pointSize;

varying vec4 vData;
varying vec2 vIndex;

void main() {
    vec4 data = texture2D(uPositions, aIndex);
    vec3 pos = data.rgb;

    vec4 mvPosition = viewMatrix * modelMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    vData = data;
    vIndex = aIndex;

    gl_PointSize = 1. + aIndex.x * 6.;
}
`;

export default vertex;