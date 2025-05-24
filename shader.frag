// precision mediump float;
// varying vec2 vTexCoord;
// uniform sampler2D textTex;
// uniform float time;
// uniform vec2 resolution;
//
// vec3 random3(vec3 c) {
//   float j = 4096.0 * sin(dot(c, vec3(17.0, 59.4, 15.0)));
//   vec3 r;
//   r.z = fract(512.0 * j);
//   j *= .125;
//   r.x = fract(512.0 * j);
//   j *= .125;
//   r.y = fract(512.0 * j);
//   return r - 0.5;
// }
//
// const float F3 = 0.3333333;
// const float G3 = 0.1666667;
// float snoise(vec3 p) {
//
//   vec3 s = floor(p + dot(p, vec3(F3)));
//   vec3 x = p - s + dot(s, vec3(G3));
//
//   vec3 e = step(vec3(0.0), x - x.yzx);
//   vec3 i1 = e * (1.0 - e.zxy);
//   vec3 i2 = 1.0 - e.zxy * (1.0 - e);
//
//   vec3 x1 = x - i1 + G3;
//   vec3 x2 = x - i2 + 2.0 * G3;
//   vec3 x3 = x - 1.0 + 3.0 * G3;
//
//   vec4 w, d;
//
//   w.x = dot(x, x);
//   w.y = dot(x1, x1);
//   w.z = dot(x2, x2);
//   w.w = dot(x3, x3);
//
//   w = max(0.6 - w, 0.0);
//
//   d.x = dot(random3(s), x);
//   d.y = dot(random3(s + i1), x1);
//   d.z = dot(random3(s + i2), x2);
//   d.w = dot(random3(s + 1.0), x3);
//
//   w *= w;
//   w *= w;
//   d *= w;
//
//   return dot(d, vec4(52.0));
// }
//
// void main() {
//   // float noise_scale = 1.5;
//   // float dwn_y = 40.0;
//   // float dwn_x = dwn_y * resolution.x / resolution.y;
//   //
//   // vec2 texuv = vTexCoord;
//   // texuv.y = 1.0 - texuv.y;
//   // texuv = vec2(floor(texuv.x * dwn_x) / dwn_x, floor(texuv.y * dwn_y) /
//   // dwn_y); vec4 text = texture2D(textTex, texuv);
//   //
//   // vec3 p3 = vec3(noise_scale * texuv.x * resolution.x / resolution.y,
//   //                noise_scale * texuv.y, time);
//   // float noise = 0.5 + 0.5 * snoise(p3 * 8.0 + 8.0);
//   // float value = max(floor(noise * 20.0) / 20.0, text.a);
//   // vec3 color1 = vec3(196.0 / 255.0, 89.0 / 255.0, 222.0 / 255.0);
//   // vec3 color2 = vec3(11.0 / 255.0, 123.0 / 255.0, 229.0 / 255.0);
//   // vec3 color = mix(color1, color2, abs(sin(2.0 * texuv.x + 2.0 * time)));
//   // float alpha = floor(noise * 4.0) / 4.0;
//   // gl_FragColor = vec4(vec3(value) * color, alpha);
//   float noise_scale = 1.5;
//   float dwn_y = 40.0;
//   float dwn_x = dwn_y * resolution.x / resolution.y;
//
//   vec2 texuv = vTexCoord;
//   texuv.y = 1.0 - texuv.y;
//   texuv = vec2(floor(texuv.x * dwn_x) / dwn_x, floor(texuv.y * dwn_y) /
//   dwn_y); vec4 text = texture2D(textTex, texuv);
//
//   vec3 p3 = vec3(noise_scale * texuv.x * resolution.x / resolution.y,
//                  noise_scale * texuv.y, time);
//   float noise = 0.5 + 0.5 * snoise(p3 * 8.0 + 8.0);
//   float value = max(floor(noise * 10.0) / 10.0, text.a);
//   value = pow(value, 2.75);
//   vec3 color1 = vec3(196.0 / 255.0, 89.0 / 255.0, 222.0 / 255.0);
//   vec3 color2 = vec3(11.0 / 255.0, 123.0 / 255.0, 229.0 / 255.0);
//   vec3 color = mix(color1, color2, abs(sin(2.0 * texuv.x + 2.0 * time)));
//   float alpha = floor(noise * 2.0) / 2.0;
//   alpha = pow(alpha, 0.4);
//   gl_FragColor = vec4(vec3(value) * color, alpha);
// }
