const AW = `
//	Simplex 3D Noise 
//	by Ian McEwan, Ashima Arts
//
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise3(vec3 v){ 
const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
vec3 i  = floor(v + dot(v, C.yyy) );
vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
vec3 g = step(x0.yzx, x0.xyz);
vec3 l = 1.0 - g;
vec3 i1 = min( g.xyz, l.zxy );
vec3 i2 = max( g.xyz, l.zxy );

//  x0 = x0 - 0. + 0.0 * C 
vec3 x1 = x0 - i1 + 1.0 * C.xxx;
vec3 x2 = x0 - i2 + 2.0 * C.xxx;
vec3 x3 = x0 - 1. + 3.0 * C.xxx;

// Permutations
i = mod(i, 289.0 ); 
vec4 p = permute( permute( permute( 
            i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
        + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients
// ( N*N points uniformly over a square, mapped onto an octahedron.)
float n_ = 1.0/7.0; // N=7
vec3  ns = n_ * D.wyz - D.xzx;

vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

vec4 x_ = floor(j * ns.z);
vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

vec4 x = x_ *ns.x + ns.yyyy;
vec4 y = y_ *ns.x + ns.yyyy;
vec4 h = 1.0 - abs(x) - abs(y);

vec4 b0 = vec4( x.xy, y.xy );
vec4 b1 = vec4( x.zw, y.zw );

vec4 s0 = floor(b0)*2.0 + 1.0;
vec4 s1 = floor(b1)*2.0 + 1.0;
vec4 sh = -step(h, vec4(0.0));

vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

vec3 p0 = vec3(a0.xy,h.x);
vec3 p1 = vec3(a0.zw,h.y);
vec3 p2 = vec3(a1.xy,h.z);
vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
p0 *= norm.x;
p1 *= norm.y;
p2 *= norm.z;
p3 *= norm.w;

// Mix final noise value
vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
m = m * m;
return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}
`
const simFragment = /*glsl*/ `
uniform float time;
uniform sampler2D uPositions;
uniform vec4 resolution;
uniform vec2 uMouse;


// Randomization Uniforms
uniform float uRandom;
uniform float uRandom2;
uniform vec3 uSpherePos;
uniform float uDelta;

varying vec2 vUv;
varying vec4 vPosition;

float PI = 3.141592653589793238;

${AW}

// Random Function
float rand1(float n){return fract(sin(n) * 43758.5453123);}

float rand2(vec2 co){ return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);}

// 3D Simplex Noise Vector Motion
 vec3 snoiseVec3( vec3 x ){
    float s  = snoise3(vec3( x ));
    float s1 = snoise3(vec3( x.y - 19.1 , x.z + 33.4 , x.x + 47.2 ));
    float s2 = snoise3(vec3( x.z + 74.2 , x.x - 124.5 , x.y + 99.4 ));
    vec3 c = vec3( s , s1 , s2 );
    return c;
}

// Function to generate a random point on a sphere
  vec3 randomSpherePoint(vec3 center, float radius, vec3 pos){
    float u = rand2(vec2(uRandom, pos.x));
    float v = rand2(vec2(uRandom2, pos.y * pos.z));
    float theta = 2.0 * PI * u;
    float phi = acos(2.0 * v - 1.0);
    float x = center.x + (radius * sin(phi) * cos(theta));
    float y = center.y + (radius * sin(phi) * sin(theta));
    float z = center.z + (radius * cos(phi));
    return vec3(x, y, z);
}


void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 data = texture2D(uPositions, uv);
    vec3 pos = data.rgb;
    float age = data.a;

    // Reset particles
    bool condition = age >= 1.0;
    float spawnRadius = 0.4 + rand1(pos.x) * 0.1; // Larger spawn area
    vec3 spawnPosition = randomSpherePoint(vec3(0.0), spawnRadius, pos);
    pos = mix(pos, spawnPosition, float(condition));
    age = mix(age, 0.0, float(condition));

    // Enhanced noise-driven motion with multiple layers
    vec3 curl1 = snoiseVec3(pos * 0.5 + vec3(time * 0.2, time * 0.1, time * 0.05)) * 0.3;
    vec3 curl2 = snoiseVec3(pos * 2.0 + vec3(time * 0.5)) * 0.01;
    vec3 newpos = pos + curl1 + curl2;

    // Relaxed bounding
    newpos = mix(newpos, pos, distance(vec3(0.0), newpos) / 3.);
    pos = mix(pos, newpos, 0.1);

    age += uDelta * 0.09;
    
    float dist = length(pos.xy - uSpherePos.xy);
    vec2 dir = normalize(pos.xy - uSpherePos.xy);
    pos.xy += dir * 0.1 * smoothstep(0.5, 0.0, dist);

    gl_FragColor = vec4(pos, age);
}
    
`;

