import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CornerDownRight,
  Gauge,
  GitBranch,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  PlayCircle,
  Repeat,
  RotateCcw,
  Terminal,
} from 'lucide-react';
import { ExecutionStep, SimulationRun, StepPhase } from '../types/algorithm';
import { ThreeExecutionCanvas } from './ThreeExecutionCanvas';

export type PlaybackSpeed = 0.5 | 1 | 1.5 | 2;

interface SynchronizedVisualizerProps {
  run: SimulationRun;
  stepIndex: number;
  isPlaying: boolean;
  playbackSpeed: PlaybackSpeed;
  onPrevious: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  onSpeedChange: (speed: PlaybackSpeed) => void;
  onReset: () => void;
}

function PhaseBadge({ phase, label }: { phase: StepPhase; label: string }) {
  const styles: Record<StepPhase, string> = {
    init: 'border-teal-500/50 bg-teal-500/15 text-teal-100',
    loop: 'border-emerald-500/50 bg-emerald-500/15 text-emerald-100',
    compute: 'border-lime-400/55 bg-lime-500/15 text-lime-100',
    call: 'border-emerald-400/55 bg-emerald-500/18 text-white',
    base: 'border-lime-300/65 bg-lime-400/20 text-lime-100',
    unwind: 'border-teal-400/60 bg-teal-500/20 text-white',
    output: 'border-emerald-400/60 bg-emerald-500/20 text-white',
    complete: 'border-emerald-300/70 bg-emerald-500/25 text-white',
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

const SPEED_OPTIONS: PlaybackSpeed[] = [0.5, 1, 1.5, 2];

export const SynchronizedVisualizer: React.FC<SynchronizedVisualizerProps> = ({
  run,
  stepIndex,
  isPlaying,
  playbackSpeed,
  onPrevious,
  onNext,
  onTogglePlay,
  onSpeedChange,
  onReset,
}) => {
  const containerRef = useRef<HTMLElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const step: ExecutionStep = run.steps[stepIndex];
  const totalSteps = run.steps.length;
  const progressPercent = Math.round(((stepIndex + 1) / totalSteps) * 100);
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;

  // Sync Escape key and browser fullscreen events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      }
    };

    const handleFsChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        // Only sync exit if native fullscreen was actually active and exited
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFsChange);
    };
  }, [isFullscreen]);

  // Prevent background page scroll while fullscreen overlay is active
  useEffect(() => {
    if (!isFullscreen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isFullscreen]);

  const handleToggleFullscreen = async () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      try {
        if (containerRef.current?.requestFullscreen && !document.fullscreenElement) {
          await containerRef.current.requestFullscreen();
        }
      } catch {
        // CSS viewport fullscreen remains active inside restricted iframes
      }
    } else {
      setIsFullscreen(false);
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
      } catch {
        // Ignore if native fullscreen was not active
      }
    }
  };

  return (
    <section
      ref={containerRef}
      aria-label="Synchronized 3D algorithm visualization"
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 flex flex-col bg-[#05120D] p-3 sm:p-5 overflow-y-auto'
          : 'mx-auto max-w-[1400px] px-4 py-5 sm:px-6'
      }
    >
      <div
        className={`rounded-2xl border border-emerald-800/70 bg-[#081712] shadow-2xl shadow-black/50 overflow-hidden ${
          isFullscreen ? 'flex flex-1 flex-col min-h-0' : ''
        }`}
      >
        {/* Top Playback, Speed, Progress & Fullscreen Bar */}
        <div className="flex flex-col gap-4 border-b border-zinc-800 bg-[#0A1813] px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-zinc-100">
              <span className="font-semibold text-emerald-400">{run.definition.title}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-zinc-100">
                {run.algorithm === 'factorial'
                  ? `Input n = ${run.inputValue}`
                  : `Terms = ${run.inputValue}`}
              </span>
            </div>
            <h3 className="mt-1 font-display text-lg font-bold text-white sm:text-xl">
              Algorithm Execution — Steps &amp; 3D Visualization
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Step Counter & Progress Bar */}
            <div className="flex items-center gap-2.5 text-xs text-white">
              <span className="font-mono tabular-nums font-semibold whitespace-nowrap">
                Step {stepIndex + 1} of {totalSteps}
              </span>
              <div
                aria-label={`Progress ${progressPercent}%`}
                className="h-2 w-20 overflow-hidden rounded-full bg-zinc-800 sm:w-28"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-400 transition-all duration-200"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onPrevious}
                disabled={isFirst}
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-[#111C1A] px-2.5 py-2 text-xs font-semibold text-white transition-colors hover:border-emerald-500/60 disabled:cursor-not-allowed disabled:text-zinc-400 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={onTogglePlay}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${
                  isPlaying
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                    <span>{isLast ? 'Replay' : 'Play'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onNext}
                disabled={isLast}
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-[#111C1A] px-2.5 py-2 text-xs font-semibold text-white transition-colors hover:border-emerald-500/60 disabled:cursor-not-allowed disabled:text-zinc-400 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onReset}
                disabled={isFirst && !isPlaying}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-[#111C1A] px-2.5 py-2 text-xs font-semibold text-white transition-colors hover:border-emerald-500/60 disabled:cursor-not-allowed disabled:text-zinc-400 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Reset</span>
              </button>

              {/* Speed Selector */}
              <div
                role="group"
                aria-label="Animation playback speed"
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-[#090F0E] px-2 py-1"
              >
                <Gauge className="h-3.5 w-3.5 text-emerald-400 mr-0.5" aria-hidden="true" />
                {SPEED_OPTIONS.map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => onSpeedChange(spd)}
                    aria-pressed={playbackSpeed === spd}
                    className={`rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                      playbackSpeed === spd
                        ? 'bg-emerald-500/30 text-emerald-200'
                        : 'text-zinc-200 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              {/* Fullscreen Toggle */}
              <button
                type="button"
                onClick={handleToggleFullscreen}
                aria-pressed={isFullscreen}
                aria-label={isFullscreen ? 'Exit fullscreen view' : 'Enter fullscreen view'}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/60 bg-[#0C261C] px-3 py-2 text-xs font-semibold text-white transition-colors hover:border-emerald-400 hover:bg-[#103426] cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
                    <span>Exit Fullscreen</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
                    <span>Fullscreen</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Two Side-by-Side Synchronized Panels: 4-col Steps | 8-col Large 3D Stage */}
        <div
          className={`grid grid-cols-1 divide-y divide-zinc-800 lg:grid-cols-12 lg:divide-x lg:divide-y-0 ${
            isFullscreen ? 'flex-1 min-h-0' : ''
          }`}
        >
          {/* LEFT PANEL: Numbered Human-Readable Algorithm Steps */}
          <div
            className={`lg:col-span-4 p-5 sm:p-6 bg-[#08130F] flex flex-col justify-between ${
              isFullscreen ? 'lg:overflow-y-auto' : ''
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <h4 className="font-display text-sm font-semibold text-white">
                  Algorithm Steps
                </h4>
                <span className="text-xs text-emerald-300 font-mono font-semibold">
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
                          ? 'bg-gradient-to-r from-emerald-600/30 via-teal-500/20 to-transparent text-white ring-1 ring-emerald-400/70 shadow-sm'
                          : 'text-zinc-100 hover:bg-zinc-800/40'
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-xs font-semibold tabular-nums ${
                          isActive
                            ? 'bg-emerald-400 text-[#051610]'
                            : 'bg-zinc-800 text-zinc-100'
                        }`}
                      >
                        {line.lineNumber}
                      </span>

                      <div
                        className={`flex flex-1 items-center justify-between gap-2 leading-snug ${
                          line.indent > 0 ? 'pl-3' : ''
                        }`}
                      >
                        <span className={isActive ? 'font-semibold text-white' : 'font-normal text-zinc-100'}>
                          {line.indent > 0 && (
                            <CornerDownRight
                              className="mr-1.5 inline h-3.5 w-3.5 text-emerald-300"
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
            </div>

            {/* Variable Snapshot Grid inside Left Panel Bottom */}
            <div className="mt-6 pt-5 border-t border-zinc-800">
              <p className="text-xs font-semibold text-zinc-100">
                Current Variable State
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                {step.variables.map((variable) => (
                  <div
                    key={variable.name}
                    className={`rounded-xl border px-3 py-2.5 transition-colors duration-150 ${
                      variable.highlight
                        ? 'border-emerald-400/65 bg-emerald-500/15'
                        : 'border-zinc-800 bg-[#051610]'
                    }`}
                  >
                    <div className="text-[11px] font-medium text-zinc-200 truncate">
                      {variable.name}
                    </div>
                    <div
                      className={`mt-0.5 font-mono text-sm font-semibold tabular-nums truncate ${
                        variable.highlight ? 'text-lime-200' : 'text-white'
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

          {/* RIGHT PANEL: Prominent 3D Live Visualization + Step Explanation */}
          <div
            className={`lg:col-span-8 p-5 sm:p-6 flex flex-col justify-between bg-[#06130E] ${
              isFullscreen ? 'min-h-0' : ''
            }`}
          >
            <div className={`space-y-4 ${isFullscreen ? 'flex flex-1 flex-col min-h-0' : ''}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-800 shrink-0">
                <h4 className="font-display text-sm font-semibold text-white">
                  3D Live Visualization
                </h4>
                <PhaseBadge phase={step.phase} label={step.phaseLabel} />
              </div>

              <ThreeExecutionCanvas
                run={run}
                stepIndex={stepIndex}
                isFullscreen={isFullscreen}
              />
            </div>

            {/* Concise Step Explanation Footer */}
            <div className="mt-4 rounded-xl border border-emerald-800/60 bg-[#081A13] px-4 py-3.5 shrink-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-emerald-300">
                  Step {stepIndex + 1} Explanation
                </span>
                {step.loopProgress && (
                  <span className="font-mono text-xs text-teal-200">
                    {step.loopProgress.conditionText}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-white">
                {step.explanation}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
