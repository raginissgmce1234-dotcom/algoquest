import React, { useState } from 'react';
import { ArrowRight, Code2, Cpu, GitBranch, Layers } from 'lucide-react';

interface HeroSectionProps {
  onStartLearning: () => void;
  onQuickSelect: (algorithm: 'factorial' | 'fibonacci', approach: 'iterative' | 'recursive') => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartLearning,
  onQuickSelect,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <section
      id="home"
      className="relative overflow-hidden border-b border-zinc-800/70 bg-[#090F0E] lab-grid-bg"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/3 h-96 w-96 rounded-full bg-emerald-600/12 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 right-1/4 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col justify-center lg:col-span-7">
            <p className="text-sm font-medium tracking-wide text-emerald-400">
              C Data Structures Visual Lab
            </p>

            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-[3.35rem] lg:leading-[1.1] [text-wrap:balance]">
              Understand. Visualize.{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                Master.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-100 sm:text-lg">
              AlgoQuest transforms Factorial and Fibonacci in C from static textbook
              syntax into synchronized step-by-step execution. Watch variables shift,
              loop counters advance, and call stacks unwind in lockstep with human-readable
              algorithm steps.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onStartLearning}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-950/60 hover:from-emerald-500 hover:to-teal-400 transition-all duration-150 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              >
                <span>Start Learning</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => onQuickSelect('fibonacci', 'recursive')}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-700/80 bg-[#101A18] px-5 py-3 text-sm font-medium text-white hover:border-amber-400/70 transition-colors duration-150 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <span>Explore Tail-Recursive Fibonacci</span>
              </button>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 border-t border-zinc-800/80 pt-6 sm:grid-cols-3">
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                  <Layers className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                  <span>Synchronized Trace</span>
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  Steps &amp; state in lockstep
                </p>
              </div>

              <div>
                <p className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                  <GitBranch className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
                  <span>Call Stack Clarity</span>
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  Descent &amp; return unwinding
                </p>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <p className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                  <Code2 className="h-3.5 w-3.5 text-teal-400" aria-hidden="true" />
                  <span>Verified C Source</span>
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  Compilable &amp; complexity-ready
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative h-full min-h-[280px] overflow-hidden rounded-2xl border border-zinc-800/90 bg-[#0D1615] shadow-2xl shadow-black/40">
              {!imageError ? (
                <img
                  src="/src/assets/images/algoquest_emerald_blueprint_1795455603451.jpg"
                  alt="Isometric algorithmic data flow diagram showing recursion stack layers and a Fibonacci spiral"
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full min-h-[280px] flex-col items-center justify-center bg-gradient-to-br from-[#0D1615] via-[#12221F] to-[#101A18] p-8 text-center">
                  <Cpu className="h-12 w-12 text-emerald-400" aria-hidden="true" />
                  <p className="mt-4 font-display text-lg font-semibold text-white">
                    AlgoQuest Execution Blueprint
                  </p>
                  <p className="mt-1 text-sm text-zinc-200">
                    Interactive Iterative &amp; Recursive Trace Lab
                  </p>
                </div>
              )}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#090F0E]/85 via-transparent to-transparent"
              />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
                <span className="font-mono">Factorial (0–12) · Fibonacci (1–15)</span>
                <span className="text-emerald-300 font-semibold">C99 / C11</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
