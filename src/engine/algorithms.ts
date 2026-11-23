import {
  AlgorithmDefinition,
  AlgorithmType,
  ApproachType,
  ExecutionStep,
  SimulationRun,
  StackFrame,
} from '../types/algorithm';

export const ALGORITHM_DEFINITIONS: Record<
  `${AlgorithmType}_${ApproachType}`,
  AlgorithmDefinition
> = {
  factorial_iterative: {
    algorithm: 'factorial',
    approach: 'iterative',
    title: 'Factorial — Iterative',
    subtitle: 'Sequential loop accumulation from 1 through n',
    inputLabel: 'Enter non-negative integer n (0 to 12)',
    minInput: 0,
    maxInput: 12,
    defaultInput: 5,
    presets: [0, 1, 5, 8, 12],
    pseudocode: [
      { lineNumber: 1, text: 'Accept integer input n (0 ≤ n ≤ 12)', indent: 0 },
      { lineNumber: 2, text: 'Initialize accumulator fact ← 1', indent: 0 },
      { lineNumber: 3, text: 'Loop counter i from 1 up to n:', indent: 0 },
      { lineNumber: 4, text: 'Multiply fact ← fact × i', indent: 1 },
      { lineNumber: 5, text: 'End loop and display final fact', indent: 0 },
    ],
    cFileName: 'factorial_iterative.c',
    cCode: `#include <stdio.h>

int main(void) {
    int n;
    long long fact = 1;

    printf("Enter an integer (0 to 12): ");
    if (scanf("%d", &n) != 1 || n < 0 || n > 12) {
        printf("Invalid input. Please enter an integer from 0 to 12.\\n");
        return 1;
    }

    for (int i = 1; i <= n; i++) {
        fact = fact * i;
    }

    printf("%d! = %lld\\n", n, fact);
    return 0;
}`,
    logicSummary:
      'The iterative factorial algorithm builds n! step by step using a single loop. Starting from the multiplicative identity 1, it multiplies each integer from 1 up to n into a running accumulator.',
    variableRoles: [
      { symbol: 'n', role: 'The target integer whose factorial (n!) we want to compute.' },
      { symbol: 'fact', role: 'Accumulator initialized to 1; holds the running product after each iteration.' },
      { symbol: 'i', role: 'Loop counter starting at 1 and incrementing by 1 until i exceeds n.' },
    ],
    howItWorks:
      'Before entering the loop, fact is set to 1. On every iteration, i advances from 1 to n and updates fact = fact * i. When n = 0, the condition 1 <= 0 fails immediately, the loop body runs zero times, and fact remains 1—matching the mathematical definition 0! = 1.',
    whyCorrect:
      'By loop invariant, after iteration k (for 0 <= k <= n), fact holds the exact product 1 × 2 × ... × k = k!. When the loop exits at i = n + 1, k equals n, guaranteeing fact = n!.',
    timeComplexity: 'O(n)',
    timeExplanation: 'The for-loop executes exactly n multiplications, scaling linearly with input n.',
    spaceComplexity: 'O(1)',
    spaceExplanation: 'Only fixed scalar variables (n, fact, i) are stored in memory regardless of n.',
  },

  factorial_recursive: {
    algorithm: 'factorial',
    approach: 'recursive',
    title: 'Factorial — Recursive',
    subtitle: 'Call-stack descent to base case n ≤ 1, then return unwinding',
    inputLabel: 'Enter non-negative integer n (0 to 12)',
    minInput: 0,
    maxInput: 12,
    defaultInput: 5,
    presets: [0, 1, 5, 7, 12],
    pseudocode: [
      { lineNumber: 1, text: 'Enter function factorial(n)', indent: 0 },
      { lineNumber: 2, text: 'If n ≤ 1, return 1 (Base Case)', indent: 1 },
      { lineNumber: 3, text: 'Otherwise, call factorial(n - 1)', indent: 1 },
      { lineNumber: 4, text: 'Compute n × returned value and return', indent: 1 },
      { lineNumber: 5, text: 'Receive final result in main and display', indent: 0 },
    ],
    cFileName: 'factorial_recursive.c',
    cCode: `#include <stdio.h>

long long factorial(int n) {
    if (n <= 1) {
        return 1;
    }
    return (long long)n * factorial(n - 1);
}

int main(void) {
    int n;

    printf("Enter an integer (0 to 12): ");
    if (scanf("%d", &n) != 1 || n < 0 || n > 12) {
        printf("Invalid input. Please enter an integer from 0 to 12.\\n");
        return 1;
    }

    long long result = factorial(n);
    printf("%d! = %lld\\n", n, result);
    return 0;
}`,
    logicSummary:
      'Recursive factorial breaks the problem n! into a smaller identical subproblem: n! = n × (n - 1)!. Calls pause and stack up until reaching the base case n ≤ 1, then unwind in reverse order to complete each pending multiplication.',
    variableRoles: [
      { symbol: 'n', role: 'Local parameter inside each stack frame; decreases by 1 on every recursive call.' },
      { symbol: 'Call Stack', role: 'Stores each paused factorial(k) frame and its pending multiplication k × ?.' },
      { symbol: 'result', role: 'Final unwound product returned to main() once all frames resolve.' },
    ],
    howItWorks:
      'Calling factorial(n) checks if n <= 1. If not, the current frame pauses and pushes factorial(n - 1) onto the call stack. This repeats until factorial(1) (or factorial(0) when input is 0) returns 1. Each waiting frame then resumes, multiplies its own n by the returned sub-result, and passes the product upward.',
    whyCorrect:
      'Every recursive step strictly reduces n by 1, guaranteeing termination at the base case n ≤ 1 where 0! = 1 and 1! = 1. By mathematical induction, if factorial(n - 1) returns (n - 1)!, then n × factorial(n - 1) returns n!.',
    timeComplexity: 'O(n)',
    timeExplanation: 'Makes max(1, n) function calls, each performing one comparison and one multiplication.',
    spaceComplexity: 'O(n)',
    spaceExplanation: 'Requires up to max(1, n) active frames on the system call stack before unwinding.',
  },

  fibonacci_iterative: {
    algorithm: 'fibonacci',
    approach: 'iterative',
    title: 'Fibonacci — Iterative',
    subtitle: 'Two-variable sliding window shifting a ← b and b ← a + b',
    inputLabel: 'Enter number of terms (1 to 15)',
    minInput: 1,
    maxInput: 15,
    defaultInput: 7,
    presets: [1, 2, 7, 10, 15],
    pseudocode: [
      { lineNumber: 1, text: 'Accept number of terms n (1 ≤ n ≤ 15)', indent: 0 },
      { lineNumber: 2, text: 'Initialize a ← 0 and b ← 1', indent: 0 },
      { lineNumber: 3, text: 'Loop term from 1 up to n:', indent: 0 },
      { lineNumber: 4, text: 'Output current value a', indent: 1 },
      { lineNumber: 5, text: 'Compute next ← a + b, shift a ← b, b ← next', indent: 1 },
      { lineNumber: 6, text: 'End loop with complete Fibonacci sequence', indent: 0 },
    ],
    cFileName: 'fibonacci_iterative.c',
    cCode: `#include <stdio.h>

int main(void) {
    int n;
    long long a = 0, b = 1, next;

    printf("Enter number of terms (1 to 15): ");
    if (scanf("%d", &n) != 1 || n < 1 || n > 15) {
        printf("Invalid input. Please enter an integer from 1 to 15.\\n");
        return 1;
    }

    printf("Fibonacci Series: ");
    for (int i = 1; i <= n; i++) {
        printf("%lld", a);
        if (i < n) {
            printf(" ");
        }
        next = a + b;
        a = b;
        b = next;
    }
    printf("\\n");

    return 0;
}`,
    logicSummary:
      'Instead of storing an entire array or repeating calculations, iterative Fibonacci keeps just the two most recent numbers in a and b. Each iteration emits a and slides the two-number window forward by one term.',
    variableRoles: [
      { symbol: 'n', role: 'Total number of Fibonacci terms to generate and print.' },
      { symbol: 'a', role: 'Current Fibonacci term being printed on this iteration (starts at 0).' },
      { symbol: 'b', role: 'The immediately following Fibonacci term (starts at 1).' },
      { symbol: 'next', role: 'Temporary sum a + b used to advance the sliding window safely.' },
    ],
    howItWorks:
      'We start with a = 0 and b = 1. During each of the n iterations, we print a first so the sequence begins with 0, 1, 1, 2, 3... Next, we calculate next = a + b, copy b into a, and copy next into b. This shifts both registers one position right along the Fibonacci sequence.',
    whyCorrect:
      'At the start of iteration k (1-indexed), a holds F(k - 1) and b holds F(k). Printing a emits F(k - 1), and setting (a, b) ← (b, a + b) restores the invariant (F(k), F(k + 1)) for the next iteration.',
    timeComplexity: 'O(n)',
    timeExplanation: 'Loops exactly n times with constant-time addition and variable assignments per step.',
    spaceComplexity: 'O(1)',
    spaceExplanation: 'Only four fixed variables (n, a, b, next) are allocated in memory.',
  },

  fibonacci_recursive: {
    algorithm: 'fibonacci',
    approach: 'recursive',
    title: 'Fibonacci — Tail-Recursive',
    subtitle: 'Efficient linear-time helper fibonacci(remaining, a, b)',
    inputLabel: 'Enter number of terms (1 to 15)',
    minInput: 1,
    maxInput: 15,
    defaultInput: 7,
    presets: [1, 2, 7, 10, 15],
    pseudocode: [
      { lineNumber: 1, text: 'Call helper fibonacci(remaining ← n, a ← 0, b ← 1)', indent: 0 },
      { lineNumber: 2, text: 'If remaining == 0, return (Base Case)', indent: 1 },
      { lineNumber: 3, text: 'Output current parameter a', indent: 1 },
      { lineNumber: 4, text: 'Tail-call fibonacci(remaining - 1, b, a + b)', indent: 1 },
      { lineNumber: 5, text: 'Complete sequence when recursion returns', indent: 0 },
    ],
    cFileName: 'fibonacci_tail_recursive.c',
    cCode: `#include <stdio.h>

void fibonacci(int remaining, long long a, long long b) {
    if (remaining == 0) {
        return;
    }
    printf("%lld", a);
    if (remaining > 1) {
        printf(" ");
    }
    fibonacci(remaining - 1, b, a + b);
}

int main(void) {
    int n;

    printf("Enter number of terms (1 to 15): ");
    if (scanf("%d", &n) != 1 || n < 1 || n > 15) {
        printf("Invalid input. Please enter an integer from 1 to 15.\\n");
        return 1;
    }

    printf("Fibonacci Series: ");
    fibonacci(n, 0, 1);
    printf("\\n");

    return 0;
}`,
    logicSummary:
      'Unlike naive exponential recursion that recomputes values in a branching tree, this tail-recursive helper carries the sliding state (a, b) forward through function parameters—achieving linear O(n) runtime.',
    variableRoles: [
      { symbol: 'remaining', role: 'Counts how many terms are still left to emit; stops recursion at 0.' },
      { symbol: 'a', role: 'Current Fibonacci term emitted in this call (starts at 0).' },
      { symbol: 'b', role: 'Next Fibonacci term passed forward as the new a (starts at 1).' },
    ],
    howItWorks:
      'main() starts the chain with fibonacci(n, 0, 1). In each frame, if remaining == 0 the base case stops recursion immediately. Otherwise, it prints a and invokes fibonacci(remaining - 1, b, a + b) as its final action. Because the next two terms are computed before calling, no branch splits occur.',
    whyCorrect:
      'Each recursive call reduces remaining by 1, so after n calls remaining reaches 0 and terminates cleanly. Because parameters (a, b) transition from (F(k), F(k + 1)) to (F(k + 1), F(k + 2)), the n emitted values are guaranteed to be F(0) through F(n - 1).',
    timeComplexity: 'O(n)',
    timeExplanation: 'Makes exactly n + 1 linear calls (one per term plus the base case), avoiding exponential O(2ⁿ) branching.',
    spaceComplexity: 'O(n)',
    spaceExplanation: 'Tracks up to n + 1 nested call frames on the call stack (unless optimized via tail-call elimination).',
  },
};

