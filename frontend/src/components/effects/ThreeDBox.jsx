import React, { useEffect, useRef } from 'react';

export const ThreeDBox = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const syncSize = () => {
      canvas.width = canvas.parentElement.clientWidth || 500;
      canvas.height = canvas.parentElement.clientHeight || 400;
    };

    window.addEventListener('resize', syncSize);
    syncSize();

    // 3D vertices of a box matching 1.2 x 0.8 x 0.05
    const vertices = [
      [-120, -80, -5], // 0
      [ 120, -80, -5], // 1
      [ 120,  80, -5], // 2
      [-120,  80, -5], // 3
      [-120, -80,  5], // 4
      [ 120, -80,  5], // 5
      [ 120,  80,  5], // 6
      [-120,  80,  5]  // 7
    ];

    // Edges connecting vertices
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // Back face
      [4, 5], [5, 6], [6, 7], [7, 4], // Front face
      [0, 4], [1, 5], [2, 6], [3, 7]  // Connectors
    ];

    // Ambient floating particles
    const particles = Array.from({ length: 45 }, () => ({
      x: (Math.random() - 0.5) * 400,
      y: (Math.random() - 0.5) * 300,
      z: (Math.random() - 0.5) * 100,
      speedZ: -0.2 - Math.random() * 0.3
    }));

    let angleX = 0.2;
    let angleY = 0.3;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) - 0.5;
      mouseY = (e.clientY / window.innerHeight) - 0.5;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Math rotations helper
    const rotateX = (x, y, z, angle) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return [x, y * cos - z * sin, y * sin + z * cos];
    };

    const rotateY = (x, y, z, angle) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return [x * cos + z * sin, y, -x * sin + z * cos];
    };

    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const fov = 400; // perspective focal length

      // Adjust rotation angles based on mouse drift
      angleY = mouseX * 0.8;
      angleX = -mouseY * 0.8;

      const hoverOffset = Math.sin(time * 0.002) * 8; // subtle floating movement

      // Project & Draw Box Edges
      const projected = vertices.map(([vx, vy, vz]) => {
        // Rotate box coords
        let [rx, ry, rz] = rotateY(vx, vy, vz, angleY);
        [rx, ry, rz] = rotateX(rx, ry, rz, angleX);
        ry += hoverOffset;
        
        // Z distance projection offset
        const scale = fov / (fov + rz + 100);
        return [cx + rx * scale, cy + ry * scale];
      });

      // Draw particle system first
      ctx.fillStyle = 'rgba(0, 242, 255, 0.4)';
      particles.forEach(p => {
        p.z += p.speedZ;
        if (p.z < -100) p.z = 100; // loop back
        
        let [rx, ry, rz] = rotateY(p.x, p.y, p.z, angleY);
        [rx, ry, rz] = rotateX(rx, ry, rz, angleX);
        ry += hoverOffset;

        const scale = fov / (fov + rz + 100);
        const px = cx + rx * scale;
        const py = cy + ry * scale;

        if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
          ctx.beginPath();
          ctx.arc(px, py, Math.max(0.5, 1.5 * scale), 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw Box Faces Fill
      ctx.fillStyle = 'rgba(0, 242, 255, 0.02)';
      ctx.beginPath();
      ctx.moveTo(projected[0][0], projected[0][1]);
      projected.slice(0, 4).forEach(([x, y]) => ctx.lineTo(x, y));
      ctx.closePath();
      ctx.fill();

      // Draw Box Edges
      ctx.strokeStyle = 'rgba(0, 242, 255, 0.6)';
      ctx.lineWidth = 1;
      edges.forEach(([u, v]) => {
        ctx.beginPath();
        ctx.moveTo(projected[u][0], projected[u][1]);
        ctx.lineTo(projected[v][0], projected[v][1]);
        ctx.stroke();
      });

      // Glow points at vertices
      ctx.fillStyle = '#00f2ff';
      projected.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      window.removeEventListener('resize', syncSize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" 
    />
  );
};
export default ThreeDBox;
