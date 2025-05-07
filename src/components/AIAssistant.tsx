import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAIAssistant } from '@/contexts/AIAssistantContext';
import { Panel, PanelGroup } from "react-resizable-panels";
import { Badge } from "@/components/ui/badge";
import { AIAssistantProvider } from '@/contexts/AIAssistantContext';

const AIAssistant = () => {
  const [prompt, setPrompt] = useState('');
  const { promptHistory, sendPrompt, isLoading, clearHistory, remainingPrompts } = useAIAssistant();

  const handleSendPrompt = async () => {
    if (!prompt.trim()) return;
    
    await sendPrompt(prompt);
    setPrompt('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt();
    }
  };

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('```')) {
        return null;
      }
      return <p key={i} className="mb-1">{line}</p>;
    });
  };

  const renderMessage = (message: { role: string; content: string }, index: number) => {
    const codeBlockRegex = /```([\s\S]*?)```/g;
    const contentWithoutCode = message.content.replace(codeBlockRegex, '');
    
    const codeBlocks: string[] = [];
    let match;
    while ((match = codeBlockRegex.exec(message.content)) !== null) {
      codeBlocks.push(match[1]);
    }
    
    return (
      <div key={index} className={`p-3 rounded-lg mb-3 ${
        message.role === 'user' 
          ? 'bg-primary text-white ml-6' 
          : 'bg-gray-100 text-gray-800 mr-6'
      }`}>
        <div className="text-sm">
          {formatMessage(contentWithoutCode)}
          {codeBlocks.map((code, i) => (
            <pre key={i} className="bg-code-background p-2 rounded text-xs font-mono my-2 overflow-x-auto">
              <code>{code}</code>
            </pre>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="bg-secondary py-3 px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">AI Assistant</CardTitle>
            <Badge variant={remainingPrompts > 0 ? "default" : "destructive"}>
              {remainingPrompts} questions left
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
        <PanelGroup direction="vertical">
          <Panel defaultSize={80} minSize={70}>
            <div className="flex-1 overflow-y-auto p-4 h-full">
              {promptHistory.map((message, index) => renderMessage(message, index))}
            </div>
          </Panel>
          <Panel defaultSize={20} minSize={15} maxSize={20}>
            <div className="p-0 h-full flex items-center justify-center">
              <form className="w-full flex items-center gap-2 px-1" onSubmit={e => { e.preventDefault(); handleSendPrompt(); }}>
                <Textarea
                  placeholder={remainingPrompts > 0 ? "Ask for help with your code..." : "You've reached the maximum number of questions."}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 text-xs rounded-md border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary bg-white resize-none h-7 leading-4 shadow-none min-w-0"
                  rows={1}
                  disabled={isLoading || remainingPrompts === 0}
                  style={{ height: '28px', minHeight: '28px', maxHeight: '28px', marginBottom: 0 }}
                />
                <Button 
                  onClick={handleSendPrompt} 
                  disabled={!prompt.trim() || isLoading || remainingPrompts === 0}
                  className="h-7 px-2 text-xs ml-1"
                  size="sm"
                  type="submit"
                >
                  {isLoading ? "..." : "Send"}
                </Button>
              </form>
            </div>
          </Panel>
        </PanelGroup>
      </CardContent>
    </Card>
  );
};

export default AIAssistant;
