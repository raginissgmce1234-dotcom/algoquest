import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CornerDownRight,
  Gauge,
  GitBranch,
  GitFork,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  PlayCircle,
  Repeat,
  RotateCcw,
  Terminal,
} from 'lucide-react';
import {
  AlgorithmDefinition,
  AlgorithmType,
  ApproachType,
  ExecutionStep,
  SimulationRun,
  StepPhase,
} from '../types/algorithm';
import { ThreeExecutionCanvas } from './ThreeExecutionCanvas';

export type PlaybackSpeed = 0.5 | 1 | 1.5 | 2;

interface AlgorithmWorkspaceProps {
  algorithm: AlgorithmType;
  approach: ApproachType;
  rawInput: string;
  inputError: string | null;
  definition: AlgorithmDefinition;
  completedRuns: number;
  isPendingConfigChange: boolean;
  run: SimulationRun;
  stepIndex: number;
  isPlaying: boolean;
  playbackSpeed: PlaybackSpeed;
  onSelectAlgorithm: (algo: AlgorithmType) => void;
  onSelectApproach: (app: ApproachType) => void;
  onInputChange: (val: string) => void;
  onPresetClick: (val: number) => void;
  onGenerate: (e: React.FormEvent) => void;
  onPrevious: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  onSpeedChange: (speed: PlaybackSpeed) => void;
  onReset: () => void;
}

