import React from 'react';
import { ChatInterface } from '../components/ChatInterface';

export const ChatPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">ChatGPT Assistant</h1>
        <ChatInterface />
      </div>
    </div>
  );
}; 