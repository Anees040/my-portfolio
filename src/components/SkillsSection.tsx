"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { PORTFOLIO_DATA } from "@/data/portfolio";

export default function SkillsSection() {
  const { skills } = PORTFOLIO_DATA;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="skills" className="relative py-28 px-6" ref={ref}>
      {/* Watermark bg text */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 text-[8vw] font-black text-white/[0.02] uppercase whitespace-nowrap pointer-events-none select-none tracking-widest">
        The Details
      </div>

      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-white mb-4"
        >
          🌟 {skills.title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-gray-400 text-lg mb-16 max-w-2xl"
        >
          {skills.subtitle}
        </motion.p>

        <div className="grid md:grid-cols-2 gap-8">
          {skills.items.map((skill, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.15 }}
              className="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-500"
            >
              {/* Subtle glow on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative">
                <span className="text-3xl mb-4 block">{skill.icon}</span>
                <h3 className="text-lg font-semibold text-white mb-3">
                  {skill.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {skill.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
