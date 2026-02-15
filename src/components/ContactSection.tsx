"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { PORTFOLIO_DATA } from "@/data/portfolio";

export default function ContactSection() {
  const { personal } = PORTFOLIO_DATA;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });

  return (
    <section id="contact" className="relative py-28 px-6" ref={ref}>
      {/* Watermark */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 text-[8vw] font-black text-white/[0.02] uppercase whitespace-nowrap pointer-events-none select-none tracking-widest">
        Contact
      </div>

      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-white mb-4"
        >
          💬 Get In Touch!
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-12 mt-12">
          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold text-white mb-6">
              {"Let's Talk"}
            </h3>
            <p className="text-gray-400 text-sm mb-8">
              Tell me what&apos;s on your mind?
            </p>

            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = `mailto:${personal.email}?subject=Portfolio Contact from ${formState.name}&body=${formState.message}`;
              }}
            >
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">
                  Name: *
                </label>
                <input
                  type="text"
                  required
                  value={formState.name}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, name: e.target.value }))
                  }
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 transition-colors placeholder-gray-600"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">
                  Email: *
                </label>
                <input
                  type="email"
                  required
                  value={formState.email}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, email: e.target.value }))
                  }
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 transition-colors placeholder-gray-600"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">
                  Message:
                </label>
                <textarea
                  rows={5}
                  value={formState.message}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, message: e.target.value }))
                  }
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 transition-colors placeholder-gray-600 resize-none"
                  placeholder="Tell me about your project..."
                />
              </div>
              <button
                type="submit"
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Send
              </button>
            </form>
          </motion.div>

          {/* Right side - Links & Animated emblem */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col items-center justify-center gap-8"
          >
            {/* Rotating emblem */}
            <div className="relative w-52 h-52">
              {/* Outer ring with rotating text */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <defs>
                    <path
                      id="circlePath"
                      d="M 100, 100 m -80, 0 a 80,80 0 1,1 160,0 a 80,80 0 1,1 -160,0"
                    />
                  </defs>
                  <text
                    fill="rgba(255,255,255,0.15)"
                    fontSize="13"
                    fontFamily="monospace"
                    letterSpacing="3"
                  >
                    <textPath href="#circlePath">
                      MUHAMMAD ANEES • FLUTTER DEVELOPER • BUILD APPS •
                    </textPath>
                  </text>
                </svg>
              </motion.div>

              {/* Center initials */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <span className="text-3xl font-bold text-white">MA</span>
                </div>
              </div>
            </div>

            {/* Direct email link */}
            <div className="text-center space-y-4">
              <div className="text-sm text-gray-500">Send me an email</div>
              <a
                href={`mailto:${personal.email}`}
                className="inline-block px-6 py-3 bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] rounded-lg text-white text-sm font-medium transition-all hover:scale-105"
              >
                {personal.email}
              </a>
            </div>

            {/* Social links */}
            <div className="flex gap-4">
              <a
                href={personal.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a
                href={personal.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
