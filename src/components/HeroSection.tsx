"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { PORTFOLIO_DATA } from "@/data/portfolio";

// Typewriter effect
function Typewriter({ text, speed = 60, onDone }: { text: string; speed?: number; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        setDone(true);
        clearInterval(interval);
        onDone?.();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, onDone]);

  return (
    <span>
      {displayed}
      {!done && <span className="inline-block w-[2px] h-[1em] bg-white ml-[2px] animate-pulse align-middle" />}
    </span>
  );
}

// Atomizer-like particle effect on the avatar placeholder
function ParticleAvatar() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const SIZE = 280;
    canvas.width = SIZE;
    canvas.height = SIZE;

    type Particle = {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      life: number;
    };

    const particles: Particle[] = [];
    const cx = SIZE / 2;
    const cy = SIZE / 2;

    // Create particles arranged into "MA" initials
    function createLetterParticles() {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = SIZE;
      tempCanvas.height = SIZE;
      const tempCtx = tempCanvas.getContext("2d")!;

      tempCtx.fillStyle = "#000";
      tempCtx.fillRect(0, 0, SIZE, SIZE);
      tempCtx.font = "bold 120px Arial, sans-serif";
      tempCtx.textAlign = "center";
      tempCtx.textBaseline = "middle";
      tempCtx.fillStyle = "#fff";
      tempCtx.fillText("MA", cx, cy);

      const imageData = tempCtx.getImageData(0, 0, SIZE, SIZE);
      const gap = 4;

      for (let y = 0; y < SIZE; y += gap) {
        for (let x = 0; x < SIZE; x += gap) {
          const i = (y * SIZE + x) * 4;
          if (imageData.data[i] > 128) {
            const hue = Math.random() * 40 + 200; // blue-purple hues
            particles.push({
              x: Math.random() * SIZE,
              y: Math.random() * SIZE,
              targetX: x,
              targetY: y,
              vx: 0,
              vy: 0,
              size: Math.random() * 2 + 1,
              color: `hsla(${hue}, 70%, 65%, 0.9)`,
              life: 1,
            });
          }
        }
      }
    }

    createLetterParticles();

    let mouseX = -999;
    let mouseY = -999;
    const mouseForce = 4000;

    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });
    canvas.addEventListener("mouseleave", () => {
      mouseX = -999;
      mouseY = -999;
    });

    let animId: number;

    function animate() {
      ctx!.clearRect(0, 0, SIZE, SIZE);

      for (const p of particles) {
        // Attraction to target
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        p.vx += dx * 0.03;
        p.vy += dy * 0.03;

        // Mouse repulsion
        const mdx = p.x - mouseX;
        const mdy = p.y - mouseY;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < 80) {
          const force = mouseForce / (mDist * mDist + 1);
          p.vx += (mdx / mDist) * force * 0.01;
          p.vy += (mdy / mDist) * force * 0.01;
        }

        // Damping
        p.vx *= 0.88;
        p.vy *= 0.88;
        p.x += p.vx;
        p.y += p.vy;

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = p.color;
        ctx!.fill();
      }

      animId = requestAnimationFrame(animate);
    }

    animate();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative group">
      <canvas
        ref={canvasRef}
        className="w-[280px] h-[280px] cursor-pointer rounded-xl"
      />
      <p className="text-xs text-white/30 text-center mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        Hover over the photo
      </p>
    </div>
  );
}

export default function HeroSection() {
  const { personal } = PORTFOLIO_DATA;

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden"
    >
      <div className="relative z-10 max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        {/* Text side */}
        <div className="flex-1 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
              {personal.name}
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            <h2 className="text-xl md:text-2xl text-blue-400 font-medium mb-6">
              {personal.title}
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
          >
            <p className="text-lg text-gray-400 max-w-lg leading-relaxed">
              {personal.bio}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="mt-8 flex gap-4 justify-center lg:justify-start"
          >
            <a
              href={personal.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-white text-sm font-medium transition-all hover:scale-105"
            >
              GitHub
            </a>
            <a
              href={personal.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-full text-white text-sm font-medium transition-all hover:scale-105"
            >
              LinkedIn
            </a>
            <a
              href={`mailto:${personal.email}`}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-white text-sm font-medium transition-all hover:scale-105"
            >
              Contact
            </a>
          </motion.div>
        </div>

        {/* Avatar / Particle art */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          className="flex-shrink-0"
        >
          <ParticleAvatar />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-white/30 text-xs tracking-[0.3em] uppercase">
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-8 border-2 border-white/20 rounded-full flex items-start justify-center p-1"
          >
            <div className="w-1 h-2 bg-white/40 rounded-full" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
