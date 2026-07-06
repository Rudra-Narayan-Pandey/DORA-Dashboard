import React, { useEffect, useRef } from 'react';

export const LiquidMetalShader = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    let animationFrameId;

    const syncSize = () => {
      const w = canvas.clientWidth || 800;
      const h = canvas.clientHeight || 600;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    const resizeObserver = new ResizeObserver(syncSize);
    resizeObserver.observe(canvas);
    syncSize();

    const vs = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fs = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      varying vec2 v_texCoord;
      
      void main() {
          vec2 uv = v_texCoord;
          float time = u_time * 0.5;
          
          // Liquid metal distortion
          vec2 p = uv * 2.0 - 1.0;
          p.x *= u_resolution.x / u_resolution.y;
          
          for(float i = 1.0; i < 5.0; i++) {
              p.x += 0.2 / i * sin(i * 4.0 * p.y + time + i * 1.5);
              p.y += 0.2 / i * cos(i * 3.5 * p.x + time + i * 0.8);
          }
          
          float metal = sin(p.x * 2.0 + p.y * 2.0 + time);
          metal = smoothstep(-1.0, 1.0, metal);
          
          // AetherOS Colors: Cyan (#00f2ff) and deep space
          vec3 baseColor = vec3(0.04, 0.06, 0.12);
          vec3 highlight = vec3(0.0, 0.86, 0.91);
          vec3 violet = vec3(0.19, 0.19, 0.75);
          
          vec3 color = mix(baseColor, highlight, metal * 0.4);
          color += violet * (1.0 - metal) * 0.2;
          
          // Specular shine
          float shine = pow(metal, 10.0);
          color += highlight * shine * 0.6;
          
          gl_FragColor = vec4(color, 0.95);
      }
    `;

    const compileShader = (type, src) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      return shader;
    };

    const program = gl.createProgram();
    gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vs));
    gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, 'u_time');
    const uResolution = gl.getUniformLocation(program, 'u_resolution');

    const render = (t) => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uResolution) gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    };

    render(0);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full opacity-80 pointer-events-none" 
      style={{ display: 'block' }}
    />
  );
};
export default LiquidMetalShader;
