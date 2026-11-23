import React from 'react';
import { Code2, Eye, GitCompare } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="mx-auto max-w-6xl px-4 pt-10 pb-14 sm:px-6"
    >
      <div className="border-t border-zinc-800/80 pt-10">
        <div className="max-w-2xl">
          <h2
            id="about-heading"
            className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl"
          >
            How AlgoQuest Works
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400 sm:text-base">
            Designed for college Data Structures students transitioning from conceptual pseudocode
            to clean, memory-aware C implementations.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800/90 glass-panel p-6">
            <GitCompare className="h-5 w-5 text-emerald-400" aria-hidden="true" />
            <h3 className="mt-4 font-display text-base font-bold text-white">
              01. Compare Iterative vs. Recursive
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
              See the exact structural difference between constant-space <code className="font-mono text-emerald-300">O(1)</code> loops
              and stack-driven <code className="font-mono text-amber-300">O(n)</code> recursion, including
              linear tail-recursive Fibonacci without exponential blowup.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800/90 glass-panel p-6">
            <Eye className="h-5 w-5 text-teal-400" aria-hidden="true" />
            <h3 className="mt-4 font-display text-base font-bold text-white">
              02. Step Through Synced State
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
              Move forward or backward one atomic step at a time. Every highlighted pseudocode
              line updates variable registers, sequence strips, and call stack frames together.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800/90 glass-panel p-6">
            <Code2 className="h-5 w-5 text-amber-400" aria-hidden="true" />
            <h3 className="mt-4 font-display text-base font-bold text-white">
              03. Connect Logic to C Code
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
              Once you verify the trace, inspect and copy the matching compilable C program along
              with variable roles, correctness invariants, and time/space complexity.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
