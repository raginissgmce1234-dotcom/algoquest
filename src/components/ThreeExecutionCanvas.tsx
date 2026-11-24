import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  Box,
  CheckCircle2,
  Compass,
  Layers,
} from 'lucide-react';
import { AlgoSceneEngine } from '../three/AlgoSceneEngine';
import { ExecutionStep, SimulationRun, StackFrame } from '../types/algorithm';

interface ThreeExecutionCanvasProps {
  run: SimulationRun;
  stepIndex: number;
  isFullscreen?: boolean;
}

function isWebGLSupported(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

function FrameStatusText({ status }: { status: StackFrame['status'] }) {
  switch (status) {
    case 'active':
      return <span className="text-xs font-semibold text-cyan-300">Active Frame</span>;
    case 'waiting':
      return <span className="text-xs font-medium text-indigo-200">Paused / Waiting</span>;
    case 'base':
      return <span className="text-xs font-semibold text-amber-300">Base Case Hit</span>;
    case 'returning':
      return <span className="text-xs font-semibold text-sky-300">Unwinding &amp; Returning</span>;
    case 'returned':
      return <span className="text-xs font-medium text-zinc-100">Returned</span>;
  }
}

const Fallback2DView: React.FC<{ run: SimulationRun; step: ExecutionStep }> = ({
  run,
  step,
}) => {
  return (
    <div className="space-y-4 p-4">
      {step.multiplicationOp && (
        <div className="rounded-xl border border-cyan-500/45 bg-[#0A1633] p-4">
          <div className="text-xs font-semibold text-cyan-300">
            Active Multiplication
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-base font-bold tabular-nums text-white">
            <span>{step.multiplicationOp.left.toLocaleString()}</span>
            <span className="text-amber-300">×</span>
            <span>{step.multiplicationOp.right.toLocaleString()}</span>
            <span className="text-sky-200">=</span>
            <span className="text-amber-300">
              {step.multiplicationOp.result.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {step.shiftOp && (
        <div className="rounded-xl border border-violet-500/45 bg-[#111433] p-4 font-mono text-xs text-white space-y-2">
          <div className="font-semibold text-violet-300 font-sans">
            Sliding Window Shift
          </div>
          <div>
            next = {step.shiftOp.prevA} + {step.shiftOp.prevB} ={' '}
            <strong className="text-amber-300">{step.shiftOp.nextVal}</strong>
          </div>
          <div className="flex flex-wrap gap-4">
            <span>a ← {step.shiftOp.newA}</span>
            <span>b ← {step.shiftOp.newB}</span>
          </div>
        </div>
      )}

      {step.stackFrames !== undefined && (
        <div className="rounded-xl border border-slate-800 bg-[#0A1530] p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-white">
            <span className="flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-violet-400" aria-hidden="true" />
              Call Stack Frames
            </span>
            <span className="font-mono text-sky-200 tabular-nums">
              Depth {step.stackFrames.length} / {step.maxDepth ?? 1}
            </span>
          </div>

          {step.stackFrames.length > 0 ? (
            <div className="mt-3 space-y-2">
              {[...step.stackFrames].reverse().map((frame) => (
                <div
                  key={frame.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800 bg-[#060B18] px-3 py-2"
                >
                  <div className="flex items-center gap-2 font-mono text-xs text-white">
                    <span className="text-sky-200">D{frame.depth}</span>
                    <span className="font-semibold">{frame.label}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    {frame.pendingExpression && (
                      <span className="font-mono text-zinc-100">
                        {frame.pendingExpression}
                      </span>
                    )}
                    <FrameStatusText status={frame.status} />
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-center gap-1 text-[11px] text-sky-200">
                <ArrowDown className="h-3 w-3" aria-hidden="true" />
                <span>main()</span>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-xs text-cyan-200">
              All frames resolved and returned to main().
            </p>
          )}
        </div>
      )}

      {step.sequenceOutput && step.sequenceOutput.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-[#0A1530] p-4">
          <div className="text-xs font-semibold text-white">
            Fibonacci Sequence ({step.sequenceOutput.length} / {run.inputValue})
          </div>
          <div className="mt-2.5 flex flex-wrap gap-2 font-mono text-xs">
            {step.sequenceOutput.map((val, idx) => (
              <span
                key={`${idx}-${val}`}
                className="rounded-lg border border-cyan-500/45 bg-cyan-500/15 px-2.5 py-1 text-cyan-100 tabular-nums"
              >
                F{idx}: {val}
              </span>
            ))}
          </div>
        </div>
      )}

      {step.isFinal && step.stepOutputText && (
        <div className="rounded-xl border border-cyan-400/50 bg-cyan-950/40 px-4 py-3 text-sm font-mono font-bold text-amber-200 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-cyan-300" aria-hidden="true" />
          <span>{step.stepOutputText}</span>
        </div>
      )}
    </div>
  );
};

export const ThreeExecutionCanvas: React.FC<ThreeExecutionCanvasProps> = ({
  run,
  stepIndex,
  isFullscreen = false,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<AlgoSceneEngine | null>(null);
  const [webglReady, setWebglReady] = useState<boolean>(() => isWebGLSupported());
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');

  const show3D = webglReady && viewMode === '3d';
  const step = run.steps[stepIndex];

  useEffect(() => {
    if (!show3D || !mountRef.current) return;

    try {
      const engine = new AlgoSceneEngine(mountRef.current);
      engineRef.current = engine;
      engine.updateExecutionState(run, stepIndex);

      return () => {
        engine.dispose();
        engineRef.current = null;
      };
    } catch {
      setWebglReady(false);
    }
    // Mount WebGL canvas once per show3D lifecycle
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show3D]);

  useEffect(() => {
    if (engineRef.current && show3D) {
      engineRef.current.updateExecutionState(run, stepIndex);
    }
  }, [run, stepIndex, show3D]);

  const handleResetCamera = () => {
    engineRef.current?.resetCamera();
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-sky-800/70 bg-[#060B18] shadow-inner shadow-black/50 ${
        isFullscreen ? 'flex flex-1 flex-col min-h-0' : ''
      }`}
    >
      {/* Top Non-Occluding Stage Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-900/60 bg-[#0A1530] px-4 py-2 text-xs shrink-0">
        <div className="flex items-center gap-2 text-white">
          <Box className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
          <span className="font-semibold">
            {show3D ? 'Interactive 3D Stage' : '2D Execution Fallback'}
          </span>
          {show3D && (
            <span className="hidden sm:inline text-sky-200">
              · Drag to orbit · Scroll to zoom
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {show3D && (
            <button
              type="button"
              onClick={handleResetCamera}
              className="inline-flex items-center gap-1 rounded-md border border-sky-700/70 bg-[#0F2047] px-2.5 py-1 text-[11px] font-medium text-white hover:border-cyan-400 transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <Compass className="h-3 w-3 text-cyan-300" aria-hidden="true" />
              <span>Reset Camera</span>
            </button>
          )}

          {webglReady && (
            <button
              type="button"
              onClick={() => setViewMode((m) => (m === '3d' ? '2d' : '3d'))}
              className="inline-flex items-center gap-1 rounded-md border border-sky-700/70 bg-[#0F2047] px-2.5 py-1 text-[11px] font-medium text-white hover:border-cyan-400 transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <span>{viewMode === '3d' ? '2D View' : '3D View'}</span>
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Dedicated WebGL Mount OR 2D Fallback */}
      {show3D ? (
        <div
          ref={mountRef}
          aria-label="3D algorithm execution viewport"
          className={
            isFullscreen
              ? 'w-full flex-1 min-h-[360px] lg:min-h-[430px]'
              : 'h-[440px] w-full sm:h-[540px] lg:h-[600px]'
          }
        />
      ) : (
        <div
          className={`bg-[#060B18] ${
            isFullscreen
              ? 'flex-1 min-h-[360px] overflow-y-auto'
              : 'min-h-[440px] sm:min-h-[540px] lg:min-h-[600px]'
          }`}
        >
          {!webglReady && (
            <div className="border-b border-amber-500/40 bg-amber-950/35 px-4 py-2 text-xs text-amber-100">
              WebGL is unavailable in this browser context. Displaying synchronized 2D execution view.
            </div>
          )}
          <Fallback2DView run={run} step={step} />
        </div>
      )}
    </div>
  );
};
