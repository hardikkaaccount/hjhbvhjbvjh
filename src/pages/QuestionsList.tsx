import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { fetchProblems } from '@/services/problemService';
import { Problem } from '@/data/dsaProblems';

export default function QuestionsList() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProblems = async () => {
      try {
        const fetchedProblems = await fetchProblems();
        setProblems(fetchedProblems);
        setLoading(false);
      } catch (err) {
        setError('Failed to load problems');
        setLoading(false);
        console.error('Error loading problems:', err);
      }
    };

    loadProblems();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Sort problems by difficulty before rendering
  const sortedProblems = [...problems].sort((a, b) => {
    const order = { easy: 0, medium: 1, hard: 2 };
    return order[a.difficulty] - order[b.difficulty];
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading problems...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-red-600">{error}</div>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Prompt Wars</h1>
          <div className="flex items-center gap-4">
            {user && <span className="text-sm text-muted-foreground">Welcome, {user.name}</span>}
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold mb-6">Available Questions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedProblems.map(problem => (
            <Card key={problem.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{problem.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${problem.difficulty === 'easy' ? 'bg-green-100 text-green-700' : problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{problem.difficulty}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">{problem.description}</p>
                <Button className="mt-2 self-end" size="sm" onClick={() => navigate(`/dashboard?problemId=${problem.id}`)}>
                  Solve
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
} 