export function getAlgorithmDefinition(
  algorithm: AlgorithmType,
  approach: ApproachType
): AlgorithmDefinition {
  return ALGORITHM_DEFINITIONS[`${algorithm}_${approach}`];
}

export function validateAlgorithmInput(
  algorithm: AlgorithmType,
  rawValue: string
): { valid: true; value: number } | { valid: false; error: string } {
  const trimmed = rawValue.trim();
  if (!trimmed) {
    return {
      valid: false,
      error:
        algorithm === 'factorial'
          ? 'Please enter an integer between 0 and 12.'
          : 'Please enter the number of terms between 1 and 15.',
    };
  }

  if (!/^-?\d+$/.test(trimmed)) {
    return {
      valid: false,
      error: 'Input must be a whole integer without decimals or letters.',
    };
  }

  const parsed = Number.parseInt(trimmed, 10);
  if (algorithm === 'factorial') {
    if (parsed < 0 || parsed > 12) {
      return {
        valid: false,
        error: 'Factorial input n must be between 0 and 12 (12! = 479,001,600).',
      };
    }
  } else {
    if (parsed < 1 || parsed > 15) {
      return {
        valid: false,
        error: 'Fibonacci terms must be between 1 and 15.',
      };
    }
  }

  return { valid: true, value: parsed };
}

