import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { ProblemList } from './ProblemList';
import { CodeEditor, CodeEditorRef } from './CodeEditor';
import { Problem } from '@/data/dsaProblems';
import { useToast } from "@/components/ui/use-toast";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [results, setResults] = useState<any>(null);
  const codeEditorRef = useRef<CodeEditorRef>(null);

  const handleProblemSelect = (problem: Problem) => {
    setSelectedProblem(problem);
    setResults(null);
    if (codeEditorRef.current) {
      codeEditorRef.current.setCode(problem.starterCode);
    }
  };

  const handleResultsChange = (newResults: any) => {
    setResults(newResults);
  };

  const handleResetToDescription = () => {
    setResults(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account",
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Prompt Wars</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user.name}
            </span>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={30} minSize={20}>
            <Card>
              <CardContent className="p-4">
                <h2 className="text-xl font-semibold mb-4">Problems</h2>
                <ProblemList onSelect={handleProblemSelect} />
              </CardContent>
            </Card>
          </Panel>
          
          <PanelResizeHandle className="w-2 bg-border hover:bg-primary/20 transition-colors" />
          
          <Panel defaultSize={70} minSize={30}>
            <div className="space-y-4">
              {selectedProblem ? (
                <>
                  <Card>
                    <CardContent className="p-4">
                      <h2 className="text-xl font-semibold mb-4">{selectedProblem.title}</h2>
                      <div className="prose max-w-none">
                        <p>{selectedProblem.description}</p>
                        <h3 className="text-lg font-semibold mt-4">Input Format</h3>
                        <p>{selectedProblem.inputFormat}</p>
                        <h3 className="text-lg font-semibold mt-4">Output Format</h3>
                        <p>{selectedProblem.outputFormat}</p>
                        <h3 className="text-lg font-semibold mt-4">Constraints</h3>
                        <p>{selectedProblem.constraints}</p>
                        <h3 className="text-lg font-semibold mt-4">Sample Input</h3>
                        <pre className="bg-muted p-2 rounded">
                          {selectedProblem.sampleInput}
                        </pre>
                        <h3 className="text-lg font-semibold mt-4">Sample Output</h3>
                        <pre className="bg-muted p-2 rounded">
                          {selectedProblem.sampleOutput}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>

                  <CodeEditor
                    ref={codeEditorRef}
                    problem={selectedProblem}
                    onResultsChange={handleResultsChange}
                    onResetToDescription={handleResetToDescription}
                  />

                  {results && (
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="text-lg font-semibold mb-4">Results</h3>
                        <div className="space-y-2">
                          <p>
                            Passed: {results.passedTests} / {results.totalTests}
                          </p>
                          {results.testCases && (
                            <div className="space-y-2">
                              {results.testCases.map((testCase: any, index: number) => (
                                <div
                                  key={index}
                                  className={`p-2 rounded ${
                                    testCase.passed ? 'bg-green-100' : 'bg-red-100'
                                  }`}
                                >
                                  <p>Input: {testCase.input}</p>
                                  <p>Expected: {testCase.expected}</p>
                                  <p>Got: {testCase.got}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card>
                  <CardContent className="p-4">
                    <p className="text-center text-muted-foreground">
                      Select a problem to start coding
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </Panel>
        </PanelGroup>
      </main>
    </div>
  );
} 