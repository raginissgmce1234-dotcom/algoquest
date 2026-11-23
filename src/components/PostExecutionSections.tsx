import React, { useState } from 'react';
import {
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Copy,
  Cpu,
  HardDrive,
  Terminal,
} from 'lucide-react';
import { SimulationRun } from '../types/algorithm';

interface PostExecutionSectionsProps {
  run: SimulationRun;
  isFinalStep: boolean;
  hasCompletedCurrentRun: boolean;
  onJumpToFinal: () => void;
}

export const PostExecutionSections: React.FC<PostExecutionSectionsProps> = ({
  run,
  isFinalStep,
  hasCompletedCurrentRun,
  onJumpToFinal,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(run.definition.cCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = run.definition.cCode;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  const cLines = run.definition.cCode.split('\n');

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:px-6">
      {/* SECTION 1: FINAL OUTPUT */}
      <section
        id="final-output"
        aria-labelledby="final-output-heading"
        className="rounded-2xl border border-zinc-800/90 glass-panel p-6 shadow-xl shadow-black/25"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <Terminal className="h-5 w-5 text-emerald-400" aria-hidden="true" />
            <h3
              id="final-output-heading"
              className="font-display text-xl font-bold text-white"
            >
              Final Output
            </h3>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
              hasCompletedCurrentRun ? 'text-emerald-300' : 'text-zinc-200'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            <span>
              {isFinalStep
                ? 'Execution Reached Final Step'
                : hasCompletedCurrentRun
                  ? 'Run Verified'
                  : 'Stepping in Progress'}
            </span>
          </span>
        </div>

        {hasCompletedCurrentRun ? (
          <div className="mt-5 flex flex-col gap-4 rounded-xl border border-emerald-500/35 bg-[#090F0E] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-200">
                {run.finalSummaryLabel}
              </p>
              <div
                data-testid="final-output-value"
                className="mt-2 font-mono text-2xl font-bold tracking-tight text-emerald-200 tabular-nums sm:text-3xl break-words"
              >
                {run.finalResultDisplay}
              </div>
            </div>
            <div className="shrink-0 text-xs text-zinc-200 font-mono">
              {run.steps.length} synchronized steps traced
            </div>
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-4 rounded-xl border border-zinc-800 bg-[#090F0E] p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-100">
              Advance through the synchronized steps using <strong className="text-white">Next</strong> to
              reach the final step and verify the completed output.
            </p>
            <button
              type="button"
              onClick={onJumpToFinal}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/20 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <span>Complete Run Now</span>
            </button>
          </div>
        )}
      </section>

      {/* SECTION 2: GENERATED C PROGRAM */}
      <section
        id="generated-c-program"
        aria-labelledby="c-program-heading"
        className="rounded-2xl border border-zinc-800/90 glass-panel p-6 shadow-xl shadow-black/25"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <Code2 className="h-5 w-5 text-teal-400" aria-hidden="true" />
            <div>
              <h3
                id="c-program-heading"
                className="font-display text-xl font-bold text-white"
              >
                Generated C Program
              </h3>
              <p className="text-xs text-zinc-200 font-mono mt-0.5">
                {run.definition.cFileName} · Standard C (GCC / Clang compatible)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyCode}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-[#090F0E] px-4 py-2 text-xs font-semibold text-zinc-100 hover:border-emerald-400/60 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                <span className="text-emerald-300">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-5 overflow-x-auto rounded-xl border border-zinc-800/90 bg-[#060A09] p-4">
          <pre className="font-mono text-xs sm:text-sm leading-6 text-zinc-100">
            <code>
              {cLines.map((line, i) => (
                <div key={i} className="flex">
                  <span className="mr-5 w-6 shrink-0 select-none text-right text-zinc-400 tabular-nums">
                    {i + 1}
                  </span>
                  <span className="whitespace-pre">{line}</span>
                </div>
              ))}
            </code>
          </pre>
        </div>
      </section>

      {/* SECTION 3: UNDERSTANDING THE LOGIC */}
      <section
        id="understanding-logic"
        aria-labelledby="understanding-logic-heading"
        className="rounded-2xl border border-zinc-800/90 glass-panel p-6 shadow-xl shadow-black/25"
      >
        <div className="flex items-center gap-2.5 border-b border-zinc-800/80 pb-4">
          <BookOpen className="h-5 w-5 text-amber-400" aria-hidden="true" />
          <div>
            <h3
              id="understanding-logic-heading"
              className="font-display text-xl font-bold text-white"
            >
              Understanding the Logic
            </h3>
            <p className="text-xs text-zinc-200 mt-0.5">
              {run.definition.title} — Beginner breakdown &amp; complexity analysis
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <div>
              <h4 className="font-display text-sm font-semibold text-emerald-300">
                Core Intuition
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-zinc-100">
                {run.definition.logicSummary}
              </p>
            </div>

            <div>
              <h4 className="font-display text-sm font-semibold text-emerald-300">
                How Execution Works
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-zinc-100">
                {run.definition.howItWorks}
              </p>
            </div>

            <div>
              <h4 className="font-display text-sm font-semibold text-emerald-300">
                Why the Final Output Is Correct
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-zinc-100">
                {run.definition.whyCorrect}
              </p>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-5">
            <div>
              <h4 className="font-display text-sm font-semibold text-white">
                Important Variables
              </h4>
              <dl className="mt-3 divide-y divide-zinc-800/80 rounded-xl border border-zinc-800 bg-[#090F0E]">
                {run.definition.variableRoles.map((item) => (
                  <div key={item.symbol} className="px-4 py-3">
                    <dt className="font-mono text-xs font-semibold text-emerald-300">
                      {item.symbol}
                    </dt>
                    <dd className="mt-1 text-xs leading-relaxed text-zinc-100">
                      {item.role}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-xl border border-emerald-500/30 bg-[#090F0E] p-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-semibold text-zinc-100">
                    <Clock className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                    <span>Time Complexity</span>
                  </span>
                  <span className="font-mono text-base font-bold text-emerald-300">
                    {run.definition.timeComplexity}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-zinc-200">
                  {run.definition.timeExplanation}
                </p>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-[#090F0E] p-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-semibold text-zinc-100">
                    {run.approach === 'recursive' ? (
                      <Cpu className="h-4 w-4 text-amber-400" aria-hidden="true" />
                    ) : (
                      <HardDrive className="h-4 w-4 text-amber-400" aria-hidden="true" />
                    )}
                    <span>Auxiliary Space</span>
                  </span>
                  <span className="font-mono text-base font-bold text-amber-300">
                    {run.definition.spaceComplexity}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-zinc-200">
                  {run.definition.spaceExplanation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
