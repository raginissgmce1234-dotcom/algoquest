import React from 'react';
import { ArrowDownRight } from 'lucide-react';

interface NavbarProps {
  onStartLearning: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onStartLearning }) => {
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-slate-800/90 bg-[#060B18]/90 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-8 px-4 sm:px-6">
        <a
          href="#home"
          className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-md px-1"
        >
          Algo<span className="text-cyan-400">Quest</span>
        </a>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-100"
        >
          <a
            href="#home"
            className="whitespace-nowrap shrink-0 hover:text-cyan-300 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded px-1 py-0.5"
          >
            Home
          </a>
          <a
            href="#workspace"
            className="whitespace-nowrap shrink-0 hover:text-cyan-300 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded px-1 py-0.5"
          >
            Learn Algorithms
          </a>
          <a
            href="#about"
            className="whitespace-nowrap shrink-0 hover:text-cyan-300 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded px-1 py-0.5"
          >
            About
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onStartLearning}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm shadow-blue-950/60 hover:from-blue-500 hover:to-cyan-400 transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            <span>Start Learning</span>
            <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
};
