"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { PORTFOLIO_DATA } from "@/data/portfolio";

export default function AboutSection() {
  const { personal } = PORTFOLIO_DATA;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="about-me"
      className="relative py-28 px-6"
      ref={ref}
    >
      {/* Section bg text (like the original's "ABOUT ME" watermark) */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 text-[10vw] font-black text-white/[0.02] uppercase whitespace-nowrap pointer-events-none select-none tracking-widest">
        About Me
      </div>

      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-white mb-12"
        >
          👋 About Me
        </motion.h2>

        <div className="grid md:grid-cols-[1fr,auto] gap-12 items-start">
          {/* Bio text */}
          <div className="space-y-5">
            {personal.longBio.map((paragraph, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
                className={`text-gray-300 leading-relaxed text-[15px] ${
                  i === 0 ? "text-lg font-medium text-white" : ""
                }`}
              >
                {paragraph}
              </motion.p>
            ))}
          </div>

          {/* Interactive desk illustration placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="hidden md:block relative"
          >
            <div className="w-64 h-64 relative">
              {/* Desk illustration using CSS art */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-white/5 overflow-hidden">
                {/* Monitor */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-32 h-24 bg-gray-700/60 rounded-lg border border-white/10 overflow-hidden">
                  {/* Screen glow */}
                  <div className="w-full h-full bg-gradient-to-br from-blue-900/40 to-purple-900/30 flex flex-col gap-1 p-2">
                    {/* Fake code lines */}
                    <div className="w-[70%] h-1.5 bg-blue-400/30 rounded-full" />
                    <div className="w-[90%] h-1.5 bg-green-400/20 rounded-full" />
                    <div className="w-[50%] h-1.5 bg-purple-400/25 rounded-full" />
                    <div className="w-[80%] h-1.5 bg-blue-400/20 rounded-full" />
                    <div className="w-[60%] h-1.5 bg-yellow-400/20 rounded-full" />
                    <div className="w-[75%] h-1.5 bg-green-400/25 rounded-full" />
                    <div className="w-[40%] h-1.5 bg-blue-400/15 rounded-full" />
                  </div>
                  {/* Power LED */}
                  <div className="absolute bottom-1 right-2 w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]" />
                </div>
                {/* Monitor stand */}
                <div className="absolute top-[128px] left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-600/50" />
                <div className="absolute top-[144px] left-1/2 -translate-x-1/2 w-14 h-2 bg-gray-600/40 rounded-sm" />

                {/* Keyboard */}
                <div className="absolute top-[158px] left-1/2 -translate-x-1/2 w-36 h-7 bg-gray-600/30 rounded border border-white/5">
                  <div className="grid grid-cols-12 gap-[2px] p-1">
                    {[...Array(24)].map((_, i) => (
                      <div
                        key={i}
                        className="w-full aspect-square bg-gray-500/20 rounded-[1px]"
                      />
                    ))}
                  </div>
                </div>

                {/* Coffee cup */}
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-10 right-6"
                >
                  <div className="w-6 h-7 bg-gray-500/30 rounded-b-md border border-white/10 relative">
                    {/* Steam */}
                    <motion.div
                      animate={{ opacity: [0.2, 0.5, 0.2], y: [0, -4, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-3 left-1 text-[8px] text-white/20"
                    >
                      ~
                    </motion.div>
                    {/* Handle */}
                    <div className="absolute -right-2 top-1 w-2 h-3 border-r border-t border-b border-white/10 rounded-r" />
                  </div>
                </motion.div>

                {/* Phone */}
                <div className="absolute bottom-8 left-6 w-5 h-9 bg-gray-600/30 rounded border border-white/10">
                  <div className="w-3 h-5 bg-blue-400/10 rounded-sm m-0.5 mt-1" />
                </div>

                {/* Flutter logo */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] text-blue-400/40 font-mono">
                  flutter_dev
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
