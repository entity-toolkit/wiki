precision mediump float;

varying vec2 glCoord;

uniform sampler2D textTex;
uniform float time;
uniform vec2 resolution;
uniform float mouseX;
uniform float mouseY;
uniform int anim;

#define PI 3.1415926535
#define TWO_PI 6.283185307

vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec3 fade(vec3 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

float cnoise(vec3 P) {
  vec3 Pi0 = floor(P);
  vec3 Pi1 = Pi0 + vec3(1.0);
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P);
  vec3 Pf1 = Pf0 - vec3(1.0);
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
  vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
  vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
  vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
  vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
  vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
  vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
  vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);

  vec4 norm0 = taylorInvSqrt(
      vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(
      vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111),
                 fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return 2.2 * n_xyz;
}

vec3 hsl2rgb(in vec3 c) {
  vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0,
                   0.0, 1.0);

  return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
}

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123 +
               0.01 * time);
}

vec2 randomV2(vec2 st) { return vec2(random(st), random(st + 1.0)); }

const vec3 col1 = vec3(0.897, 0.65, 0.49 + 0.1);
const vec3 col2 = vec3(0.833, 0.43, 0.49 + 0.1);
const vec3 col3 = vec3(0.592, 0.49, 0.48 + 0.1);
const vec3 col4 = vec3(0.564, 0.57, 0.57 + 0.1);

float wave(float x, float t, float frequency, float kmag, float phase, float width) {
  float xprime = x - (sin(kmag * x - frequency * time + phase) + 1.0) * 0.5;
  return pow(1.0 - exp(-pow(xprime / width, 2.0)) * (sin(250.0 * xprime) + 2.0) / 3.0, 2.0);
}

float radial_wave(float r, float t, float frequency, float kmag, float width, float timevariability, float reprate) {
  return 1.0 - 0.4 * sin(10.0 * exp(-pow(sin(kmag * TWO_PI * r - frequency * t) + timevariability * sin(reprate * t) + 1.0 + timevariability, 0.5) / (width * width))) - 0.4;
}

float cosmicrays(float x, float y, float t, float rotation_freq, float duration, float size) {
  float tau = t / duration;
  float tau0 = floor(tau);
  float t0 = duration * tau0;
  vec2 pos = (2.0 * (tau - tau0) - 1.0) * vec2(cos(rotation_freq * t0), sin(rotation_freq * t0));
  vec2 vel = -vec2(cos(rotation_freq * t0), sin(rotation_freq * t0));
  vec2 diff = (vec2(x, y) - pos);
  float theta = acos((diff.x * vel.x + diff.y * vel.y) / length(diff));
  return 2.0 * pow(2.0 * dot(diff, diff), size) * (1.0 - 0.8 * exp(-theta * theta / 0.06)) * exp(pow(tau - tau0, 2.0));
  // return pow(2.0 * dot(diff, diff), 0.2) * (1.0 - exp(-theta*theta / 0.02));
  // return (1.0 - exp(-theta*theta / 0.02));
  // return (x * pos.x + y * pos.y) * 10.0;
}

void main() {
  vec2 aspect = vec2(1.0, resolution.x / resolution.y);
  vec2 uv = glCoord;
  vec2 aspect_inv = resolution.x / aspect;

  uv.y = 1.0 - uv.y;

  vec2 amplitude = aspect * 0.1 * 2.0 * (randomV2(uv) - 0.5);
  // 
  // float dist = (0.5 * (1.0 + sin(10.0 * uv.x + 0.1 * time)) + 0.5) / 1.5;
  // float xprime1 = uv.x - (sin(0.1 * (5.0 * uv.x - time)) + 1.0) * 0.5;
  // float dist1 = 1.0 - exp(-pow(xprime1, 2.0) / 0.02) * (sin(250.0 * xprime1) + 2.0) * 0.33;
  // float xprime2 = uv.x - (sin(0.1 * (2.0 * uv.x - time) + 10.0) + 1.0) * 0.5;
  // float dist2 = 1.0 - exp(-pow(xprime2, 2.0) / 0.02) * (sin(100.0 * xprime2) + 2.0) * 0.33;
  float dist = 0.0;
  if (anim == 0) {
    float dist1 = wave(uv.x, time, 0.1, 0.001, 0.0, 0.25);
    float dist2 = wave(uv.x, time, 0.12, 0.01, 10.0, 0.15);
    float dist3 = wave(uv.y, time, 0.1, 0.01, 0.0, 0.25);
    float dist4 = wave(uv.y, time, 0.12, 0.02, 10.0, 0.15);
    dist = pow(0.95 * (dist1 + dist2 + dist3 + dist4) * 0.25, 2.0);
  } else if (anim == 1) {
    dist = 0.5 * (cnoise(vec3(10.0 * uv / aspect, 0.05 * time)) + 1.0);
  } else if (anim == 2) {
    float radius = pow(uv.x - 0.5, 2.0) + pow((uv.y - 0.5) / aspect.y, 2.0);
    dist = radial_wave(radius, time, 0.1, 25.0, 0.5, 0.2, 0.1);
  } else if (anim == 3) {
    float dist1 = cosmicrays(uv.x - 0.5, (uv.y - 0.5) / aspect.y, time + 100.0, 0.3, 50.0, 0.25);
    float dist2 = cosmicrays(uv.x - 0.5, (uv.y - 0.5) / aspect.y, time + 10.0, 0.1, 30.0, 0.4);
    float dist3 = cosmicrays(uv.x - 0.5, (uv.y - 0.5) / aspect.y, time + 60.0, 0.5, 80.0, 0.33);
    dist = min(min(dist1, dist2), dist3);
  }
  // dist = clamp(dist1, 0.0, 1.0);
  // dist = cosmicrays(uv.x - 0.5, (uv.y - 0.5) / aspect.y, 1410.0, 0.3, 400.0);
  // dist = 1.0 - exp(-pow(sin(15.0 * TWO_PI * radius - 0.25 * time) + 0.0 * sin(0.6 * time) + 1.0, 0.5) / 0.25);
  //
  dist = clamp(dist, 0.0, 1.0);

  float distMouse = distance(uv * resolution, vec2(mouseX, mouseY));
  float decay = exp(-dist * dist / (0.3 * 0.3)) +
                0.75 * exp(-distMouse * distMouse / (50.0 * 50.0));
  float alpha = texture2D(textTex, uv + amplitude * decay).a;
  vec3 color = vec3(alpha);
  vec3 mul = vec3(0.0);
  if (dist < 1.0 / 3.0) {
    mul = mix(col1, col2, dist * 3.0);
  }
  if (dist >= 1.0 / 3.0 && dist < 2.0 / 3.0) {
    mul = mix(col2, col3, (dist - 1.0 / 3.0) * 3.0);
  }
  if (dist >= 2.0 / 3.0 && dist <= 1.1) {
    mul = mix(col3, col4, (dist - 2.0 / 3.0) * 3.0);
  }
  gl_FragColor = vec4(color * hsl2rgb(mul), alpha);
  // gl_FragColor = vec4(vec3(dist), alpha);
}
