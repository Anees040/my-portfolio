"use client";

import { useRef, useEffect } from "react";

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let stars: {
      x: number;
      y: number;
      z: number;
      size: number;
      opacity: number;
    }[] = [];
    const STAR_COUNT = 600;
    const SPEED = 0.15;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    function initStars() {
      stars = [];
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * canvas!.width - canvas!.width / 2,
          y: Math.random() * canvas!.height - canvas!.height / 2,
          z: Math.random() * 1000,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
        });
      }
    }

    function drawNebula() {
      if (!ctx || !canvas) return;
      // Subtle nebula-like gradients
      const g1 = ctx.createRadialGradient(
        canvas.width * 0.3,
        canvas.height * 0.4,
        0,
        canvas.width * 0.3,
        canvas.height * 0.4,
        canvas.width * 0.5
      );
      g1.addColorStop(0, "rgba(30, 10, 60, 0.15)");
      g1.addColorStop(0.5, "rgba(20, 5, 40, 0.08)");
      g1.addColorStop(1, "transparent");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const g2 = ctx.createRadialGradient(
        canvas.width * 0.7,
        canvas.height * 0.6,
        0,
        canvas.width * 0.7,
        canvas.height * 0.6,
        canvas.width * 0.4
      );
      g2.addColorStop(0, "rgba(10, 20, 60, 0.12)");
      g2.addColorStop(0.5, "rgba(5, 15, 40, 0.06)");
      g2.addColorStop(1, "transparent");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    let rotation = 0;

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dark bg
      ctx.fillStyle = "rgb(5, 5, 12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawNebula();

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      rotation += SPEED * 0.001;

      for (const star of stars) {
        // Slow rotation
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);
        const rx = star.x * cos - star.y * sin;
        const ry = star.x * sin + star.y * cos;

        const perspective = 500 / (500 + star.z);
        const sx = rx * perspective + cx;
        const sy = ry * perspective + cy;
        const size = star.size * perspective;

        // Twinkle
        star.opacity += (Math.random() - 0.5) * 0.02;
        star.opacity = Math.max(0.1, Math.min(1, star.opacity));

        // Move star toward viewer
        star.z -= SPEED;
        if (star.z <= 0) {
          star.z = 1000;
          star.x = Math.random() * canvas.width - canvas.width / 2;
          star.y = Math.random() * canvas.height - canvas.height / 2;
        }

        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 220, 255, ${star.opacity})`;
        ctx.fill();

        // Small glow on brighter stars
        if (star.opacity > 0.7 && size > 1.2) {
          ctx.beginPath();
          ctx.arc(sx, sy, size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(150, 180, 255, ${star.opacity * 0.1})`;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(draw);
    }

    resize();
    initStars();
    draw();

    window.addEventListener("resize", () => {
      resize();
      initStars();
    });

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
}
