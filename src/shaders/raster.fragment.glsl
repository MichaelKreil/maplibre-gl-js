uniform float u_fade_t;
uniform float u_opacity;
uniform sampler2D u_image0;
uniform sampler2D u_image1;
varying vec2 v_pos0;
varying vec2 v_pos1;

uniform float u_limit;
uniform float u_width0;
uniform float u_width1;

void main() {
    // read and cross-fade colors from the main and parent tiles
    vec4 color0 = texture2D(u_image0, v_pos0);
    vec4 color1 = texture2D(u_image1, v_pos1);
    if (color0.a > 0.0) {
        color0.rgb = color0.rgb / color0.a;
    }
    if (color1.a > 0.0) {
        color1.rgb = color1.rgb / color1.a;
    }
    vec4 color = mix(color0, color1, u_fade_t);
    color.a *= u_opacity;

    float v = color.r;
    float width = mix(u_width0, u_width1, v_pos1.y);
    v = (v - u_limit)/width;
    v = clamp(0.5 - v, 0.0, 1.0);
    v = min(v, color.g);
    v = v*color.a;
    gl_FragColor = vec4(0.8*v, 0.0, 0.0, v);

    //gl_FragColor = vec4(v_pos1, 0.0, 1.0);

#ifdef OVERDRAW_INSPECTOR
    gl_FragColor = vec4(1.0);
#endif
}
