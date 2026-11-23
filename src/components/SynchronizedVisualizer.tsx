import React from 'react';
import {
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CornerDownRight,
  GitBranch,
  Layers,
  PlayCircle,
  Repeat,
  RotateCcw,
  Terminal,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ExecutionStep,
  SimulationRun,
  StackFrame,
  StepPhase,
} from '../types/algorithm';

interface SynchronizedVisualizerProps {
  run: SimulationRun;
  stepIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  onReset: () => void;
}

function PhaseBadge({ phase, label }: { phase: StepPhase; label: string }) {
  const styles: Record<StepPhase, string> = {
    init: 'border-teal-500/40 bg-teal-500/10 text-teal-200',
    loop: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
    compute: 'border-lime-500/40 bg-lime-500/10 text-lime-200',
    call: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
    base: 'border-orange-500/50 bg-orange-500/10 text-orange-200',
    unwind: 'border-teal-400/50 bg-teal-500/15 text-teal-100',
    output: 'border-emerald-400/50 bg-emerald-500/15 text-emerald-100',
    complete: 'border-emerald-400/60 bg-emerald-500/20 text-emerald-100',
  };

  const Icon =
    phase === 'complete'
      ? CheckCircle2
      : phase === 'call' || phase === 'base' || phase === 'unwind'
        ? GitBranch
        : phase === 'loop'
          ? Repeat
          : phase === 'output'
            ? Terminal
            : PlayCircle;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${styles[phase]}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

function FrameStatusText({ status }: { status: StackFrame['status'] }) {
  switch (status) {
    case 'active':
      return <span className="text-xs font-semibold text-emerald-300">Active Frame</span>;
    case 'waiting':
      return <span className="text-xs font-medium text-zinc-400">Paused / Waiting</span>;
    case 'base':
      return <span className="text-xs font-semibold text-amber-300">Base Case Hit</span>;
    case 'returning':
      return <span className="text-xs font-semibold text-teal-300">Unwinding &amp; Returning</span>;
    case 'returned':
      return <span className="text-xs font-medium text-zinc-400">Returned</span>;
  }
}

export const SynchronizedVisualizer: React.FC<SynchronizedVisualizerProps> = ({
  run,
  stepIndex,
  onPrevious,
  onNext,
  onReset,
}) => {
  const step: ExecutionStep = run.steps[stepIndex];
  const totalSteps = run.steps.length;
  const progressPercent = Math.round(((stepIndex + 1) / totalSteps) * 100);
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;

  return (
    <section
      aria-label="Synchronized algorithm visualization"
      className="mx-auto max-w-6xl px-4 py-4 sm:px-6"
    >
      <div className="rounded-2xl border border-zinc-800/90 glass-panel shadow-2xl shadow-black/35 overflow-hidden">
        {/* Top Playback & Progress Bar */}
        <div className="flex flex-col gap-4 border-b border-zinc-800/80 bg-[#0C1413]/90 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-zinc-400">
              <span className="font-semibold text-emerald-400">{run.definition.title}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">
                {run.algorithm === 'factorial'
                  ? `Input n = ${run.inputValue}`
                  : `Terms = ${run.inputValue}`}
              </span>
            </div>
            <h3 className="mt-1 font-display text-lg font-bold text-white sm:text-xl">
              Synchronized Execution Stage
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="mr-1 flex items-center gap-3 text-xs text-zinc-300">
              <span className="font-mono tabular-nums font-semibold">
                Step {stepIndex + 1} of {totalSteps}
              </span>
              <div
                aria-label={`Progress ${progressPercent}%`}
                className="h-2 w-24 overflow-hidden rounded-full bg-zinc-800 sm:w-32"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 transition-all duration-200"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onPrevious}
                disabled={isFirst}
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-700/90 bg-[#111C1A] px-3 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:border-emerald-500/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={onNext}
                disabled={isLast}
                className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:from-emerald-500 hover:to-teal-400 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onReset}
                disabled={isFirst}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700/90 bg-[#111C1A] px-3 py-2 text-xs font-semibold text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Two Side-by-Side Synchronized Panels */}
        <div className="grid grid-cols-1 divide-y divide-zinc-800/80 lg:grid-cols-12 lg:divide-x lg:divide-y-0">
          {/* LEFT PANEL: Numbered Human-Readable Algorithm Steps */}
          <div className="lg:col-span-5 p-5 sm:p-6 bg-[#0B1312]/70">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <h4 className="font-display text-sm font-semibold text-zinc-200">
                Algorithm Steps
              </h4>
              <span className="text-xs text-zinc-400">
                Active: Step {step.activeLine}
              </span>
            </div>

            <ol className="mt-4 space-y-2" aria-label="Numbered algorithm steps">
              {run.definition.pseudocode.map((line) => {
                const isActive = step.activeLine === line.lineNumber;
                return (
                  <li
                    key={line.lineNumber}
                    aria-current={isActive ? 'step' : undefined}
                    className={`flex items-start gap-3 rounded-xl px-3.5 py-3 text-sm transition-all duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-600/25 via-teal-500/15 to-transparent text-white ring-1 ring-emerald-400/50 shadow-sm'
                        : 'text-zinc-400 hover:bg-zinc-800/30'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-xs font-semibold tabular-nums ${
                        isActive
                          ? 'bg-emerald-400 text-[#090F0E]'
                          : 'bg-zinc-800/90 text-zinc-400'
                      }`}
                    >
                      {line.lineNumber}
                    </span>

                    <div
                      className={`flex flex-1 items-center justify-between gap-2 leading-snug ${
                        line.indent > 0 ? 'pl-4' : ''
                      }`}
                    >
                      <span className={isActive ? 'font-semibold text-white' : 'font-normal'}>
                        {line.indent > 0 && (
                          <CornerDownRight
                            className="mr-1.5 inline h-3.5 w-3.5 text-zinc-500"
                            aria-hidden="true"
                          />
                        )}
                        {line.text}
                      </span>

                      {isActive && (
                        <ArrowRight
                          className="h-4 w-4 shrink-0 text-emerald-300"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>

            {/* Variable Snapshot Grid inside Left Panel Bottom */}
            <div className="mt-6 pt-5 border-t border-zinc-800/80">
              <p className="text-xs font-semibold text-zinc-400">
                Current Variable State
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                {step.variables.map((variable) => (
                  <div
                    key={variable.name}
                    className={`rounded-xl border px-3 py-2.5 transition-colors duration-150 ${
                      variable.highlight
                        ? 'border-emerald-400/50 bg-emerald-500/10'
                        : 'border-zinc-800 bg-[#090F0E]/75'
                    }`}
                  >
                    <div className="text-[11px] font-medium text-zinc-400 truncate">
                      {variable.name}
                    </div>
                    <div
                      className={`mt-0.5 font-mono text-sm font-semibold tabular-nums truncate ${
                        variable.highlight ? 'text-emerald-200' : 'text-zinc-100'
                      }`}
                    >
                      {typeof variable.value === 'number'
                        ? variable.value.toLocaleString()
                        : variable.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Live Step-Based Visual Animation */}
          <div className="lg:col-span-7 p-5 sm:p-6 flex flex-col justify-between bg-[#090F0E]/45">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-800/80">
                <h4 className="font-display text-sm font-semibold text-zinc-200">
                  Live Visual State
                </h4>
                <PhaseBadge phase={step.phase} label={step.phaseLabel} />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`${run.runId}-${step.index}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-5 space-y-5"
                >
                  {/* 1. Loop Progress Bar (Iterative modes) */}
                  {step.loopProgress && (
                    <div className="rounded-xl border border-zinc-800/90 bg-[#0F1917]/90 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-semibold text-zinc-300">
                          Loop Iteration Tracker
                        </span>
                        <span className="font-mono text-emerald-300">
                          {step.loopProgress.conditionText}
                        </span>
                      </div>

                      {step.loopProgress.total > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {Array.from({ length: step.loopProgress.total }, (_, idx) => {
                            const iter = idx + 1;
                            const done = iter < step.loopProgress!.current;
                            const current = iter === step.loopProgress!.current;
                            return (
                              <div
                                key={iter}
                                className={`flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 font-mono text-xs font-semibold tabular-nums transition-all ${
                                  current
                                    ? 'bg-emerald-400 text-[#090F0E] ring-2 ring-emerald-300/60'
                                    : done
                                      ? 'bg-teal-600/30 text-teal-100 border border-teal-500/40'
                                      : 'bg-zinc-800/70 text-zinc-500 border border-zinc-800'
                                }`}
                              >
                                {iter}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="mt-2.5 text-xs text-zinc-400">
                          Input is 0, so the loop range 1..0 is empty (0 iterations).
                        </p>
                      )}
                    </div>
                  )}

                  {/* 2. Multiplication Operation Card */}
                  {step.multiplicationOp && (
                    <div className="rounded-xl border border-emerald-500/35 bg-gradient-to-r from-emerald-950/55 via-[#101C19] to-teal-950/40 p-4">
                      <div className="text-xs font-semibold text-emerald-300">
                        Active Multiplication
                      </div>
                      <div className="mt-2.5 flex flex-wrap items-center gap-3 font-mono text-lg sm:text-xl font-bold tabular-nums">
                        <span className="rounded-lg bg-[#090F0E] px-3 py-1.5 text-zinc-200 border border-zinc-700">
                          {step.multiplicationOp.left.toLocaleString()}
                        </span>
                        <span className="text-amber-400">×</span>
                        <span className="rounded-lg bg-[#090F0E] px-3 py-1.5 text-zinc-200 border border-zinc-700">
                          {step.multiplicationOp.right.toLocaleString()}
                        </span>
                        <span className="text-zinc-400">=</span>
                        <span className="rounded-lg bg-emerald-500/20 px-3.5 py-1.5 text-emerald-200 border border-emerald-400/50">
                          {step.multiplicationOp.result.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 3. Factor Product Chain (Factorial Iterative) */}
                  {run.algorithm === 'factorial' &&
                    run.approach === 'iterative' &&
                    step.factorsUsed !== undefined && (
                      <div className="rounded-xl border border-zinc-800/90 bg-[#0F1917]/80 p-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-zinc-300">
                            Accumulated Product Expression
                          </span>
                          <span className="font-mono text-zinc-400">
                            {run.inputValue}!
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-sm">
                          <span className="rounded-lg border border-teal-500/40 bg-teal-500/15 px-2.5 py-1 font-semibold text-teal-200">
                            1
                          </span>
                          {step.factorsUsed.map((factor) => (
                            <React.Fragment key={factor}>
                              <span className="text-zinc-500">×</span>
                              <span className="rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 font-semibold text-emerald-200 tabular-nums">
                                {factor}
                              </span>
                            </React.Fragment>
                          ))}
                          {step.isFinal && (
                            <>
                              <span className="text-zinc-400">=</span>
                              <span className="rounded-lg border border-amber-400/50 bg-amber-500/15 px-3 py-1 font-bold text-amber-200 tabular-nums">
                                {step.variables.find((v) => v.name === 'fact')?.value.toLocaleString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                  {/* 4. Sliding Window Shift Visual (Fibonacci Iterative) */}
                  {run.algorithm === 'fibonacci' && run.approach === 'iterative' && (
                    <div className="rounded-xl border border-zinc-800/90 bg-[#0F1917]/80 p-4">
                      <div className="text-xs font-semibold text-zinc-300">
                        Two-Variable Sliding Window
                      </div>

                      {step.shiftOp ? (
                        <div className="mt-3 space-y-3">
                          <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
                            <div className="rounded-lg border border-zinc-700 bg-[#090F0E] px-3 py-2">
                              <span className="text-xs text-zinc-400 mr-1.5">prev a:</span>
                              <span className="font-semibold text-zinc-200 tabular-nums">
                                {step.shiftOp.prevA}
                              </span>
                            </div>
                            <span className="text-amber-400 font-bold">+</span>
                            <div className="rounded-lg border border-zinc-700 bg-[#090F0E] px-3 py-2">
                              <span className="text-xs text-zinc-400 mr-1.5">prev b:</span>
                              <span className="font-semibold text-zinc-200 tabular-nums">
                                {step.shiftOp.prevB}
                              </span>
                            </div>
                            <span className="text-zinc-400">=</span>
                            <div className="rounded-lg border border-emerald-400/50 bg-emerald-500/15 px-3 py-2">
                              <span className="text-xs text-emerald-300 mr-1.5">next:</span>
                              <span className="font-bold text-emerald-100 tabular-nums">
                                {step.shiftOp.nextVal}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-300 font-mono">
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-teal-500/10 border border-teal-500/30 px-2.5 py-1">
                              <span>a ← b</span>
                              <ArrowRight className="h-3 w-3 text-emerald-400" aria-hidden="true" />
                              <strong className="text-white tabular-nums">{step.shiftOp.newA}</strong>
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 border border-amber-500/30 px-2.5 py-1">
                              <span>b ← next</span>
                              <ArrowRight className="h-3 w-3 text-amber-300" aria-hidden="true" />
                              <strong className="text-white tabular-nums">{step.shiftOp.newB}</strong>
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 grid grid-cols-2 gap-3 font-mono">
                          <div className="rounded-lg border border-zinc-800 bg-[#090F0E] px-3.5 py-2.5">
                            <span className="text-xs text-zinc-400">Register a (current)</span>
                            <div className="mt-1 text-lg font-bold text-emerald-200 tabular-nums">
                              {step.variables.find((v) => v.name.startsWith('a'))?.value ?? '—'}
                            </div>
                          </div>
                          <div className="rounded-lg border border-zinc-800 bg-[#090F0E] px-3.5 py-2.5">
                            <span className="text-xs text-zinc-400">Register b (next)</span>
                            <div className="mt-1 text-lg font-bold text-amber-200 tabular-nums">
                              {step.variables.find((v) => v.name === 'b')?.value ?? '—'}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 5. Tail-Recursive Parameter Transition (Fibonacci Recursive) */}
                  {step.tailTransition && (
                    <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4">
                      <div className="text-xs font-semibold text-amber-200">
                        Tail-Call Parameter Shift
                      </div>
                      <div className="mt-2.5 flex flex-wrap items-center gap-2 font-mono text-xs sm:text-sm tabular-nums">
                        <span className="rounded-lg border border-zinc-700 bg-[#090F0E] px-3 py-1.5 text-zinc-300">
                          fibonacci({step.tailTransition.fromRem}, {step.tailTransition.fromA},{' '}
                          {step.tailTransition.fromB})
                        </span>
                        <ArrowRight className="h-4 w-4 text-emerald-400 shrink-0" aria-hidden="true" />
                        <span className="rounded-lg border border-emerald-400/50 bg-emerald-500/15 px-3 py-1.5 font-semibold text-emerald-100">
                          fibonacci({step.tailTransition.toRem}, {step.tailTransition.toA},{' '}
                          {step.tailTransition.toB})
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 6. Call Stack Visualizer */}
                  {step.stackFrames !== undefined && (
                    <div className="rounded-xl border border-zinc-800/90 bg-[#0F1917]/85 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                          <Layers className="h-4 w-4 text-amber-400" aria-hidden="true" />
                          <span>Call Stack Frames</span>
                        </div>
                        <span className="font-mono text-xs text-zinc-400 tabular-nums">
                          Active Depth: {step.stackFrames.length} / {step.maxDepth ?? 1}
                        </span>
                      </div>

                      {step.stackFrames.length > 0 ? (
                        <div className="mt-3 space-y-2">
                          {[...step.stackFrames].reverse().map((frame, reverseIdx) => {
                            const isTop = reverseIdx === 0;
                            const frameBorder =
                              frame.status === 'base'
                                ? 'border-amber-400/60 bg-amber-500/10'
                                : frame.status === 'returning'
                                  ? 'border-teal-400/60 bg-teal-500/10'
                                  : isTop
                                    ? 'border-emerald-400/60 bg-emerald-500/12'
                                    : 'border-zinc-800 bg-[#090F0E]/75';

                            return (
                              <div
                                key={frame.id}
                                className={`flex flex-col gap-1.5 rounded-xl border px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between ${frameBorder}`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-zinc-300 tabular-nums">
                                    D{frame.depth}
                                  </span>
                                  <span className="font-mono text-sm font-semibold text-white">
                                    {frame.label}
                                  </span>
                                  {isTop && (
                                    <span className="text-[11px] font-semibold text-emerald-300">
                                      (Top)
                                    </span>
                                  )}
                                </div>

                                <div className="flex flex-wrap items-center gap-3 text-xs">
                                  {frame.pendingExpression && (
                                    <span className="font-mono text-zinc-300">
                                      {frame.pendingExpression}
                                    </span>
                                  )}
                                  <FrameStatusText status={frame.status} />
                                </div>
                              </div>
                            );
                          })}
                          <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-zinc-500">
                            <ArrowDown className="h-3 w-3" aria-hidden="true" />
                            <span>main() caller frame at base</span>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                          All stack frames have resolved and returned cleanly to <code className="font-mono">main()</code>.
                        </div>
                      )}
                    </div>
                  )}

                  {/* 7. Fibonacci Sequence Tape */}
                  {step.sequenceOutput !== undefined && (
                    <div className="rounded-xl border border-zinc-800/90 bg-[#0F1917]/80 p-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-300">
                          Generated Fibonacci Sequence
                        </span>
                        <span className="font-mono text-zinc-400 tabular-nums">
                          {step.sequenceOutput.length} / {run.inputValue} emitted
                        </span>
                      </div>

                      {step.sequenceOutput.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {step.sequenceOutput.map((val, idx) => {
                            const isNewest =
                              idx === step.sequenceOutput!.length - 1 &&
                              step.phase === 'output';
                            return (
                              <div
                                key={`${idx}-${val}`}
                                className={`flex flex-col items-center rounded-xl border px-3 py-1.5 font-mono transition-all ${
                                  isNewest
                                    ? 'border-emerald-400 bg-emerald-500/20 text-white shadow-sm'
                                    : 'border-zinc-700/80 bg-[#090F0E] text-zinc-200'
                                }`}
                              >
                                <span className="text-[10px] text-zinc-400 tabular-nums">
                                  F{idx}
                                </span>
                                <span className="text-sm font-bold tabular-nums">{val}</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="mt-2.5 text-xs text-zinc-400">
                          No terms emitted yet. Advance to output the first term.
                        </p>
                      )}
                    </div>
                  )}

                  {/* 8. Final Step Result Highlight inside Visualizer */}
                  {step.isFinal && step.stepOutputText && (
                    <div className="rounded-xl border border-emerald-400/50 bg-gradient-to-r from-emerald-950/60 via-[#0E241E] to-teal-950/50 px-4 py-3.5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        <span>Output Returned</span>
                      </div>
                      <div className="mt-1.5 font-mono text-base font-bold text-white tabular-nums">
                        {step.stepOutputText}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Concise Step Explanation Footer */}
            <div className="mt-6 rounded-xl border border-zinc-800/90 bg-[#0D1614] px-4 py-3.5">
              <div className="text-xs font-semibold text-emerald-400">
                Step {stepIndex + 1} Explanation
              </div>
              <p className="mt-1 text-sm leading-relaxed text-zinc-200">
                {step.explanation}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
