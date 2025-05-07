import { Editor } from '@monaco-editor/react';
import { useState, forwardRef, useImperativeHandle } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { evaluateCode, getFunctionNameFromCode, saveSubmission } from '@/services/codeEvaluator';
import { Problem } from '@/data/dsaProblems';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchProblemById } from '@/services/problemService';

interface CodeEditorProps {
  problem: Problem;
  onResultsChange: (results: any) => void;
  onResetToDescription: () => void;
}

export interface CodeEditorRef {
  setCode: (code: string) => void;
}

const languageTemplates: Record<Language, string> = {
  javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Write your code here
};`
};

const CodeEditor = forwardRef<CodeEditorRef, CodeEditorProps>(({ problem, onResultsChange, onResetToDescription }, ref) => {
  const [code, setCode] = useState(problem.starterCode || languageTemplates.javascript);
  const [language] = useState<Language>('javascript');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useImperativeHandle(ref, () => ({
    setCode: (newCode: string) => setCode(newCode)
  }));

  const handleEditorChange = (value: string | undefined) => {
    if (value) {
      setCode(value);
      onResetToDescription();
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const functionName = getFunctionNameFromCode(code);
      if (!functionName) {
        toast({
          title: "Function not found",
          description: "Could not identify the function to test",
          variant: "destructive"
        });
        return;
      }

      const testResults = await evaluateCode(code, functionName, problem.sampleTests, language);
      setResults({
        type: 'sample',
        ...testResults
      });
      onResultsChange(testResults);

      toast({
        title: `${testResults.passedTests} of ${testResults.totalTests} tests passed`,
        description: testResults.passedTests === testResults.totalTests ? 
          "All sample tests passed! Try submitting your solution." : 
          "Some tests failed. Review your code and try again.",
        variant: testResults.passedTests === testResults.totalTests ? "default" : "destructive"
      });
    } catch (error) {
      console.error("Error running code:", error);
      toast({
        title: "Error running code",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const functionName = getFunctionNameFromCode(code);
      if (!functionName) {
        toast({
          title: "Function not found",
          description: "Could not identify the function to test",
          variant: "destructive"
        });
        return;
      }

      // Always fetch the latest problem by ID to get up-to-date hiddenTests
      const latestProblem = await fetchProblemById(problem.id);
      const testCases = Array.isArray(latestProblem.hiddenTests) ? latestProblem.hiddenTests : [];
      const testResults = await evaluateCode(code, functionName, testCases, language);
      setResults({
        type: 'hidden',
        ...testResults
      });
      onResultsChange(testResults);

      if (user) {
        await saveSubmission(
          user._id,
          problem.id, 
          code, 
          { 
            passedTests: testResults.passedTests, 
            totalTests: testResults.totalTests
          },
          user.token
        );
      }

      toast({
        title: `${testResults.passedTests} of ${testResults.totalTests} tests passed`,
        description: testResults.passedTests === testResults.totalTests ? 
          "Great job! All hidden tests passed!" : 
          "Some tests failed. Review your code and try again.",
        variant: testResults.passedTests === testResults.totalTests ? "default" : "destructive"
      });
    } catch (error) {
      console.error("Error submitting code:", error);
      toast({
        title: "Error submitting code",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-0 flex-1 flex flex-col">
        <div className="p-2 border-b flex justify-between items-center bg-secondary">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold">Code Editor</h3>
            <span className="text-xs text-muted-foreground">JavaScript</span>
          </div>
          <div className="flex gap-1">
            <Button
              onClick={handleRun}
              disabled={isRunning || isSubmitting}
              variant="secondary"
              size="sm"
            >
              {isRunning ? "Running..." : "Run"}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isRunning || isSubmitting}
              size="sm"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
        
        <div className="flex-1 min-h-[300px]">
          <Editor
            height="100%"
            defaultLanguage={language}
            language={language}
            value={code}
            onChange={handleEditorChange}
            theme="light"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
              tabSize: language === 'python' ? 4 : 2,
            }}
          />
        </div>
        
        {/* Remove results rendering here, as it is now handled in Dashboard */}
      </CardContent>
    </Card>
  );
});

CodeEditor.displayName = 'CodeEditor';

export default CodeEditor;
