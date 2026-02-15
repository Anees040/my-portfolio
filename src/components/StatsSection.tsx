"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { PORTFOLIO_DATA } from "@/data/portfolio";

export default function StatsSection() {
  const { stats } = PORTFOLIO_DATA;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="stats" className="relative py-20 px-6" ref={ref}>
      {/* Watermark */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-[8vw] font-black text-white/[0.02] uppercase whitespace-nowrap pointer-events-none select-none tracking-widest">
        Impact
      </div>

      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-white mb-16 text-center"
        >
          💥 Making an Impact
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{
                duration: 0.5,
                delay: 0.2 + i * 0.1,
                type: "spring",
                stiffness: 200,
              }}
              className="text-center p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all group"
            >
              <span className="text-3xl block mb-3">{stat.icon}</span>
              <div className="text-3xl md:text-4xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
