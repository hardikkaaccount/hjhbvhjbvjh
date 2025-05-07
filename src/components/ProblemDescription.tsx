
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Problem } from "@/data/dsaProblems";
import { Badge } from "@/components/ui/badge";

interface ProblemDescriptionProps {
  problem: Problem;
}

const ProblemDescription = ({ problem }: ProblemDescriptionProps) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="h-full overflow-hidden flex flex-col">
      <CardHeader className="bg-secondary pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>{problem.title}</CardTitle>
          <Badge className={getDifficultyColor(problem.difficulty)}>
            {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto py-4">
        <div className="prose prose-sm max-w-none">
          {problem.description.split('\n').map((paragraph, index) => {
            // Check if paragraph is a header (starts with #)
            if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
              const content = paragraph.replace(/\*\*/g, '');
              return <h3 key={index} className="font-bold mt-4 mb-2">{content}</h3>;
            }
            
            // Check if paragraph is a bullet point
            if (paragraph.startsWith('-')) {
              return (
                <div key={index} className="ml-4 mb-1">
                  <span className="inline-block w-1 h-1 bg-gray-500 rounded-full mr-2"></span>
                  {paragraph.slice(2)}
                </div>
              );
            }
            
            // Regular paragraph with proper spacing
            return paragraph.trim() ? (
              <p key={index} className={index > 0 ? 'mt-4' : undefined}>
                {paragraph}
              </p>
            ) : <br key={index} />;
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProblemDescription;
