"use client";

import { PORTFOLIO_DATA } from "@/data/portfolio";

export default function Footer() {
  const { personal } = PORTFOLIO_DATA;
  const year = new Date().getFullYear();

  return (
    <footer className="relative py-12 px-6 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left - branding */}
        <div className="flex items-center gap-2">
          <span className="text-blue-400 font-mono text-sm">{"<"}</span>
          <span className="text-white font-bold text-sm">{personal.name}</span>
          <span className="text-blue-400 font-mono text-sm">{"/>"}</span>
        </div>

        {/* Center - copyright */}
        <p className="text-gray-500 text-xs">
          © {year} {personal.name}. All rights reserved.
        </p>

        {/* Right - social */}
        <div className="flex items-center gap-4">
          <a
            href={personal.social.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-white transition-colors text-xs"
          >
            GitHub
          </a>
          <span className="text-gray-700">•</span>
          <a
            href={personal.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-white transition-colors text-xs"
          >
            LinkedIn
          </a>
          <span className="text-gray-700">•</span>
          <a
            href={`mailto:${personal.email}`}
            className="text-gray-500 hover:text-white transition-colors text-xs"
          >
            Email
          </a>
        </div>
      </div>

      {/* Bottom decorative line */}
      <div className="mt-8 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      <p className="text-center text-gray-700 text-[10px] mt-4 font-mono">
        Built with Next.js, Tailwind CSS & Framer Motion
      </p>
    </footer>
  );
}
