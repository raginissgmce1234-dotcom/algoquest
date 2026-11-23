export type AlgorithmType = 'factorial' | 'fibonacci';
export type ApproachType = 'iterative' | 'recursive';

export interface PseudocodeStep {
  lineNumber: number;
  text: string;
  indent: number;
}

export type StepPhase =
  | 'init'
  | 'loop'
  | 'compute'
  | 'call'
  | 'base'
  | 'unwind'
  | 'output'
  | 'complete';

export interface StackFrame {
  id: string;
  label: string;
  depth: number;
  status: 'active' | 'waiting' | 'base' | 'returning' | 'returned';
  params: Record<string, number>;
  pendingExpression?: string;
  returnValue?: string | number;
}

export interface VariableItem {
  name: string;
  value: string | number;
  highlight?: boolean;
}

export interface MultiplicationOp {
  left: number;
  right: number;
  result: number;
}

export interface ShiftOp {
  prevA: number;
  prevB: number;
  nextVal: number;
  newA: number;
  newB: number;
}

export interface TailTransition {
  fromRem: number;
  fromA: number;
  fromB: number;
  toRem: number;
  toA: number;
  toB: number;
}

export interface LoopProgress {
  current: number;
  total: number;
  conditionText: string;
  conditionMet: boolean | null;
}

export interface ExecutionStep {
  index: number;
  activeLine: number;
  phase: StepPhase;
  phaseLabel: string;
  explanation: string;
  variables: VariableItem[];
  stackFrames?: StackFrame[];
  maxDepth?: number;
  multiplicationOp?: MultiplicationOp | null;
  factorsUsed?: number[];
  shiftOp?: ShiftOp | null;
  tailTransition?: TailTransition | null;
  sequenceOutput?: number[];
  loopProgress?: LoopProgress | null;
  stepOutputText?: string;
  isFinal: boolean;
}

export interface VariableRole {
  symbol: string;
  role: string;
}

export interface AlgorithmDefinition {
  algorithm: AlgorithmType;
  approach: ApproachType;
  title: string;
  subtitle: string;
  inputLabel: string;
  minInput: number;
  maxInput: number;
  defaultInput: number;
  presets: number[];
  pseudocode: PseudocodeStep[];
  cCode: string;
  cFileName: string;
  logicSummary: string;
  variableRoles: VariableRole[];
  howItWorks: string;
  whyCorrect: string;
  timeComplexity: string;
  timeExplanation: string;
  spaceComplexity: string;
  spaceExplanation: string;
}

export interface SimulationRun {
  runId: number;
  algorithm: AlgorithmType;
  approach: ApproachType;
  inputValue: number;
  steps: ExecutionStep[];
  finalResultDisplay: string;
  finalSummaryLabel: string;
  definition: AlgorithmDefinition;
}
