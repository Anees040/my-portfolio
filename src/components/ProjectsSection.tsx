"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { PORTFOLIO_DATA } from "@/data/portfolio";

export default function ProjectsSection() {
  const { projects } = PORTFOLIO_DATA;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="projects" className="relative py-28 px-6" ref={ref}>
      {/* Watermark */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 text-[8vw] font-black text-white/[0.02] uppercase whitespace-nowrap pointer-events-none select-none tracking-widest">
        Projects
      </div>

      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-white mb-4"
        >
          🚀 Featured Projects
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-gray-400 text-lg mb-16 max-w-2xl"
        >
          Here are some of the apps I&apos;ve built. Each one taught me
          something new and pushed my skills further.
        </motion.p>

        <div className="grid md:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <motion.a
              key={i}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.15 }}
              className="group relative rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.15] transition-all duration-500 flex flex-col"
            >
              {/* Gradient header */}
              <div
                className="h-32 relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${project.gradient[0]}, ${project.gradient[1]})`,
                }}
              >
                {/* Decorative pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-4 right-4 w-16 h-16 border-2 border-white/30 rounded-lg rotate-12" />
                  <div className="absolute bottom-4 left-4 w-10 h-10 border-2 border-white/20 rounded-full" />
                  <div className="absolute top-8 left-12 w-6 h-6 bg-white/10 rounded" />
                </div>
                {/* Flutter icon placeholder */}
                <div className="absolute bottom-3 right-4 text-3xl opacity-40 group-hover:opacity-70 transition-opacity">
                  📱
                </div>
                {/* Arrow */}
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {project.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-4 flex-1">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {project.tech.map((tech, j) => (
                    <span
                      key={j}
                      className="text-[11px] px-2 py-0.5 rounded bg-white/[0.06] text-gray-400 border border-white/[0.04]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
