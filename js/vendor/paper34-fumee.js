/*!
 * Fumée de la signature Paper34 — moteur de fluide WebGL.
 * Adapté du WebGL Fluid Simulation de Pavel Dobryakov (MIT) :
 * https://github.com/PavelDoGreat/WebGL-Fluid-Simulation
 * Version statique générée depuis le kit PAPER34-SIGNATURE-KIT/SplashCursor.tsx
 * (types retirés, logique inchangée). Expose Paper34Fumee.monter(conteneur, options)
 * qui renvoie la fonction de démontage. Chargé à la demande par js/main.js.
 */
var Paper34Fumee = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var fumee_exports = {};
  __export(fumee_exports, {
    monter: () => monter
  });
  function monter(container, {
    colors,
    densityDissipation = 3.5,
    velocityDissipation = 2,
    pressure = 0.1,
    curl = 3,
    splatRadius = 0.2,
    splatForce = 6e3,
    hover = true,
    emitRef,
    apiRef
  }) {
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;";
    container.appendChild(canvas);
    const config = {
      SIM_RESOLUTION: 128,
      DYE_RESOLUTION: 1024,
      DENSITY_DISSIPATION: densityDissipation,
      VELOCITY_DISSIPATION: velocityDissipation,
      PRESSURE: pressure,
      PRESSURE_ITERATIONS: 20,
      CURL: curl,
      SPLAT_RADIUS: splatRadius,
      SPLAT_FORCE: splatForce,
      SHADING: true,
      COLOR_UPDATE_SPEED: 10
    };
    const palette = colors && colors.length > 0 ? colors : [
      { r: 0, g: 0.45, b: 0.9 },
      // bleu accent
      { r: 0.1, g: 0.6, b: 1 },
      { r: 0.6, g: 0.4, b: 1 },
      { r: 0, g: 0.3, b: 0.7 }
    ];
    const pointers = [
      {
        id: -1,
        texcoordX: 0,
        texcoordY: 0,
        prevTexcoordX: 0,
        prevTexcoordY: 0,
        deltaX: 0,
        deltaY: 0,
        down: false,
        moved: false,
        color: palette[0]
      }
    ];
    function getWebGLContext(c) {
      const params = {
        alpha: true,
        depth: false,
        stencil: false,
        antialias: false,
        preserveDrawingBuffer: false,
        premultipliedAlpha: false
      };
      let gl2 = c.getContext("webgl2", params);
      const isWebGL22 = !!gl2;
      if (!isWebGL22) {
        gl2 = c.getContext("webgl", params) || c.getContext("experimental-webgl", params);
      }
      if (!gl2) return null;
      let halfFloat = null;
      let supportLinearFiltering = null;
      if (isWebGL22) {
        gl2.getExtension("EXT_color_buffer_float");
        supportLinearFiltering = gl2.getExtension("OES_texture_float_linear");
      } else {
        halfFloat = gl2.getExtension("OES_texture_half_float");
        supportLinearFiltering = gl2.getExtension("OES_texture_half_float_linear");
      }
      gl2.clearColor(0, 0, 0, 0);
      const halfFloatTexType = isWebGL22 ? gl2.HALF_FLOAT : halfFloat == null ? void 0 : halfFloat.HALF_FLOAT_OES;
      let formatRGBA, formatRG, formatR;
      if (isWebGL22) {
        const gl22 = gl2;
        formatRGBA = getSupportedFormat(gl22, gl22.RGBA16F, gl22.RGBA, halfFloatTexType);
        formatRG = getSupportedFormat(gl22, gl22.RG16F, gl22.RG, halfFloatTexType);
        formatR = getSupportedFormat(gl22, gl22.R16F, gl22.RED, halfFloatTexType);
      } else {
        formatRGBA = getSupportedFormat(gl2, gl2.RGBA, gl2.RGBA, halfFloatTexType);
        formatRG = getSupportedFormat(gl2, gl2.RGBA, gl2.RGBA, halfFloatTexType);
        formatR = getSupportedFormat(gl2, gl2.RGBA, gl2.RGBA, halfFloatTexType);
      }
      return {
        gl: gl2,
        ext: {
          formatRGBA,
          formatRG,
          formatR,
          halfFloatTexType,
          supportLinearFiltering
        }
      };
    }
    function getSupportedFormat(gl2, internalFormat, format, type) {
      if (!supportRenderTextureFormat(gl2, internalFormat, format, type)) {
        const gl22 = gl2;
        switch (internalFormat) {
          case gl22.R16F:
            return getSupportedFormat(gl2, gl22.RG16F, gl22.RG, type);
          case gl22.RG16F:
            return getSupportedFormat(gl2, gl22.RGBA16F, gl22.RGBA, type);
          default:
            return null;
        }
      }
      return { internalFormat, format };
    }
    function supportRenderTextureFormat(gl2, internalFormat, format, type) {
      const texture = gl2.createTexture();
      gl2.bindTexture(gl2.TEXTURE_2D, texture);
      gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_MIN_FILTER, gl2.NEAREST);
      gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_MAG_FILTER, gl2.NEAREST);
      gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_WRAP_S, gl2.CLAMP_TO_EDGE);
      gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_WRAP_T, gl2.CLAMP_TO_EDGE);
      gl2.texImage2D(gl2.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
      const fbo = gl2.createFramebuffer();
      gl2.bindFramebuffer(gl2.FRAMEBUFFER, fbo);
      gl2.framebufferTexture2D(gl2.FRAMEBUFFER, gl2.COLOR_ATTACHMENT0, gl2.TEXTURE_2D, texture, 0);
      const status = gl2.checkFramebufferStatus(gl2.FRAMEBUFFER);
      return status === gl2.FRAMEBUFFER_COMPLETE;
    }
    const ctx = getWebGLContext(canvas);
    if (!ctx) {
      return;
    }
    const { gl, ext } = ctx;
    const isWebGL2 = "HALF_FLOAT" in gl;
    function compileShader(type, source, defines = "") {
      const fullSource = defines + source;
      const shader = gl.createShader(type);
      gl.shaderSource(shader, fullSource);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn(gl.getShaderInfoLog(shader));
      }
      return shader;
    }
    function createProgram(vs, fs) {
      const program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.warn(gl.getProgramInfoLog(program));
      }
      return program;
    }
    function getUniforms(program) {
      const uniforms2 = {};
      const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < uniformCount; i++) {
        const info = gl.getActiveUniform(program, i);
        uniforms2[info.name] = gl.getUniformLocation(program, info.name);
      }
      return uniforms2;
    }
    const baseVertexShader = compileShader(
      gl.VERTEX_SHADER,
      `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform vec2 texelSize;
      void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
      `
    );
    const copyShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      uniform sampler2D uTexture;
      void main () {
        gl_FragColor = texture2D(uTexture, vUv);
      }
      `
    );
    const clearShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      uniform sampler2D uTexture;
      uniform float value;
      void main () {
        gl_FragColor = value * texture2D(uTexture, vUv);
      }
      `
    );
    const displayShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uTexture;
      void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;
        float a = max(c.r, max(c.g, c.b));
        gl_FragColor = vec4(c, a);
      }
      `
    );
    const splatShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uTarget;
      uniform float aspectRatio;
      uniform vec3 color;
      uniform vec2 point;
      uniform float radius;
      void main () {
        vec2 p = vUv - point.xy;
        p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
      }
      `
    );
    const advectionShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uVelocity;
      uniform sampler2D uSource;
      uniform vec2 texelSize;
      uniform vec2 dyeTexelSize;
      uniform float dt;
      uniform float dissipation;
      ${ext.supportLinearFiltering ? "" : `
      vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
        vec2 st = uv / tsize - 0.5;
        vec2 iuv = floor(st);
        vec2 fuv = fract(st);
        vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
        vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
        vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
        vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
        return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
      }
      `}
      void main () {
      ${ext.supportLinearFiltering ? `
        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
        vec4 result = texture2D(uSource, coord);
        ` : `
        vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
        vec4 result = bilerp(uSource, coord, dyeTexelSize);
        `}
        float decay = 1.0 + dissipation * dt;
        gl_FragColor = result / decay;
      }
      `
    );
    const divergenceShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;
        vec2 C = texture2D(uVelocity, vUv).xy;
        if (vL.x < 0.0) { L = -C.x; }
        if (vR.x > 1.0) { R = -C.x; }
        if (vT.y > 1.0) { T = -C.y; }
        if (vB.y < 0.0) { B = -C.y; }
        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
      }
      `
    );
    const curlShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        float vorticity = R - L - T + B;
        gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
      }
      `
    );
    const vorticityShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uVelocity;
      uniform sampler2D uCurl;
      uniform float curl;
      uniform float dt;
      void main () {
        float L = texture2D(uCurl, vL).x;
        float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;
        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + 0.0001;
        force *= curl * C;
        force.y *= -1.0;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity += force * dt;
        velocity = min(max(velocity, -1000.0), 1000.0);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
      `
    );
    const pressureShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uDivergence;
      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        float C = texture2D(uPressure, vUv).x;
        float divergence = texture2D(uDivergence, vUv).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
      }
      `
    );
    const gradientSubtractShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
      `
    );
    const programs = {
      copy: createProgram(baseVertexShader, copyShader),
      clear: createProgram(baseVertexShader, clearShader),
      display: createProgram(baseVertexShader, displayShader),
      splat: createProgram(baseVertexShader, splatShader),
      advection: createProgram(baseVertexShader, advectionShader),
      divergence: createProgram(baseVertexShader, divergenceShader),
      curl: createProgram(baseVertexShader, curlShader),
      vorticity: createProgram(baseVertexShader, vorticityShader),
      pressure: createProgram(baseVertexShader, pressureShader),
      gradientSubtract: createProgram(baseVertexShader, gradientSubtractShader)
    };
    const uniforms = {
      copy: getUniforms(programs.copy),
      clear: getUniforms(programs.clear),
      display: getUniforms(programs.display),
      splat: getUniforms(programs.splat),
      advection: getUniforms(programs.advection),
      divergence: getUniforms(programs.divergence),
      curl: getUniforms(programs.curl),
      vorticity: getUniforms(programs.vorticity),
      pressure: getUniforms(programs.pressure),
      gradientSubtract: getUniforms(programs.gradientSubtract)
    };
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    const elementBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
    function blit(target) {
      if (target === null) {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      } else {
        gl.viewport(0, 0, target.width, target.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }
    function createFBO(w, h, internalFormat, format, type, param) {
      gl.activeTexture(gl.TEXTURE0);
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.viewport(0, 0, w, h);
      gl.clear(gl.COLOR_BUFFER_BIT);
      const texelSizeX = 1 / w;
      const texelSizeY = 1 / h;
      return {
        texture,
        fbo,
        width: w,
        height: h,
        texelSizeX,
        texelSizeY,
        attach(id) {
          gl.activeTexture(gl.TEXTURE0 + id);
          gl.bindTexture(gl.TEXTURE_2D, texture);
          return id;
        }
      };
    }
    function createDoubleFBO(w, h, internalFormat, format, type, param) {
      let fbo1 = createFBO(w, h, internalFormat, format, type, param);
      let fbo2 = createFBO(w, h, internalFormat, format, type, param);
      return {
        width: w,
        height: h,
        texelSizeX: 1 / w,
        texelSizeY: 1 / h,
        get read() {
          return fbo1;
        },
        set read(v) {
          fbo1 = v;
        },
        get write() {
          return fbo2;
        },
        set write(v) {
          fbo2 = v;
        },
        swap() {
          const t = fbo1;
          fbo1 = fbo2;
          fbo2 = t;
        }
      };
    }
    function getResolution(resolution) {
      let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
      if (aspectRatio < 1) aspectRatio = 1 / aspectRatio;
      const min = Math.round(resolution);
      const max = Math.round(resolution * aspectRatio);
      if (gl.drawingBufferWidth > gl.drawingBufferHeight) {
        return { width: max, height: min };
      }
      return { width: min, height: max };
    }
    let dye;
    let velocity;
    let divergence;
    let curlFbo;
    let pressureFbo;
    function initFramebuffers() {
      const simRes = getResolution(config.SIM_RESOLUTION);
      const dyeRes = getResolution(config.DYE_RESOLUTION);
      const texType = ext.halfFloatTexType;
      const rgba = ext.formatRGBA;
      const rg = ext.formatRG;
      const r = ext.formatR;
      const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
      gl.disable(gl.BLEND);
      dye = createDoubleFBO(
        dyeRes.width,
        dyeRes.height,
        rgba.internalFormat,
        rgba.format,
        texType,
        filtering
      );
      velocity = createDoubleFBO(
        simRes.width,
        simRes.height,
        rg.internalFormat,
        rg.format,
        texType,
        filtering
      );
      divergence = createFBO(
        simRes.width,
        simRes.height,
        r.internalFormat,
        r.format,
        texType,
        gl.NEAREST
      );
      curlFbo = createFBO(
        simRes.width,
        simRes.height,
        r.internalFormat,
        r.format,
        texType,
        gl.NEAREST
      );
      pressureFbo = createDoubleFBO(
        simRes.width,
        simRes.height,
        r.internalFormat,
        r.format,
        texType,
        gl.NEAREST
      );
    }
    function resizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      const cssW = container.clientWidth;
      const cssH = container.clientHeight;
      const w = Math.floor(cssW * dpr);
      const h = Math.floor(cssH * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        return true;
      }
      return false;
    }
    resizeCanvas();
    initFramebuffers();
    function splat(x, y, dx, dy, color) {
      gl.useProgram(programs.splat);
      gl.uniform1i(uniforms.splat.uTarget, velocity.read.attach(0));
      gl.uniform1f(uniforms.splat.aspectRatio, canvas.width / canvas.height);
      gl.uniform2f(uniforms.splat.point, x, y);
      gl.uniform3f(uniforms.splat.color, dx, dy, 0);
      gl.uniform1f(uniforms.splat.radius, correctRadius(config.SPLAT_RADIUS / 100));
      blit(velocity.write);
      velocity.swap();
      gl.uniform1i(uniforms.splat.uTarget, dye.read.attach(0));
      gl.uniform3f(uniforms.splat.color, color.r, color.g, color.b);
      blit(dye.write);
      dye.swap();
    }
    function correctRadius(radius) {
      const aspectRatio = canvas.width / canvas.height;
      if (aspectRatio > 1) radius *= aspectRatio;
      return radius;
    }
    function splatPointer(p) {
      const dx = p.deltaX * config.SPLAT_FORCE;
      const dy = p.deltaY * config.SPLAT_FORCE;
      splat(p.texcoordX, p.texcoordY, dx, dy, p.color);
    }
    function applyInputs() {
      pointers.forEach((p) => {
        if (p.moved) {
          p.moved = false;
          splatPointer(p);
        }
      });
    }
    function step(dt) {
      gl.disable(gl.BLEND);
      gl.useProgram(programs.curl);
      gl.uniform2f(uniforms.curl.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(uniforms.curl.uVelocity, velocity.read.attach(0));
      blit(curlFbo);
      gl.useProgram(programs.vorticity);
      gl.uniform2f(uniforms.vorticity.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(uniforms.vorticity.uVelocity, velocity.read.attach(0));
      gl.uniform1i(uniforms.vorticity.uCurl, curlFbo.attach(1));
      gl.uniform1f(uniforms.vorticity.curl, config.CURL);
      gl.uniform1f(uniforms.vorticity.dt, dt);
      blit(velocity.write);
      velocity.swap();
      gl.useProgram(programs.divergence);
      gl.uniform2f(uniforms.divergence.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(uniforms.divergence.uVelocity, velocity.read.attach(0));
      blit(divergence);
      gl.useProgram(programs.clear);
      gl.uniform1i(uniforms.clear.uTexture, pressureFbo.read.attach(0));
      gl.uniform1f(uniforms.clear.value, config.PRESSURE);
      blit(pressureFbo.write);
      pressureFbo.swap();
      gl.useProgram(programs.pressure);
      gl.uniform2f(uniforms.pressure.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(uniforms.pressure.uDivergence, divergence.attach(0));
      for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
        gl.uniform1i(uniforms.pressure.uPressure, pressureFbo.read.attach(1));
        blit(pressureFbo.write);
        pressureFbo.swap();
      }
      gl.useProgram(programs.gradientSubtract);
      gl.uniform2f(uniforms.gradientSubtract.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(uniforms.gradientSubtract.uPressure, pressureFbo.read.attach(0));
      gl.uniform1i(uniforms.gradientSubtract.uVelocity, velocity.read.attach(1));
      blit(velocity.write);
      velocity.swap();
      gl.useProgram(programs.advection);
      gl.uniform2f(uniforms.advection.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      if (!ext.supportLinearFiltering) {
        gl.uniform2f(uniforms.advection.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
      }
      const velocityId = velocity.read.attach(0);
      gl.uniform1i(uniforms.advection.uVelocity, velocityId);
      gl.uniform1i(uniforms.advection.uSource, velocityId);
      gl.uniform1f(uniforms.advection.dt, dt);
      gl.uniform1f(uniforms.advection.dissipation, config.VELOCITY_DISSIPATION);
      blit(velocity.write);
      velocity.swap();
      if (!ext.supportLinearFiltering) {
        gl.uniform2f(uniforms.advection.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
      }
      gl.uniform1i(uniforms.advection.uVelocity, velocity.read.attach(0));
      gl.uniform1i(uniforms.advection.uSource, dye.read.attach(1));
      gl.uniform1f(uniforms.advection.dissipation, config.DENSITY_DISSIPATION);
      blit(dye.write);
      dye.swap();
    }
    function render() {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(programs.display);
      gl.uniform1i(uniforms.display.uTexture, dye.read.attach(0));
      blit(null);
    }
    let lastTime = performance.now();
    let rafId = 0;
    function update() {
      const now = performance.now();
      let dt = (now - lastTime) / 1e3;
      dt = Math.min(dt, 0.016666);
      lastTime = now;
      if (resizeCanvas()) initFramebuffers();
      applyInputs();
      step(dt);
      render();
      rafId = requestAnimationFrame(update);
    }
    update();
    function getColor() {
      const c = palette[Math.floor(Math.random() * palette.length)];
      return { r: c.r * 0.15, g: c.g * 0.15, b: c.b * 0.15 };
    }
    function updatePointer(p, x, y) {
      const rect = container.getBoundingClientRect();
      p.prevTexcoordX = p.texcoordX;
      p.prevTexcoordY = p.texcoordY;
      p.texcoordX = (x - rect.left) / rect.width;
      p.texcoordY = 1 - (y - rect.top) / rect.height;
      p.deltaX = correctDeltaX(p.texcoordX - p.prevTexcoordX);
      p.deltaY = correctDeltaY(p.texcoordY - p.prevTexcoordY);
      p.moved = Math.abs(p.deltaX) > 0 || Math.abs(p.deltaY) > 0;
    }
    function correctDeltaX(delta) {
      const aspectRatio = canvas.width / canvas.height;
      if (aspectRatio < 1) delta *= aspectRatio;
      return delta;
    }
    function correctDeltaY(delta) {
      const aspectRatio = canvas.width / canvas.height;
      if (aspectRatio > 1) delta /= aspectRatio;
      return delta;
    }
    const onMouseMove = (e) => {
      if (emitRef && emitRef.current === false) return;
      if (hover) {
        const p = pointers[0];
        if (!p.color || p.color === palette[0]) p.color = getColor();
        updatePointer(p, e.clientX, e.clientY);
      } else {
        const p = pointers[0];
        if (!p.down) return;
        updatePointer(p, e.clientX, e.clientY);
      }
    };
    const onTouchMove = (e) => {
      if (emitRef && emitRef.current === false) return;
      const touch = e.touches[0];
      if (!touch) return;
      const p = pointers[0];
      if (!p.color || p.color === palette[0]) p.color = getColor();
      updatePointer(p, touch.clientX, touch.clientY);
    };
    const onTouchStart = (e) => {
      if (emitRef && emitRef.current === false) return;
      const touch = e.touches[0];
      if (!touch) return;
      const p = pointers[0];
      p.color = getColor();
      const rect = container.getBoundingClientRect();
      p.texcoordX = (touch.clientX - rect.left) / rect.width;
      p.texcoordY = 1 - (touch.clientY - rect.top) / rect.height;
      p.prevTexcoordX = p.texcoordX;
      p.prevTexcoordY = p.texcoordY;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    if (apiRef) {
      apiRef.current = {
        splashAt(clientX, clientY, intensity = 1) {
          const rect = container.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return;
          const cx = (clientX - rect.left) / rect.width;
          const cy = 1 - (clientY - rect.top) / rect.height;
          const count = 14;
          const force = config.SPLAT_FORCE * 0.55 * intensity;
          for (let i = 0; i < count; i++) {
            const angle = i / count * Math.PI * 2;
            splat(
              cx,
              cy,
              Math.cos(angle) * force,
              Math.sin(angle) * force,
              getColor()
            );
          }
        }
      };
    }
    return () => {
      if (apiRef) apiRef.current = null;
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchstart", onTouchStart);
      const loseContext = gl.getExtension("WEBGL_lose_context");
      loseContext == null ? void 0 : loseContext.loseContext();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }
  return __toCommonJS(fumee_exports);
})();
