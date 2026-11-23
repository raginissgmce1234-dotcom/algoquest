import React from 'react';
import { AlertCircle, CheckCircle2, Play, Repeat, GitFork } from 'lucide-react';
import { AlgorithmDefinition, AlgorithmType, ApproachType } from '../types/algorithm';

interface WorkspaceControlsProps {
  algorithm: AlgorithmType;
  approach: ApproachType;
  rawInput: string;
  inputError: string | null;
  definition: AlgorithmDefinition;
  completedRuns: number;
  onSelectAlgorithm: (algo: AlgorithmType) => void;
  onSelectApproach: (app: ApproachType) => void;
  onInputChange: (val: string) => void;
  onPresetClick: (val: number) => void;
  onGenerate: (e: React.FormEvent) => void;
}

export const WorkspaceControls: React.FC<WorkspaceControlsProps> = ({
  algorithm,
  approach,
  rawInput,
  inputError,
  definition,
  completedRuns,
  onSelectAlgorithm,
  onSelectApproach,
  onInputChange,
  onPresetClick,
  onGenerate,
}) => {
  return (
    <section
      id="workspace"
      className="mx-auto max-w-6xl px-4 pt-12 pb-6 sm:px-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-zinc-800/80 pb-5">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Algorithm Learning Workspace
          </h2>
          <p className="mt-1 text-sm text-zinc-200">
            Choose an algorithm, select an execution approach, validate your input, and trace every step.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-zinc-100 shrink-0">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />
          <span>Completed Runs:</span>
          <span
            data-testid="completed-runs-counter"
            className="font-mono font-semibold tabular-nums text-white"
          >
            {completedRuns}
          </span>
        </div>
      </div>

      <form
        onSubmit={onGenerate}
        noValidate
        className="mt-6 rounded-2xl border border-zinc-800/90 glass-panel p-5 sm:p-6 shadow-xl shadow-black/25"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          {/* Step 1: Select Algorithm */}
          <div className="lg:col-span-4">
            <label className="block text-xs font-semibold tracking-wide text-zinc-100">
              1. Select Algorithm
            </label>
            <div
              role="group"
              aria-label="Algorithm selection"
              className="mt-2.5 grid grid-cols-2 gap-2 rounded-xl bg-[#090F0E] p-1.5 border border-zinc-800"
            >
              <button
                type="button"
                onClick={() => onSelectAlgorithm('factorial')}
                aria-pressed={algorithm === 'factorial'}
                className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  algorithm === 'factorial'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-sm'
                    : 'text-zinc-100 hover:bg-zinc-800/80 hover:text-white'
                }`}
              >
                Factorial (n!)
              </button>
              <button
                type="button"
                onClick={() => onSelectAlgorithm('fibonacci')}
                aria-pressed={algorithm === 'fibonacci'}
                className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  algorithm === 'fibonacci'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-sm'
                    : 'text-zinc-100 hover:bg-zinc-800/80 hover:text-white'
                }`}
              >
                Fibonacci
              </button>
            </div>
            <p className="mt-2 text-xs text-zinc-200">
              {algorithm === 'factorial'
                ? 'Valid input range: integer n from 0 to 12.'
                : 'Valid input range: 1 to 15 terms.'}
            </p>
          </div>

          {/* Step 2: Select Approach */}
          <div className="lg:col-span-4">
            <label className="block text-xs font-semibold tracking-wide text-zinc-100">
              2. Select Approach
            </label>
            <div
              role="group"
              aria-label="Approach selection"
              className="mt-2.5 grid grid-cols-2 gap-2 rounded-xl bg-[#090F0E] p-1.5 border border-zinc-800"
            >
              <button
                type="button"
                onClick={() => onSelectApproach('iterative')}
                aria-pressed={approach === 'iterative'}
                className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  approach === 'iterative'
                    ? 'bg-teal-600 text-white shadow-sm ring-1 ring-emerald-400/60'
                    : 'text-zinc-100 hover:bg-zinc-800/80 hover:text-white'
                }`}
              >
                <Repeat className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Iterative</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectApproach('recursive')}
                aria-pressed={approach === 'recursive'}
                className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  approach === 'recursive'
                    ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400/70'
                    : 'text-zinc-100 hover:bg-zinc-800/80 hover:text-white'
                }`}
              >
                <GitFork className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Recursive</span>
              </button>
            </div>
            <p className="mt-2 text-xs text-zinc-200">
              {approach === 'iterative'
                ? 'Uses a loop with O(1) auxiliary memory.'
                : algorithm === 'fibonacci'
                  ? 'Tail-recursive helper fibonacci(remaining, a, b).'
                  : 'Uses the call stack and return unwinding.'}
            </p>
          </div>

          {/* Step 3: Input & Generate */}
          <div className="lg:col-span-4">
            <label
              htmlFor="algorithm-input"
              className="block text-xs font-semibold tracking-wide text-zinc-100"
            >
              3. {definition.inputLabel}
            </label>

            <div className="mt-2.5 flex items-stretch gap-2.5">
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
                className={`w-28 shrink-0 rounded-xl border bg-[#090F0E] px-3.5 py-2.5 font-mono text-base font-semibold text-white placeholder-zinc-300 transition-colors focus-visible:outline-none focus-visible:ring-2 ${
                  inputError
                    ? 'border-rose-500/80 focus-visible:ring-rose-400'
                    : 'border-zinc-700 focus-visible:ring-emerald-400'
                }`}
              />

              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-950/50 hover:from-emerald-500 hover:to-teal-400 transition-all duration-150 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              >
                <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                <span>Generate Visualization</span>
              </button>
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-zinc-200">
              <span>Try:</span>
              {definition.presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onPresetClick(preset)}
                  className={`rounded-md px-2 py-0.5 font-mono text-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                    rawInput.trim() === String(preset)
                      ? 'bg-emerald-500/25 text-emerald-200 ring-1 ring-emerald-500/50'
                      : 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 hover:text-white'
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
            className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-950/40 px-4 py-2.5 text-sm text-rose-200"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
            <span>{inputError}</span>
          </div>
        )}
      </form>
    </section>
  );
};
