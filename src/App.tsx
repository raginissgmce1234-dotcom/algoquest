/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { WorkspaceControls } from './components/WorkspaceControls';
import { SynchronizedVisualizer } from './components/SynchronizedVisualizer';
import { PostExecutionSections } from './components/PostExecutionSections';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';
import {
  buildSimulationRun,
  getAlgorithmDefinition,
  validateAlgorithmInput,
} from './engine/algorithms';
import { AlgorithmType, ApproachType, SimulationRun } from './types/algorithm';

export default function App() {
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('factorial');
  const [approach, setApproach] = useState<ApproachType>('iterative');
  const [rawInput, setRawInput] = useState<string>('5');
  const [inputError, setInputError] = useState<string | null>(null);

  const nextRunIdRef = useRef<number>(2);
  const [activeRun, setActiveRun] = useState<SimulationRun>(() =>
    buildSimulationRun(1, 'factorial', 'iterative', 5)
  );
  const [stepIndex, setStepIndex] = useState<number>(0);

  // Completed Runs counter: increments strictly once when a given runId reaches its final step
  const [completedRuns, setCompletedRuns] = useState<number>(0);
  const [countedRunIds, setCountedRunIds] = useState<Set<number>>(() => new Set());
  const countedRunIdsRef = useRef<Set<number>>(new Set());

  const currentDefinition = getAlgorithmDefinition(algorithm, approach);
  const isPendingConfigChange =
    activeRun.algorithm !== algorithm ||
    activeRun.approach !== approach ||
    String(activeRun.inputValue) !== rawInput.trim();

  const hasCompletedCurrentRun = countedRunIds.has(activeRun.runId);
  const isFinalStep = stepIndex === activeRun.steps.length - 1;

  const markRunCompletedIfFinal = (targetIndex: number, run: SimulationRun) => {
    if (targetIndex === run.steps.length - 1 && !countedRunIdsRef.current.has(run.runId)) {
      countedRunIdsRef.current.add(run.runId);
      setCountedRunIds(new Set(countedRunIdsRef.current));
      setCompletedRuns((count) => count + 1);
    }
  };

  const scrollToWorkspace = () => {
    const el = document.getElementById('workspace');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectAlgorithm = (nextAlgo: AlgorithmType) => {
    if (nextAlgo === algorithm) return;
    setAlgorithm(nextAlgo);
    setInputError(null);
    const nextDef = getAlgorithmDefinition(nextAlgo, approach);
    const parsed = Number.parseInt(rawInput.trim(), 10);
    if (
      Number.isNaN(parsed) ||
      parsed < nextDef.minInput ||
      parsed > nextDef.maxInput
    ) {
      setRawInput(String(nextDef.defaultInput));
    }
  };

  const handleSelectApproach = (nextApproach: ApproachType) => {
    setApproach(nextApproach);
    setInputError(null);
  };

  const handleInputChange = (val: string) => {
    setRawInput(val);
    if (inputError) {
      setInputError(null);
    }
  };

  const handlePresetClick = (presetVal: number) => {
    setRawInput(String(presetVal));
    setInputError(null);
  };

  const startNewRun = (
    algo: AlgorithmType,
    app: ApproachType,
    validatedValue: number
  ) => {
    const runId = nextRunIdRef.current;
    nextRunIdRef.current += 1;
    const newRun = buildSimulationRun(runId, algo, app, validatedValue);
    setActiveRun(newRun);
    setStepIndex(0);
    markRunCompletedIfFinal(0, newRun);
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateAlgorithmInput(algorithm, rawInput);
    if (!validation.valid) {
      setInputError(validation.error);
      return;
    }
    setInputError(null);
    startNewRun(algorithm, approach, validation.value);
  };

  const handleQuickSelectFromHero = (
    algo: AlgorithmType,
    app: ApproachType
  ) => {
    const def = getAlgorithmDefinition(algo, app);
    setAlgorithm(algo);
    setApproach(app);
    setRawInput(String(def.defaultInput));
    setInputError(null);
    startNewRun(algo, app, def.defaultInput);
    scrollToWorkspace();
  };

  const handlePrevious = () => {
    setStepIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    const next = Math.min(activeRun.steps.length - 1, stepIndex + 1);
    setStepIndex(next);
    markRunCompletedIfFinal(next, activeRun);
  };

  const handleReset = () => {
    setStepIndex(0);
  };

  const handleJumpToFinal = () => {
    const finalIdx = activeRun.steps.length - 1;
    setStepIndex(finalIdx);
    markRunCompletedIfFinal(finalIdx, activeRun);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090F0E] text-zinc-100">
      <Navbar onStartLearning={scrollToWorkspace} />

      <main className="flex-1">
        <HeroSection
          onStartLearning={scrollToWorkspace}
          onQuickSelect={handleQuickSelectFromHero}
        />

        <WorkspaceControls
          algorithm={algorithm}
          approach={approach}
          rawInput={rawInput}
          inputError={inputError}
          definition={currentDefinition}
          completedRuns={completedRuns}
          onSelectAlgorithm={handleSelectAlgorithm}
          onSelectApproach={handleSelectApproach}
          onInputChange={handleInputChange}
          onPresetClick={handlePresetClick}
          onGenerate={handleGenerate}
        />

        {isPendingConfigChange && (
          <div className="mx-auto max-w-6xl px-4 pb-2 sm:px-6">
            <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-200">
              Selection updated to <strong>{currentDefinition.title}</strong> with input{' '}
              <span className="font-mono">{rawInput.trim() || '—'}</span>. Click{' '}
              <strong>Generate Visualization</strong> to trace this configuration.
            </p>
          </div>
        )}

        <SynchronizedVisualizer
          run={activeRun}
          stepIndex={stepIndex}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onReset={handleReset}
        />

        <PostExecutionSections
          run={activeRun}
          isFinalStep={isFinalStep}
          hasCompletedCurrentRun={hasCompletedCurrentRun}
          onJumpToFinal={handleJumpToFinal}
        />

        <AboutSection />
      </main>

      <Footer />
    </div>
  );
}
