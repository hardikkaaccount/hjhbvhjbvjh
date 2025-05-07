import { TestCase } from "@/data/dsaProblems";

interface EvaluationResult {
  passed: boolean;
  output?: string;
  error?: string;
  expected?: string;
  got?: string;
}

interface TestResults {
  totalTests: number;
  passedTests: number;
  results: EvaluationResult[];
}

export async function evaluateCode(
  code: string,
  functionName: string,
  testCases: TestCase[]
): Promise<TestResults> {
  const results: EvaluationResult[] = [];
  let passedTests = 0;

  try {
    // Create a function from the provided code
    const codeFunction = new Function(`
      ${code}
      return ${functionName};
    `)();

    // Run each test case
    for (const testCase of testCases) {
      try {
        // Parse input as [n, powers]
        const [n, powers] = JSON.parse(testCase.input);
        // Call the function with both arguments
        const output = codeFunction(n, powers);
        // Convert output to string for comparison
        let outputStr = String(output);
        // Compare output to expected
        const passed = outputStr === testCase.output;
        if (passed) {
          passedTests++;
        }
        results.push({
          passed,
          output: outputStr,
          expected: testCase.output,
          got: outputStr,
        });
      } catch (error) {
        results.push({
          passed: false,
          error: error instanceof Error ? error.message : String(error),
          expected: testCase.output,
          got: undefined,
        });
      }
    }
  } catch (error) {
    // If code execution fails completely
    return {
      totalTests: testCases.length,
      passedTests: 0,
      results: testCases.map((testCase) => ({
        passed: false,
        error: error instanceof Error ? error.message : String(error),
        expected: testCase.output,
        got: undefined,
      })),
    };
  }

  return {
    totalTests: testCases.length,
    passedTests,
    results,
  };
}

export function getFunctionNameFromCode(code: string): string {
  // Try to match Python: def function_name(
  let match = code.match(/def\s+(\w+)\s*\(/);
  if (match) return match[1];

  // Try to match JavaScript: function functionName( or var functionName = function(
  match = code.match(/function\s+(\w+)\s*\(/);
  if (match) return match[1];
  match = code.match(/var\s+(\w+)\s*=\s*function\s*\(/);
  if (match) return match[1];
  match = code.match(/const\s+(\w+)\s*=\s*function\s*\(/);
  if (match) return match[1];
  match = code.match(/let\s+(\w+)\s*=\s*function\s*\(/);
  if (match) return match[1];
  match = code.match(/(\w+)\s*=\s*\(/); // arrow functions
  if (match) return match[1];

  // Try to match Java: return type functionName(
  match = code.match(/(?:public|private|protected)?\s*[\w\[\]]+\s+(\w+)\s*\(/);
  if (match) return match[1];

  // Try to match C++: return type functionName(
  match = code.match(/(?:[\w\[\]]+\s+)+([a-zA-Z_]\w*)\s*\(/);
  if (match) return match[1];

  return '';
}

export async function saveSubmission(
  userId: string, 
  problemId: string, 
  code: string, 
  result: { passedTests: number, totalTests: number },
  token: string
) {
  try {
    // Send submission to API
    const response = await fetch('http://localhost:5000/api/submissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Use auth token
      },
      body: JSON.stringify({
        problemId,
        code,
        result: {
          passedTests: result.passedTests,
          totalTests: result.totalTests,
        }
      })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return true;
  } catch (error) {
    console.error('Error saving submission:', error);
    return false;
  }
}