function generateFactorialIterativeSteps(n: number): {
  steps: ExecutionStep[];
  finalValue: number;
} {
  const steps: ExecutionStep[] = [];
  let fact = 1;
  const factorsUsed: number[] = [];

  steps.push({
    index: 0,
    activeLine: 1,
    phase: 'init',
    phaseLabel: 'Input Validated',
    explanation: `Validated input n = ${n}. We will compute ${n}! iteratively.`,
    variables: [
      { name: 'n', value: n, highlight: true },
      { name: 'fact', value: '—' },
      { name: 'i', value: '—' },
    ],
    factorsUsed: [],
    loopProgress: {
      current: 0,
      total: n,
      conditionText: n === 0 ? '0 iterations required' : `Loop planned: i = 1 .. ${n}`,
      conditionMet: null,
    },
    isFinal: false,
  });

  steps.push({
    index: steps.length,
    activeLine: 2,
    phase: 'init',
    phaseLabel: 'Initialize Accumulator',
    explanation:
      n === 0
        ? 'Initialize fact = 1. Since 0! is defined as 1, starting at 1 handles n = 0 cleanly.'
        : 'Initialize accumulator fact = 1 (the multiplicative identity).',
    variables: [
      { name: 'n', value: n },
      { name: 'fact', value: 1, highlight: true },
      { name: 'i', value: '—' },
    ],
    factorsUsed: [],
    loopProgress: {
      current: 0,
      total: n,
      conditionText: `Ready to check i = 1 ≤ ${n}`,
      conditionMet: null,
    },
    isFinal: false,
  });

  for (let i = 1; i <= n; i++) {
    steps.push({
      index: steps.length,
      activeLine: 3,
      phase: 'loop',
      phaseLabel: `Loop Check (i = ${i})`,
      explanation: `Check loop condition: i (${i}) ≤ n (${n}) is true. Entering iteration ${i} of ${n}.`,
      variables: [
        { name: 'n', value: n },
        { name: 'fact', value: fact },
        { name: 'i', value: i, highlight: true },
      ],
      factorsUsed: [...factorsUsed],
      loopProgress: {
        current: i,
        total: n,
        conditionText: `${i} ≤ ${n} (True)`,
        conditionMet: true,
      },
      isFinal: false,
    });

    const prevFact = fact;
    fact = prevFact * i;
    factorsUsed.push(i);

    steps.push({
      index: steps.length,
      activeLine: 4,
      phase: 'compute',
      phaseLabel: 'Multiply Accumulator',
      explanation: `Update fact = ${prevFact.toLocaleString()} × ${i} = ${fact.toLocaleString()}.`,
      variables: [
        { name: 'n', value: n },
        { name: 'fact', value: fact, highlight: true },
        { name: 'i', value: i },
      ],
      multiplicationOp: { left: prevFact, right: i, result: fact },
      factorsUsed: [...factorsUsed],
      loopProgress: {
        current: i,
        total: n,
        conditionText: `Completed iteration ${i} of ${n}`,
        conditionMet: true,
      },
      isFinal: false,
    });
  }

  steps.push({
    index: steps.length,
    activeLine: 3,
    phase: 'loop',
    phaseLabel: 'Loop Exit Check',
    explanation:
      n === 0
        ? 'Check loop condition: i (1) ≤ n (0) is false. The loop executes 0 times and exits immediately.'
        : `Check loop condition: i (${n + 1}) ≤ n (${n}) is false. All ${n} iterations are complete; exit loop.`,
    variables: [
      { name: 'n', value: n },
      { name: 'fact', value: fact },
      { name: 'i', value: n + 1, highlight: true },
    ],
    factorsUsed: [...factorsUsed],
    loopProgress: {
      current: n,
      total: n,
      conditionText: `${n + 1} ≤ ${n} (False — Exit Loop)`,
      conditionMet: false,
    },
    isFinal: false,
  });

  steps.push({
    index: steps.length,
    activeLine: 5,
    phase: 'complete',
    phaseLabel: 'Execution Complete',
    explanation: `Display final result: ${n}! = ${fact.toLocaleString()}.`,
    variables: [
      { name: 'n', value: n },
      { name: 'fact', value: fact, highlight: true },
      { name: 'Result', value: `${n}! = ${fact.toLocaleString()}` },
    ],
    factorsUsed: [...factorsUsed],
    loopProgress: {
      current: n,
      total: n,
      conditionText: 'Completed',
      conditionMet: false,
    },
    stepOutputText: `${n}! = ${fact.toLocaleString()}`,
    isFinal: true,
  });

  return { steps, finalValue: fact };
}

