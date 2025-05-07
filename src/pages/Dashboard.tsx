import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import CodeEditor from '@/components/CodeEditor';
import ProblemDescription from '@/components/ProblemDescription';
import AIAssistant from '@/components/AIAssistant';
import ProblemSelector from '@/components/ProblemSelector';
import { AIAssistantProvider } from '@/contexts/AIAssistantContext';
import { Problem } from '@/data/dsaProblems';
import { fetchProblems, fetchProblemById } from '@/services/problemService';
import { Button } from '@/components/ui/button';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useToast } from '@/components/ui/use-toast';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblemId, setSelectedProblemId] = useState<string>('');
  const [problem, setProblem] = useState<Problem | null>(null);
  const [testResults, setTestResults] = useState(null);
  const [showResultsPanel, setShowResultsPanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const codeEditorRef = useRef<any>(null);
  const { toast } = useToast();
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
    if (user && user._id) {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          setTabSwitchCount((prev) => prev + 1);
          setIsVisible(false);
          toast({
            title: "Tab Switch Detected",
            description: "Please stay focused on the current tab.",
            variant: "destructive",
          });
          // Send request to backend to increment tabSwitches
          if (user && user._id && user.token) {
            fetch(`http://localhost:5000/api/users/${user._id}/tab-switch`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
              }
            });
          }
        } else {
          setIsVisible(true);
        }
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }
  }, [user, navigate, toast]);

  // On mount, set selectedProblemId from query string if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const problemId = params.get('problemId');
    if (problemId) {
      setSelectedProblemId(problemId);
    }
  }, [location.search]);

  // Fetch problems on load
  useEffect(() => {
    const loadProblems = async () => {
      try {
        const fetchedProblems = await fetchProblems();
        setProblems(fetchedProblems);
        
        // Get problemId from URL
        const params = new URLSearchParams(location.search);
        const problemId = params.get('problemId');
        
        if (problemId && fetchedProblems.some(p => p.id === problemId)) {
          // If problemId exists in URL and is valid, use it
          setSelectedProblemId(problemId);
          const selectedProblem = fetchedProblems.find(p => p.id === problemId);
          if (selectedProblem) {
            setProblem(selectedProblem);
          }
        } else if (fetchedProblems.length > 0) {
          // Otherwise, use the first problem and update URL
          const firstProblemId = fetchedProblems[0].id;
          setSelectedProblemId(firstProblemId);
          setProblem(fetchedProblems[0]);
          navigate(`/dashboard?problemId=${firstProblemId}`, { replace: true });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading problems:', error);
        setLoading(false);
      }
    };
    
    loadProblems();
  }, [location.search, navigate]);

  // Load problem when selected problem changes
  useEffect(() => {
    const loadProblem = async () => {
      if (!selectedProblemId) return;
      
      try {
        const selectedProblem = await fetchProblemById(selectedProblemId);
        setProblem(selectedProblem);
        setShowResultsPanel(false);
        setTestResults(null);
      } catch (error) {
        console.error('Error loading problem:', error);
      }
    };
    
    loadProblem();
  }, [selectedProblemId]);

  // When the problem changes, update the code in the editor to match the starterCode
  useEffect(() => {
    if (problem && codeEditorRef.current) {
      codeEditorRef.current.setCode(problem.starterCode || '');
    }
  }, [problem]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleResultsChange = (results: any) => {
    setTestResults(results);
    setShowResultsPanel(true);
  };

  const handleResetToDescription = () => {
    setShowResultsPanel(false);
    setTestResults(null);
  };

  if (!user) {
    return null;
  }

  if (loading || !problem) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-lg font-medium">Loading problems...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      <header className="border-b p-4 flex-none">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Prompt Wars</h1>
            <ProblemSelector 
              onSelectProblem={setSelectedProblemId} 
              currentProblemId={selectedProblemId}
              problems={problems}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Welcome, {user.name}</span>
            <Button variant="outline" size="sm" onClick={() => navigate('/questions')}>Back</Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto p-4 min-h-0">
        <PanelGroup direction="horizontal" className="h-full">
          <Panel defaultSize={40} minSize={30}>
            <div className="h-full overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto">
                {showResultsPanel && testResults ? (
                  <div className="h-full flex flex-col">
                    <div className="flex justify-between items-center p-4 border-b bg-secondary">
                      <span className="font-semibold text-lg">
                        {testResults.type === 'sample' ? 'Sample Test Results' : 'Submission Results'}
                      </span>
                      <Button size="sm" variant="outline" onClick={handleResetToDescription}>
                        Back to Description
                      </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                      <div className="text-sm">
                        <div className="font-medium mb-2">
                          {testResults.passedTests} / {testResults.totalTests} tests passed {testResults.type === 'sample' ? '(Sample Tests)' : '(Hidden Tests)'}
                        </div>
                        {testResults.results.map((result: any, index: number) => (
                          <div key={index} className="mb-2 border rounded-md">
                            <div className={`flex items-center gap-2 p-2 ${result.passed ? 'bg-green-50' : 'bg-red-50'}`}> 
                              {result.passed ? (
                                <span className="text-green-600 font-bold">✔</span>
                              ) : (
                                <span className="text-red-600 font-bold">✘</span>
                              )}
                              <span className="font-medium">Test Case {index + 1}:</span>
                              {result.passed ? 'Passed' : 'Failed'}
                            </div>
                            {testResults.type === 'sample' && (
                              <div className="p-2">
                                <div className="text-sm text-gray-600">Input:</div>
                                <pre className="mt-1 text-xs bg-gray-50 p-2 rounded">{JSON.stringify(result.input, null, 2)}</pre>
                                <div className="text-sm text-gray-600 mt-2">Expected:</div>
                                <pre className="mt-1 text-xs bg-gray-50 p-2 rounded">{JSON.stringify(result.expected, null, 2)}</pre>
                                <div className="text-sm text-gray-600 mt-2">Got:</div>
                                <pre className="mt-1 text-xs bg-gray-50 p-2 rounded">{JSON.stringify(result.got, null, 2)}</pre>
                              </div>
                            )}
                            {testResults.type !== 'sample' && !result.passed && result.error && (
                              <div className="p-2">
                                <div className="text-red-500">Error: {result.error}</div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <ProblemDescription problem={problem} />
                )}
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-2 bg-gray-100 hover:bg-gray-200 transition-colors">
            <div className="w-full h-full flex items-center justify-center">
              <div className="h-8 w-1 bg-gray-300 rounded-full" />
            </div>
          </PanelResizeHandle>
          
          <Panel defaultSize={60} minSize={40}>
            <PanelGroup direction="vertical" className="h-full">
              <Panel defaultSize={60} minSize={30}>
                <div className="h-full overflow-hidden">
                  <CodeEditor 
                    ref={codeEditorRef}
                    problem={problem} 
                    onResultsChange={handleResultsChange}
                    onResetToDescription={handleResetToDescription}
                  />
                </div>
              </Panel>

              <PanelResizeHandle className="h-2 bg-gray-100 hover:bg-gray-200 transition-colors">
                <div className="h-full flex items-center justify-center">
                  <div className="w-8 h-1 bg-gray-300 rounded-full" />
                </div>
              </PanelResizeHandle>
              
              <Panel defaultSize={40} minSize={20}>
                <div className="h-full overflow-hidden">
                  <AIAssistantProvider userId={user._id} problemId={selectedProblemId} starterCode={problem.starterCode}>
                    <AIAssistant />
                  </AIAssistantProvider>
                </div>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </main>
    </div>
  );
};

export default Dashboard;
