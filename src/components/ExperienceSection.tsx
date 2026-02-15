"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { PORTFOLIO_DATA } from "@/data/portfolio";

export default function ExperienceSection() {
  const { experience } = PORTFOLIO_DATA;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="experience" className="relative py-28 px-6" ref={ref}>
      {/* Watermark */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 text-[8vw] font-black text-white/[0.02] uppercase whitespace-nowrap pointer-events-none select-none tracking-widest">
        Experience
      </div>

      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-white mb-4"
        >
          🏢 Work Experience
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-gray-400 text-lg mb-16"
        >
          {"Let's step back through my experience, and the places I've worked."}
        </motion.p>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-white/20 via-white/10 to-transparent" />

          <div className="space-y-12">
            {experience.map((exp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -40 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.2 }}
                className="relative pl-16 md:pl-20"
              >
                {/* Timeline dot */}
                <div
                  className="absolute left-[18px] md:left-[26px] top-2 w-4 h-4 rounded-full border-2 border-current"
                  style={{ color: exp.color, boxShadow: `0 0 12px ${exp.color}40` }}
                >
                  <div
                    className="absolute inset-1 rounded-full"
                    style={{ background: exp.color }}
                  />
                </div>

                {/* Card */}
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all group">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {exp.company}
                      </h3>
                      <p className="text-blue-400 font-medium text-sm">
                        {exp.role}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full whitespace-nowrap">
                      {exp.period}
                    </span>
                  </div>

                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    {exp.description}
                  </p>

                  {/* Tech badges */}
                  <div className="flex flex-wrap gap-2">
                    {exp.tech.map((tech, j) => (
                      <span
                        key={j}
                        className="text-xs px-2.5 py-1 rounded-md bg-white/[0.06] text-gray-300 border border-white/[0.06]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