function generateFactorialRecursiveSteps(n: number): {
  steps: ExecutionStep[];
  finalValue: number;
} {
  const steps: ExecutionStep[] = [];
  const baseTarget = n <= 1 ? n : 1;
  const maxDepth = n <= 1 ? 1 : n;

  const cloneFrames = (frames: StackFrame[]): StackFrame[] =>
    frames.map((f) => ({ ...f, params: { ...f.params } }));

  const stack: StackFrame[] = [
    {
      id: `fact-${n}`,
      label: `factorial(${n})`,
      depth: 1,
      status: 'active',
      params: { n },
      pendingExpression: n <= 1 ? 'Check n ≤ 1' : `${n} × factorial(${n - 1})`,
    },
  ];

  steps.push({
    index: 0,
    activeLine: 1,
    phase: 'call',
    phaseLabel: `Call factorial(${n})`,
    explanation: `main() invokes factorial(${n}). Frame factorial(${n}) is pushed onto the call stack at depth 1.`,
    variables: [
      { name: 'current n', value: n, highlight: true },
      { name: 'stack depth', value: 1 },
      { name: 'max depth', value: maxDepth },
    ],
    stackFrames: cloneFrames(stack),
    maxDepth,
    isFinal: false,
  });

  // Descent phase down to baseTarget
  for (let k = n; k > baseTarget; k--) {
    const topIdx = stack.length - 1;
    stack[topIdx] = {
      ...stack[topIdx],
      status: 'active',
      pendingExpression: `${k} ≤ 1 is False → call factorial(${k - 1})`,
    };

    steps.push({
      index: steps.length,
      activeLine: 2,
      phase: 'call',
      phaseLabel: `Descending (n = ${k})`,
      explanation: `Check base case in factorial(${k}): ${k} ≤ 1 is false, so we must recurse deeper.`,
      variables: [
        { name: 'current n', value: k, highlight: true },
        { name: 'stack depth', value: stack.length },
        { name: 'max depth', value: maxDepth },
      ],
      stackFrames: cloneFrames(stack),
      maxDepth,
      isFinal: false,
    });

    stack[topIdx] = {
      ...stack[topIdx],
      status: 'waiting',
      pendingExpression: `Waiting: ${k} × factorial(${k - 1})`,
    };
    const nextFrame: StackFrame = {
      id: `fact-${k - 1}`,
      label: `factorial(${k - 1})`,
      depth: stack.length + 1,
      status: 'active',
      params: { n: k - 1 },
      pendingExpression: k - 1 <= 1 ? 'Check n ≤ 1' : `${k - 1} × factorial(${k - 2})`,
    };
    stack.push(nextFrame);

    steps.push({
      index: steps.length,
      activeLine: 3,
      phase: 'call',
      phaseLabel: `Push factorial(${k - 1})`,
      explanation: `Pause factorial(${k}) waiting for factorial(${k - 1}), and push factorial(${k - 1}) onto the stack (depth ${stack.length}).`,
      variables: [
        { name: 'current n', value: k - 1, highlight: true },
        { name: 'stack depth', value: stack.length },
        { name: 'max depth', value: maxDepth },
      ],
      stackFrames: cloneFrames(stack),
      maxDepth,
      isFinal: false,
    });
  }

  // Base case reached at baseTarget (0 or 1)
  const baseIdx = stack.length - 1;
  stack[baseIdx] = {
    ...stack[baseIdx],
    status: 'base',
    pendingExpression: `${baseTarget} ≤ 1 is True`,
    returnValue: 1,
  };

  steps.push({
    index: steps.length,
    activeLine: 2,
    phase: 'base',
    phaseLabel: `Base Case Reached (n = ${baseTarget})`,
    explanation: `Base case hit in factorial(${baseTarget}): ${baseTarget} ≤ 1 is true! Returns 1 without further recursive calls.`,
    variables: [
      { name: 'current n', value: baseTarget, highlight: true },
      { name: 'return value', value: 1, highlight: true },
      { name: 'stack depth', value: stack.length },
    ],
    stackFrames: cloneFrames(stack),
    maxDepth,
    isFinal: false,
  });

  // Unwinding phase
  let runningProduct = 1;
  if (n > 1) {
    for (let k = 2; k <= n; k++) {
      // Pop the resolved child frame
      stack.pop();
      const subResult = runningProduct;
      runningProduct = k * subResult;
      const callerIdx = stack.length - 1;
      stack[callerIdx] = {
        ...stack[callerIdx],
        status: 'returning',
        pendingExpression: `${k} × ${subResult.toLocaleString()} = ${runningProduct.toLocaleString()}`,
        returnValue: runningProduct,
      };

      steps.push({
        index: steps.length,
        activeLine: 4,
        phase: 'unwind',
        phaseLabel: `Unwind factorial(${k})`,
        explanation: `factorial(${k - 1}) returned ${subResult.toLocaleString()}. Frame factorial(${k}) computes ${k} × ${subResult.toLocaleString()} = ${runningProduct.toLocaleString()} and returns it.`,
        variables: [
          { name: 'current n', value: k },
          { name: 'returned sub', value: subResult },
          { name: 'product', value: runningProduct, highlight: true },
          { name: 'stack depth', value: stack.length },
        ],
        multiplicationOp: { left: k, right: subResult, result: runningProduct },
        stackFrames: cloneFrames(stack),
        maxDepth,
        isFinal: false,
      });
    }
  }

  // Final step: returned to main
  steps.push({
    index: steps.length,
    activeLine: 5,
    phase: 'complete',
    phaseLabel: 'Execution Complete',
    explanation: `factorial(${n}) finishes unwinding and returns ${runningProduct.toLocaleString()} to main(). Stack is now empty.`,
    variables: [
      { name: 'input n', value: n },
      { name: 'result', value: runningProduct, highlight: true },
      { name: 'stack depth', value: 0 },
    ],
    stackFrames: [],
    maxDepth,
    stepOutputText: `${n}! = ${runningProduct.toLocaleString()}`,
    isFinal: true,
  });

  return { steps, finalValue: runningProduct };
}

