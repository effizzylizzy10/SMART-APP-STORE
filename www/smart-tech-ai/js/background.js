// --- WebGL animated background (falls back to the CSS glow if WebGL is unavailable) ---
(function () {
  const cv = $('gl'), gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) return;
  const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const fs = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 r;uniform float t;uniform vec2 m;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fb(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p*=2.02;a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/r;
  vec2 p=(uv-.5)*vec2(r.x/r.y,1.)*2.2+(m-.5)*.35;
  float T=t*.06;
  vec2 q=vec2(fb(p+T),fb(p+vec2(5.2,1.3)-T));
  float f=fb(p+2.*q+T*.7);
  vec3 col=mix(vec3(.36,.36,.94),vec3(.13,.83,.93),smoothstep(.25,.85,q.x));
  col=mix(col,vec3(.65,.55,.98),smoothstep(.35,.9,q.y)*.6);
  vec3 o=vec3(.039,.047,.086)+col*smoothstep(.35,.95,f)*.30*(1.-uv.y*.35);
  o+=(h(gl_FragCoord.xy+t)-.5)*.012;
  gl_FragColor=vec4(o,1.);
}`;
  const sh = (ty, src) => { const o = gl.createShader(ty); gl.shaderSource(o, src); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null; };
  const a = sh(gl.VERTEX_SHADER, vs), b = sh(gl.FRAGMENT_SHADER, fs); if (!a || !b) return;
  const pg = gl.createProgram(); gl.attachShader(pg, a); gl.attachShader(pg, b); gl.linkProgram(pg);
  if (!gl.getProgramParameter(pg, gl.LINK_STATUS)) return;
  gl.useProgram(pg);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pg, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const ur = gl.getUniformLocation(pg, 'r'), ut = gl.getUniformLocation(pg, 't'), um = gl.getUniformLocation(pg, 'm');
  let mx = .5, my = .5, tx = .5, ty = .5, raf = 0; const t0 = performance.now();
  const size = () => { const k = Math.min(devicePixelRatio || 1, 1.5) * .6; cv.width = Math.max(2, Math.round(innerWidth * k)); cv.height = Math.max(2, Math.round(innerHeight * k)); gl.viewport(0, 0, cv.width, cv.height); };
  addEventListener('resize', size); size();
  addEventListener('pointermove', e => { tx = e.clientX / innerWidth; ty = 1 - e.clientY / innerHeight; }, { passive: true });
  const still = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const draw = now => {
    mx += (tx - mx) * .05; my += (ty - my) * .05;
    gl.uniform2f(ur, cv.width, cv.height); gl.uniform1f(ut, (now - t0) / 1000 + 20); gl.uniform2f(um, mx, my);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    raf = !still && !document.hidden ? requestAnimationFrame(draw) : 0;
  };
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !raf) raf = requestAnimationFrame(draw); });
  cv.addEventListener('webglcontextlost', e => { e.preventDefault(); cancelAnimationFrame(raf); raf = 0; cv.classList.remove('on'); document.body.classList.remove('gl'); });
  raf = requestAnimationFrame(draw); cv.classList.add('on'); document.body.classList.add('gl');
})();
