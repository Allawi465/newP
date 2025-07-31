
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
uniform float uReset;
uniform float uRandom;
uniform float uRandom2;
uniform sampler2D uInfo;
uniform vec3 uSpherePos;
uniform float uDelta;
uniform float uFooter; 

varying vec2 vUv;
varying vec4 vPosition;

#define PI acos(-1.0)

${AW}

// Random helpers
float rand1(float n) {
    return fract(sin(n) * 43758.5453123);
}

float rand2(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 snoiseVec3(vec3 x) {
    float s = snoise3(x);
    float s1 = snoise3(vec3(x.y - 19.1, x.z + 33.4, x.x + 47.2));
    float s2 = snoise3(vec3(x.z + 74.2, x.x - 124.5, x.y + 99.4));
    return vec3(s, s1, s2);
}

vec3 randomSpherePoint(vec3 center, float radius, vec3 pos) {
    float u = rand2(vec2(uRandom, pos.x));
    float v = rand2(vec2(uRandom2, pos.y * pos.z));
    float w = rand2(vec2(uRandom, pos.z * pos.y));
    float theta = 2.0 * PI * u;
    float phi = acos(2.0 * v - 1.0);
    float r = radius * pow(w, 1.0 / 3.0);
    return center + vec3(
        r * sin(phi) * cos(theta),
        r * sin(phi) * sin(theta),
        r * cos(phi)
    );
}

vec3 randomPointInSphere(vec2 uv, float minRadius, float maxRadius) {
    float x = rand2(uv + vec2(3.1, 1.7)) * 2.0 - 1.0;
    float y = rand2(uv + vec2(7.7, 2.3)) * 2.0 - 1.0;
    float z = rand2(uv + vec2(2.6, 5.4)) * 2.0 - 1.0;

    vec3 dir = normalize(vec3(x, y, z));

    float r = pow(rand2(uv + vec2(11.3, 9.8)), 1.0 / 3.0);
    float radius = mix(minRadius, maxRadius, r);

    return dir * radius;
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 data = texture2D(uPositions, uv);
        vec4 info = texture2D(uInfo, vUv);

    vec3 pos = data.rgb;
    float age = data.a;

    // ===== PAGE 1 =====
    vec3 pos1 = pos;
    float age1 = age;

    {
        bool respawn = age1 >= 1.0;
        float spawnRadius = 0.5 + rand1(pos1.x) * 0.5;
        vec3 spawnPos = randomSpherePoint(uSpherePos, spawnRadius, pos1);

        spawnPos += vec3(
            rand2(vec2(uRandom, pos1.y)) - 0.2,
            rand2(vec2(uRandom2, pos1.z)) - 0.25,
            rand2(vec2(uRandom, pos1.x)) - 0.3
        ) * 0.2;

        pos1 = mix(pos1, spawnPos, float(respawn));
        age1 = mix(age1, 0.0, float(respawn));

        vec3 noise = snoiseVec3(pos1 * 0.5 + vec3(time * 0.2)) * 0.14;
        float desiredRadius = 1.0;
        float radiusDiff = desiredRadius - length(pos1 - uSpherePos);

        vec3 correction = normalize(pos1 - uSpherePos) * radiusDiff * 0.04;

        vec3 newpos1 = pos1 + noise + correction;

        float dist = length(pos1.xy - uSpherePos.xy);
        vec2 dir = normalize(pos1.xy - uSpherePos.xy);
        pos1.xy += dir * 0.1 * smoothstep(0.59, 0.0, dist);

        pos1 = mix(pos1, newpos1, 0.1);
        age1 = clamp(age1 + uDelta * 0.1, 0.0, 1.0);
    }

    // ===== PAGE 2 — COSMOS-STYLE + CIRCULAR ANIMATION =====

    vec3 pos2 = pos;
    float age2 = age;

    {
        // Cosmos-style animation (original)
        vec3 randomDir = normalize(randomPointInSphere(vUv, 1.0, 1.0));
        float scatterRadius = mix(10.0, 15.0, uReset); 
        vec3 cosmosTargetPos = randomDir * scatterRadius;
        float t;
        t = pow(uReset, 5.0) * 0.02;
        vec3 cosmosPos = mix(pos2, cosmosTargetPos, t);

        // Circular animation (new)
        float radius = length(pos2.xy);
        float circlularForce = 1. - smoothstep(0.3, 1.4, abs(pos.x - radius));
        float angle = atan(pos.y, pos.x) - info.y * 0.2 * mix(0.5, 1., circlularForce);
        float targetRadius = mix(info.x, 2.2, 0.5 + 0.05 * sin(angle*2. + time*0.2));
        radius +=(targetRadius - radius) * mix(0.2,0.5,circlularForce);


        vec3 targetPos = vec3(cos(angle), sin(angle), 0.0) * radius;        

        pos2.xy += (targetPos.xy - pos.xy) * 0.16;


        // Blend between cosmos and circular based on uFooter
        pos2 = mix(cosmosPos, targetPos, smoothstep(0.0, 1.0, uFooter));

    }

    // ===== FINAL MIX =====
    float blend = smoothstep(0.999, 1.0, uReset);
    vec3 finalPos = mix(pos1, pos2, blend);
    float finalAge = mix(age1, age2, blend);

    gl_FragColor = vec4(finalPos, finalAge);
}
`;

export default simFragment;