function generateFibonacciIterativeSteps(terms: number): {
  steps: ExecutionStep[];
  sequence: number[];
} {
  const steps: ExecutionStep[] = [];
  let a = 0;
  let b = 1;
  const sequence: number[] = [];

  steps.push({
    index: 0,
    activeLine: 1,
    phase: 'init',
    phaseLabel: 'Input Validated',
    explanation: `Validated input: generate ${terms} Fibonacci ${terms === 1 ? 'term' : 'terms'}.`,
    variables: [
      { name: 'n (terms)', value: terms, highlight: true },
      { name: 'a', value: '—' },
      { name: 'b', value: '—' },
      { name: 'next', value: '—' },
    ],
    sequenceOutput: [],
    loopProgress: {
      current: 0,
      total: terms,
      conditionText: `Loop planned: term = 1 .. ${terms}`,
      conditionMet: null,
    },
    isFinal: false,
  });

  steps.push({
    index: steps.length,
    activeLine: 2,
    phase: 'init',
    phaseLabel: 'Initialize Window',
    explanation: 'Initialize the sliding window with the first two Fibonacci seeds: a = 0 and b = 1.',
    variables: [
      { name: 'n (terms)', value: terms },
      { name: 'a', value: 0, highlight: true },
      { name: 'b', value: 1, highlight: true },
      { name: 'next', value: '—' },
    ],
    sequenceOutput: [],
    loopProgress: {
      current: 0,
      total: terms,
      conditionText: `Ready to check term = 1 ≤ ${terms}`,
      conditionMet: null,
    },
    isFinal: false,
  });

  for (let term = 1; term <= terms; term++) {
    steps.push({
      index: steps.length,
      activeLine: 3,
      phase: 'loop',
      phaseLabel: `Loop Check (Term ${term})`,
      explanation: `Check loop condition: term (${term}) ≤ n (${terms}) is true. Generating term ${term}.`,
      variables: [
        { name: 'term', value: term, highlight: true },
        { name: 'a', value: a },
        { name: 'b', value: b },
        { name: 'next', value: '—' },
      ],
      sequenceOutput: [...sequence],
      loopProgress: {
        current: term,
        total: terms,
        conditionText: `${term} ≤ ${terms} (True)`,
        conditionMet: true,
      },
      isFinal: false,
    });

    sequence.push(a);

    steps.push({
      index: steps.length,
      activeLine: 4,
      phase: 'output',
      phaseLabel: `Output Term ${term}`,
      explanation: `Emit current value a = ${a} as term #${term} (F${term - 1}).`,
      variables: [
        { name: 'term', value: term },
        { name: 'a (emitted)', value: a, highlight: true },
        { name: 'b', value: b },
        { name: 'next', value: '—' },
      ],
      sequenceOutput: [...sequence],
      loopProgress: {
        current: term,
        total: terms,
        conditionText: `Emitted ${a} as term ${term}`,
        conditionMet: true,
      },
      stepOutputText: `Emitted ${a}`,
      isFinal: false,
    });

    const prevA = a;
    const prevB = b;
    const nextVal = prevA + prevB;
    a = prevB;
    b = nextVal;

    steps.push({
      index: steps.length,
      activeLine: 5,
      phase: 'compute',
      phaseLabel: 'Compute & Shift Window',
      explanation: `Compute next = ${prevA} + ${prevB} = ${nextVal}, then shift window: a ← ${prevB} and b ← ${nextVal}.`,
      variables: [
        { name: 'term', value: term },
        { name: 'a', value: a, highlight: true },
        { name: 'b', value: b, highlight: true },
        { name: 'next', value: nextVal, highlight: true },
      ],
      shiftOp: {
        prevA,
        prevB,
        nextVal,
        newA: a,
        newB: b,
      },
      sequenceOutput: [...sequence],
      loopProgress: {
        current: term,
        total: terms,
        conditionText: `Shifted window to (${a}, ${b})`,
        conditionMet: true,
      },
      isFinal: false,
    });
  }

  steps.push({
    index: steps.length,
    activeLine: 3,
    phase: 'loop',
    phaseLabel: 'Loop Exit Check',
    explanation: `Check loop condition: term (${terms + 1}) ≤ n (${terms}) is false. All ${terms} terms generated; exit loop.`,
    variables: [
      { name: 'term', value: terms + 1, highlight: true },
      { name: 'a', value: a },
      { name: 'b', value: b },
      { name: 'terms count', value: sequence.length },
    ],
    sequenceOutput: [...sequence],
    loopProgress: {
      current: terms,
      total: terms,
      conditionText: `${terms + 1} ≤ ${terms} (False — Exit Loop)`,
      conditionMet: false,
    },
    isFinal: false,
  });

  steps.push({
    index: steps.length,
    activeLine: 6,
    phase: 'complete',
    phaseLabel: 'Execution Complete',
    explanation: `Finished iterative Fibonacci for ${terms} ${terms === 1 ? 'term' : 'terms'}: [${sequence.join(', ')}].`,
    variables: [
      { name: 'terms', value: terms },
      { name: 'last term', value: sequence[sequence.length - 1], highlight: true },
    ],
    sequenceOutput: [...sequence],
    loopProgress: {
      current: terms,
      total: terms,
      conditionText: 'Completed',
      conditionMet: false,
    },
    stepOutputText: sequence.join(', '),
    isFinal: true,
  });

  return { steps, sequence };
}