function PhaseBadge({ phase, label }: { phase: StepPhase; label: string }) {
  const styles: Record<StepPhase, string> = {
    init: 'border-sky-400/60 bg-sky-500/18 text-white',
    loop: 'border-blue-400/60 bg-blue-500/18 text-white',
    compute: 'border-cyan-400/65 bg-cyan-500/20 text-cyan-100',
    call: 'border-violet-400/65 bg-violet-500/20 text-white',
    base: 'border-amber-300/70 bg-amber-400/20 text-amber-100',
    unwind: 'border-cyan-300/70 bg-cyan-500/22 text-white',
    output: 'border-sky-300/70 bg-sky-500/22 text-white',
    complete: 'border-cyan-300/80 bg-cyan-500/25 text-white',
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

export const AlgorithmWorkspace: React.FC<AlgorithmWorkspaceProps> = ({
  algorithm,
  approach,
  rawInput,
  inputError,
  definition,
  completedRuns,
  isPendingConfigChange,
  run,
  stepIndex,
  isPlaying,
  playbackSpeed,
  onSelectAlgorithm,
  onSelectApproach,
  onInputChange,
  onPresetClick,
  onGenerate,
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
        // Viewport fullscreen overlay remains active inside restricted iframes
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
      id="workspace"
      aria-label="Unified Algorithm Learning Workspace and 3D Visualization"
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 flex flex-col bg-[#050A17] p-3 sm:p-4 overflow-y-auto'
          : 'mx-auto max-w-[1400px] px-4 pt-10 pb-6 sm:px-6'
      }
    >
      <div
        className={`rounded-2xl border border-sky-800/70 bg-[#0A1328] shadow-2xl shadow-black/50 overflow-hidden ${
          isFullscreen ? 'flex flex-1 flex-col min-h-0' : ''
        }`}
      >
        {/* 1. UNIFIED WORKSPACE HEADER */}
        <div className="flex flex-col gap-3 border-b border-slate-800 bg-[#081024] px-5 py-3.5 sm:px-6 lg:flex-row lg:items-center lg:justify-between shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-zinc-100">
              <span className="font-semibold text-cyan-300">
                Algorithm Learning Workspace
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-white">{run.definition.title}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-sky-200">
                {run.algorithm === 'factorial'
                  ? `Input n = ${run.inputValue}`
                  : `Terms = ${run.inputValue}`}
              </span>
            </div>
            <h2 className="mt-1 font-display text-lg font-bold tracking-tight text-white sm:text-2xl">
              Configure, Trace &amp; Visualize in 3D
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 text-sm text-white">
              <CheckCircle2 className="h-4 w-4 text-cyan-400" aria-hidden="true" />
              <span>Completed Runs:</span>
              <span
                data-testid="completed-runs-counter"
                className="font-mono font-bold tabular-nums text-amber-300"
              >
                {completedRuns}
              </span>
            </div>

            <button
              type="button"
              onClick={handleToggleFullscreen}
              aria-pressed={isFullscreen}
              aria-label={
                isFullscreen
                  ? 'Exit fullscreen workspace view'
                  : 'Enter fullscreen workspace view'
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/60 bg-[#0E2045] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:border-cyan-400 hover:bg-[#142B59] cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
                  <span>Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
                  <span>Fullscreen</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2. MERGED OPTION SELECTION & INPUT CONTROLS (Always accessible, including in Fullscreen) */}
        <form
          onSubmit={onGenerate}
          noValidate
          className="border-b border-slate-800 bg-[#0C1630] px-5 py-3.5 sm:px-6 shrink-0"
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start">
            {/* Step 1: Select Algorithm */}
            <div className="lg:col-span-4">
              <div className="flex items-center justify-between gap-2">
                <label className="block text-xs font-semibold tracking-wide text-white">
                  1. Select Algorithm
                </label>
                <span className="text-[11px] font-medium text-sky-200">
                  {algorithm === 'factorial' ? 'Range: 0 to 12' : 'Range: 1 to 15 terms'}
                </span>
              </div>
              <div
                role="group"
                aria-label="Algorithm selection"
                className="mt-2 grid grid-cols-2 gap-1.5 rounded-xl bg-[#060B18] p-1 border border-slate-800"
              >
                <button
                  type="button"
                  onClick={() => onSelectAlgorithm('factorial')}
                  aria-pressed={algorithm === 'factorial'}
                  className={`rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                    algorithm === 'factorial'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm'
                      : 'text-zinc-100 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  Factorial (n!)
                </button>
                <button
                  type="button"
                  onClick={() => onSelectAlgorithm('fibonacci')}
                  aria-pressed={algorithm === 'fibonacci'}
                  className={`rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                    algorithm === 'fibonacci'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm'
                      : 'text-zinc-100 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  Fibonacci
                </button>
              </div>
            </div>

            {/* Step 2: Select Approach */}
            <div className="lg:col-span-4">
              <div className="flex items-center justify-between gap-2">
                <label className="block text-xs font-semibold tracking-wide text-white">
                  2. Select Approach
                </label>
                <span className="text-[11px] font-medium text-sky-200 truncate">
                  {approach === 'iterative'
                    ? 'Loop · O(1) auxiliary space'
                    : algorithm === 'fibonacci'
                      ? 'Tail-recursive · O(n) time'
                      : 'Call stack & unwinding'}
                </span>
              </div>
              <div
                role="group"
                aria-label="Approach selection"
                className="mt-2 grid grid-cols-2 gap-1.5 rounded-xl bg-[#060B18] p-1 border border-slate-800"
              >
                <button
                  type="button"
                  onClick={() => onSelectApproach('iterative')}
                  aria-pressed={approach === 'iterative'}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                    approach === 'iterative'
                      ? 'bg-sky-600 text-white shadow-sm ring-1 ring-cyan-400/70'
                      : 'text-zinc-100 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <Repeat className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Iterative</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectApproach('recursive')}
                  aria-pressed={approach === 'recursive'}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
                    approach === 'recursive'
                      ? 'bg-violet-600 text-white shadow-sm ring-1 ring-violet-400/80'
                      : 'text-zinc-100 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <GitFork className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Recursive</span>
                </button>
              </div>
            </div>

            {/* Step 3: Input & Generate */}
            <div className="lg:col-span-4">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="algorithm-input"
                  className="block text-xs font-semibold tracking-wide text-white truncate"
                >
                  3. {definition.inputLabel}
                </label>
                <div className="hidden sm:flex items-center gap-1 text-[11px] text-sky-100 shrink-0">
                  <span>Try:</span>
                  {definition.presets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => onPresetClick(preset)}
                      className={`rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                        rawInput.trim() === String(preset)
                          ? 'bg-cyan-500/30 text-cyan-100 ring-1 ring-cyan-400/60'
                          : 'bg-slate-800 text-zinc-100 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-2 flex items-stretch gap-2">
                <input
                  id="algorithm-input"
                  type="number"
                  inputMode="numeric"
                  min={definition.minInput}
                  max={definition.maxInput}
                  step={1}
                  value={rawInput}
                  onChange={(e) => onInputChange(e.target.value)}
                  aria-invalid={Boolean(inputError)}
                  aria-describedby={inputError ? 'input-validation-error' : undefined}
                  placeholder={`${definition.minInput}–${definition.maxInput}`}
                  className={`w-24 shrink-0 rounded-xl border bg-[#060B18] px-3 py-2 font-mono text-sm sm:text-base font-semibold text-white placeholder-zinc-300 transition-colors focus-visible:outline-none focus-visible:ring-2 ${
                    inputError
                      ? 'border-rose-500/80 focus-visible:ring-rose-400'
                      : 'border-slate-700 focus-visible:ring-cyan-400'
                  }`}
                />

                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-md shadow-blue-950/60 hover:from-blue-500 hover:to-cyan-400 transition-all duration-150 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                >
                  <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  <span>Generate Visualization</span>
                </button>
              </div>

              {/* Mobile Preset Strip */}
              <div className="mt-2 flex sm:hidden flex-wrap items-center gap-1.5 text-xs text-sky-100">
                <span>Try:</span>
                {definition.presets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => onPresetClick(preset)}
                    className={`rounded px-2 py-0.5 font-mono text-xs font-semibold transition-colors cursor-pointer ${
                      rawInput.trim() === String(preset)
                        ? 'bg-cyan-500/30 text-cyan-100 ring-1 ring-cyan-400/60'
                        : 'bg-slate-800 text-zinc-100 hover:bg-slate-700'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {inputError && (
            <div
              id="input-validation-error"
              role="alert"
              className="mt-3 flex items-center gap-2 rounded-xl border border-rose-500/50 bg-rose-950/50 px-4 py-2 text-xs sm:text-sm text-rose-100"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
              <span>{inputError}</span>
            </div>
          )}

          {isPendingConfigChange && !inputError && (
            <p className="mt-2.5 rounded-lg border border-cyan-500/40 bg-cyan-500/12 px-3.5 py-1.5 text-xs text-cyan-100">
              Selection updated to <strong className="text-white">{definition.title}</strong> with input{' '}
              <span className="font-mono font-semibold text-amber-200">{rawInput.trim() || '—'}</span>. Click{' '}
              <strong className="text-white">Generate Visualization</strong> to trace this run.
            </p>
          )}
        </form>

        {/* 3. PLAYBACK, STEP COUNTER & SPEED BAR */}
        <div className="flex flex-col gap-3 border-b border-slate-800 bg-[#091227] px-5 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-display text-sm sm:text-base font-bold text-white">
              Algorithm Execution — Steps &amp; 3D Visualization
            </h3>
            <span aria-hidden="true" className="hidden sm:inline text-slate-500">
              |
            </span>
            <div className="flex items-center gap-2.5 text-xs text-white">
              <span className="font-mono tabular-nums font-semibold whitespace-nowrap">
                Step {stepIndex + 1} of {totalSteps}
              </span>
              <div
                aria-label={`Progress ${progressPercent}%`}
                className="h-2 w-20 overflow-hidden rounded-full bg-slate-800 sm:w-28"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-violet-400 transition-all duration-200"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onPrevious}
              disabled={isFirst}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-[#0E1A36] px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:border-cyan-400/70 disabled:cursor-not-allowed disabled:text-zinc-400 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              <span>Previous</span>
            </button>

            <button
              type="button"
              onClick={onTogglePlay}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-500'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400'
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
              className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-[#0E1A36] px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:border-cyan-400/70 disabled:cursor-not-allowed disabled:text-zinc-400 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={onReset}
              disabled={isFirst && !isPlaying}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-[#0E1A36] px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:border-cyan-400/70 disabled:cursor-not-allowed disabled:text-zinc-400 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reset</span>
            </button>

            <div
              role="group"
              aria-label="Animation playback speed"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-[#060B18] px-2 py-1"
            >
              <Gauge className="h-3.5 w-3.5 text-cyan-400 mr-0.5" aria-hidden="true" />
              {SPEED_OPTIONS.map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => onSpeedChange(spd)}
                  aria-pressed={playbackSpeed === spd}
                  className={`rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                    playbackSpeed === spd
                      ? 'bg-cyan-500/30 text-cyan-100'
                      : 'text-zinc-100 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. TWO SIDE-BY-SIDE SYNCHRONIZED PANELS: 4-col Steps | 8-col Large 3D Stage */}
        <div
          className={`grid grid-cols-1 divide-y divide-slate-800 lg:grid-cols-12 lg:divide-x lg:divide-y-0 ${
            isFullscreen ? 'flex-1 min-h-0' : ''
          }`}
        >
          {/* LEFT PANEL: Numbered Human-Readable Algorithm Steps */}
          <div
            className={`lg:col-span-4 p-5 sm:p-6 bg-[#071022] flex flex-col justify-between ${
              isFullscreen ? 'lg:overflow-y-auto' : ''
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h4 className="font-display text-sm font-semibold text-white">
                  Algorithm Steps
                </h4>
                <span className="text-xs text-cyan-300 font-mono font-semibold">
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
                      className={`flex items-start gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-150 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600/35 via-cyan-500/20 to-transparent text-white ring-1 ring-cyan-400/75 shadow-sm'
                          : 'text-zinc-100 hover:bg-slate-800/45'
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-xs font-semibold tabular-nums ${
                          isActive
                            ? 'bg-cyan-400 text-[#050A17]'
                            : 'bg-slate-800 text-zinc-100'
                        }`}
                      >
                        {line.lineNumber}
                      </span>

                      <div
                        className={`flex flex-1 items-center justify-between gap-2 leading-snug ${
                          line.indent > 0 ? 'pl-3' : ''
                        }`}
                      >
                        <span
                          className={
                            isActive ? 'font-semibold text-white' : 'font-normal text-zinc-100'
                          }
                        >
                          {line.indent > 0 && (
                            <CornerDownRight
                              className="mr-1.5 inline h-3.5 w-3.5 text-cyan-300"
                              aria-hidden="true"
                            />
                          )}
                          {line.text}
                        </span>

                        {isActive && (
                          <ArrowRight
                            className="h-4 w-4 shrink-0 text-cyan-300"
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
            <div className="mt-5 pt-4 border-t border-slate-800">
              <p className="text-xs font-semibold text-white">Current Variable State</p>
              <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                {step.variables.map((variable) => (
                  <div
                    key={variable.name}
                    className={`rounded-xl border px-3 py-2 transition-colors duration-150 ${
                      variable.highlight
                        ? 'border-cyan-400/70 bg-cyan-500/15'
                        : 'border-slate-800 bg-[#060B18]'
                    }`}
                  >
                    <div className="text-[11px] font-medium text-sky-100 truncate">
                      {variable.name}
                    </div>
                    <div
                      className={`mt-0.5 font-mono text-sm font-semibold tabular-nums truncate ${
                        variable.highlight ? 'text-amber-300' : 'text-white'
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
            className={`lg:col-span-8 p-5 sm:p-6 flex flex-col justify-between bg-[#060E1F] ${
              isFullscreen ? 'min-h-0' : ''
            }`}
          >
            <div className={`space-y-3.5 ${isFullscreen ? 'flex flex-1 flex-col min-h-0' : ''}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800 shrink-0">
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
            <div className="mt-3.5 rounded-xl border border-sky-800/70 bg-[#08142B] px-4 py-3 shrink-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-cyan-300">
                  Step {stepIndex + 1} Explanation
                </span>
                {step.loopProgress && (
                  <span className="font-mono text-xs text-sky-200">
                    {step.loopProgress.conditionText}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-white">{step.explanation}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
