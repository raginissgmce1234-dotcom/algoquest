import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-zinc-800/80 bg-[#070B0A]">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 text-xs text-zinc-400 sm:flex-row sm:items-center sm:px-6">
        <div className="flex items-center gap-3">
          <span className="font-display text-sm font-bold text-white">
            Algo<span className="text-emerald-400">Quest</span>
          </span>
          <span aria-hidden="true">·</span>
          <span>Understand. Visualize. Master.</span>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <a href="#home" className="hover:text-emerald-300 transition-colors">
            Home
          </a>
          <a href="#workspace" className="hover:text-emerald-300 transition-colors">
            Learn Algorithms
          </a>
          <a href="#about" className="hover:text-emerald-300 transition-colors">
            About
          </a>
        </div>
      </div>
    </footer>
  );
};