function generateFibonacciTailRecursiveSteps(terms: number): {
  steps: ExecutionStep[];
  sequence: number[];
} {
  const steps: ExecutionStep[] = [];
  const sequence: number[] = [];
  const maxDepth = terms + 1;
  const stack: StackFrame[] = [];

  const cloneFrames = (frames: StackFrame[]): StackFrame[] =>
    frames.map((f) => ({ ...f, params: { ...f.params } }));

  let rem = terms;
  let a = 0;
  let b = 1;

  stack.push({
    id: `fib-0`,
    label: `fibonacci(${rem}, ${a}, ${b})`,
    depth: 1,
    status: 'active',
    params: { remaining: rem, a, b },
    pendingExpression: 'Check remaining == 0',
  });

  steps.push({
    index: 0,
    activeLine: 1,
    phase: 'call',
    phaseLabel: `Start fibonacci(${rem}, ${a}, ${b})`,
    explanation: `main() calls tail-recursive helper fibonacci(remaining=${rem}, a=${a}, b=${b}).`,
    variables: [
      { name: 'remaining', value: rem, highlight: true },
      { name: 'a', value: a, highlight: true },
      { name: 'b', value: b, highlight: true },
      { name: 'depth', value: 1 },
    ],
    stackFrames: cloneFrames(stack),
    maxDepth,
    sequenceOutput: [],
    isFinal: false,
  });

  for (let callIdx = 1; callIdx <= terms; callIdx++) {
    const topIdx = stack.length - 1;
    stack[topIdx] = {
      ...stack[topIdx],
      status: 'active',
      pendingExpression: `${rem} == 0 is False → continue`,
    };

    steps.push({
      index: steps.length,
      activeLine: 2,
      phase: 'call',
      phaseLabel: `Check Base Case (rem = ${rem})`,
      explanation: `Check remaining == 0: ${rem} == 0 is false, so emit a and recurse.`,
      variables: [
        { name: 'remaining', value: rem, highlight: true },
        { name: 'a', value: a },
        { name: 'b', value: b },
        { name: 'depth', value: stack.length },
      ],
      stackFrames: cloneFrames(stack),
      maxDepth,
      sequenceOutput: [...sequence],
      isFinal: false,
    });

    sequence.push(a);
    stack[topIdx] = {
      ...stack[topIdx],
      status: 'active',
      pendingExpression: `Output a = ${a}`,
    };

    steps.push({
      index: steps.length,
      activeLine: 3,
      phase: 'output',
      phaseLabel: `Output a = ${a}`,
      explanation: `Output parameter a = ${a} (term #${callIdx} of ${terms}).`,
      variables: [
        { name: 'remaining', value: rem },
        { name: 'a (emitted)', value: a, highlight: true },
        { name: 'b', value: b },
        { name: 'depth', value: stack.length },
      ],
      stackFrames: cloneFrames(stack),
      maxDepth,
      sequenceOutput: [...sequence],
      stepOutputText: `Emitted ${a}`,
      isFinal: false,
    });

    const nextRem = rem - 1;
    const nextA = b;
    const nextB = a + b;

    stack[topIdx] = {
      ...stack[topIdx],
      status: 'waiting',
      pendingExpression: `Tail-called fibonacci(${nextRem}, ${nextA}, ${nextB})`,
    };

    stack.push({
      id: `fib-${callIdx}`,
      label: `fibonacci(${nextRem}, ${nextA}, ${nextB})`,
      depth: stack.length + 1,
      status: 'active',
      params: { remaining: nextRem, a: nextA, b: nextB },
      pendingExpression: 'Check remaining == 0',
    });

    steps.push({
      index: steps.length,
      activeLine: 4,
      phase: 'call',
      phaseLabel: `Tail Call (${nextRem}, ${nextA}, ${nextB})`,
      explanation: `Invoke fibonacci(remaining - 1 = ${nextRem}, b = ${nextA}, a + b = ${nextB}). Notice no branching—only one linear next call.`,
      variables: [
        { name: 'remaining', value: nextRem, highlight: true },
        { name: 'a', value: nextA, highlight: true },
        { name: 'b', value: nextB, highlight: true },
        { name: 'depth', value: stack.length },
      ],
      tailTransition: {
        fromRem: rem,
        fromA: a,
        fromB: b,
        toRem: nextRem,
        toA: nextA,
        toB: nextB,
      },
      stackFrames: cloneFrames(stack),
      maxDepth,
      sequenceOutput: [...sequence],
      isFinal: false,
    });

    rem = nextRem;
    a = nextA;
    b = nextB;
  }

  // Base case when remaining == 0
  const baseIdx = stack.length - 1;
  stack[baseIdx] = {
    ...stack[baseIdx],
    status: 'base',
    pendingExpression: '0 == 0 is True → return',
    returnValue: 'void',
  };

  steps.push({
    index: steps.length,
    activeLine: 2,
    phase: 'base',
    phaseLabel: 'Base Case Reached (remaining = 0)',
    explanation: `Base case reached: remaining == 0 is true! Return immediately without outputting a (${a}) or making further calls.`,
    variables: [
      { name: 'remaining', value: 0, highlight: true },
      { name: 'a (unused)', value: a },
      { name: 'b (unused)', value: b },
      { name: 'depth', value: stack.length },
    ],
    stackFrames: cloneFrames(stack),
    maxDepth,
    sequenceOutput: [...sequence],
    isFinal: false,
  });

  // Final completion
  steps.push({
    index: steps.length,
    activeLine: 5,
    phase: 'complete',
    phaseLabel: 'Execution Complete',
    explanation: `All ${stack.length} frames return cleanly to main(). Final ${terms}-term Fibonacci series: [${sequence.join(', ')}].`,
    variables: [
      { name: 'terms', value: terms },
      { name: 'last term', value: sequence[sequence.length - 1], highlight: true },
      { name: 'stack depth', value: 0 },
    ],
    stackFrames: [],
    maxDepth,
    sequenceOutput: [...sequence],
    stepOutputText: sequence.join(', '),
    isFinal: true,
  });

  return { steps, sequence };
}

export function buildSimulationRun(
  runId: number,
  algorithm: AlgorithmType,
  approach: ApproachType,
  inputValue: number
): SimulationRun {
  const definition = getAlgorithmDefinition(algorithm, approach);

  if (algorithm === 'factorial') {
    const { steps, finalValue } =
      approach === 'iterative'
        ? generateFactorialIterativeSteps(inputValue)
        : generateFactorialRecursiveSteps(inputValue);

    return {
      runId,
      algorithm,
      approach,
      inputValue,
      steps,
      finalResultDisplay: `${inputValue}! = ${finalValue.toLocaleString()}`,
      finalSummaryLabel: `Computed ${inputValue}! using ${approach} execution`,
      definition,
    };
  }

  const { steps, sequence } =
    approach === 'iterative'
      ? generateFibonacciIterativeSteps(inputValue)
      : generateFibonacciTailRecursiveSteps(inputValue);

  return {
    runId,
    algorithm,
    approach,
    inputValue,
    steps,
    finalResultDisplay: sequence.join('  '),
    finalSummaryLabel: `Generated ${inputValue} ${inputValue === 1 ? 'term' : 'terms'} using ${approach === 'recursive' ? 'tail-recursive' : 'iterative'} execution`,
    definition,
  };
}