export default simFragment;



/* 

uniform float time;
uniform float progress;
uniform sampler2D uPositions;
uniform vec4 resolution;
uniform vec2 uMouse;


// Randomization Uniforms
uniform float uRandom;
uniform float uRandom2;
uniform vec3 uSpherePos;
uniform vec3 uCameraPos;
uniform float uDelta;

varying vec2 vUv;
varying vec4 vPosition;

float PI = 3.141592653589793238;

${AW}

// Random Function
float rand1(float n){return fract(sin(n) * 43758.5453123);}

float rand2(vec2 co){ return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);}

// 3D Simplex Noise Vector Motion
vec3 snoiseVec3(vec3 x) {
    float s  = snoise3(x);
    float s1 = snoise3(vec3(x.y - 19.1, x.z + 33.4, x.x + 47.2));
    float s2 = snoise3(vec3(x.z + 74.2, x.x - 124.5, x.y + 99.4));
    vec3 c = vec3(s, s1, s2);
    return c;
}

// Function to generate a random point on a sphere
vec3 randomSpherePoint(vec3 center, float radius, vec3 pos) {
    float u = rand2(vec2(uRandom, pos.x));
    float v = rand2(vec2(uRandom2, pos.y * pos.z));
    float theta = 2.0 * PI * u;
    float phi = acos(2.0 * v - 1.0);
    float x = center.x + (radius * sin(phi) * cos(theta));
    float y = center.y + (radius * sin(phi) * sin(theta));
    float z = center.z + (radius * cos(phi));
    return vec3(x, y, z);
}

vec3 repel(vec3 position, vec3 repulsionVector, float minDistance) {
    float distance = length(position - repulsionVector);
    vec3 direction = normalize(position - repulsionVector);
    float adjustedDistance = clamp(distance, minDistance, distance);
    position = mix(position, repulsionVector + direction * minDistance, step(distance, minDistance));
    return position;
}

vec3 closestPointOnLine(vec3 linePointA, vec3 linePointB, vec3 position) {
    vec3 lineDirection = normalize(linePointB - linePointA);
    float t = dot(position - linePointA, lineDirection);
    return linePointA + t * lineDirection;
}


float noise1(float p){
    float fl = floor(p);
    float fc = fract(p);
    return mix(rand1(fl), rand1(fl + 1.0), fc);
}

vec3 curlNoise(vec3 p) {
    float eps = 0.1;
    vec3 dx = vec3(eps, 0.0, 0.0);
    vec3 dy = vec3(0.0, eps, 0.0);
    vec3 dz = vec3(0.0, 0.0, eps);

    float x = snoise3(p + dx) - snoise3(p - dx);
    float y = snoise3(p + dy) - snoise3(p - dy);
    float z = snoise3(p + dz) - snoise3(p - dz);

    return normalize(vec3(x, y, z)) * 1.5;
}


vec3 orbitalMotion(vec3 pos, vec3 center, float speed, float radius) {
    vec3 toCenter = pos - center;
    float dist = length(toCenter);
    vec3 normal = normalize(toCenter);
    vec3 up = vec3(0.0, 1.0, 0.0);
    vec3 tangent = normalize(cross(normal, up));
    float angle = time * speed * (1.0 + rand1(pos.x));
    vec3 orbit = tangent * cos(angle) + cross(tangent, normal) * sin(angle);
    return center + normal * radius + orbit * radius * 0.5;
}


void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 data = texture2D(uPositions, uv);
    vec3 pos = data.rgb;
    float age = data.a;

    bool condition = age >= 1.0;
    float repulsion_radius = 0.2;
    float spawnRadius = repulsion_radius + rand1(pos.x) * 0.2;
    vec3 spawnPosition = randomSpherePoint(vec3(0.), spawnRadius, pos);

    pos = mix(pos, spawnPosition, float(condition));
    age = mix(age, 0.0, float(condition));

    // **Kombiner Curl Noise, Simplex Noise og Flow Direction**
    vec3 curl = curlNoise(pos + time * 0.1) * 0.001; 
    vec3 noise = snoiseVec3(pos + time * 0.1) * 0.008;

    vec3 newpos = pos + curl + noise;

    float minDistance = repulsion_radius;

    pos = newpos;
    newpos = mix(newpos, pos, distance(vec3(0.0), newpos) / 1.5);
    pos = mix(pos, newpos, 0.1); 

    vec3 repulsionVector = closestPointOnLine(uCameraPos, uSpherePos, pos);
    pos = repel(pos, repulsionVector, minDistance);

    age += uDelta * 0.05;

    float dist = length(pos.xy - uMouse);
    vec2 dir = normalize(pos.xy - uMouse);
    pos.xy += dir * 0.1 * smoothstep(0.4, 0.0, dist);

    gl_FragColor = vec4(pos, age);
}
`;

*/