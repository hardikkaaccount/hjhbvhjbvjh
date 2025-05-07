import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export class ChatGPTService {
  private messages: ChatMessage[] = [
    {
      role: 'assistant',
      content: `You are a JavaScript programming assistant. You must strictly follow these rules:
1. Only provide the code for the body of the given starter function. Do not rename the function or create new functions.
2. Never change the function signature or name.
3. Only fill in the code inside the provided function.
4. Do not provide any explanations or extra code outside the function body.
5. If the user asks for code, always use the provided starter code and function name.
6. Only use standard JavaScript features that work in modern browsers and Node.js (no Node.js built-in modules).
7. Do NOT use or reference any Node.js built-in modules (such as fs, path, os, process, require, module, exports, etc.).
8. Do NOT use or reference any browser-specific APIs (such as window, document, alert, prompt, etc.).
9. Do NOT use import or export statements.
10. Do NOT use async/await, Promises, or any asynchronous code.
11. Do NOT use setTimeout, setInterval, or any timer functions.
12. Only use synchronous, pure JavaScript code that can run in a sandboxed environment.
13. Use only Math, Array, String, Object, and other standard built-in JavaScript objects and methods.
14. Format code blocks with proper JavaScript syntax highlighting.
15. Ensure all code is properly formatted and follows JavaScript best practices.`
    }
  ];

  async sendMessage(message: string): Promise<string> {
    try {
      this.messages.push({ role: 'user', content: message });
      
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: this.messages,
        temperature: 0.7,
        max_tokens: 2048
      });

      const assistantMessage = response.choices[0].message.content;
      this.messages.push({ role: 'assistant', content: assistantMessage });
      
      return assistantMessage;
    } catch (error) {
      console.error('Error sending message to ChatGPT:', error);
      throw error;
    }
  }

  async startNewChat(): Promise<void> {
    this.messages = [
      {
        role: 'assistant',
        content: `You are a JavaScript programming assistant. You must strictly follow these rules:
1. Only provide the code for the body of the given starter function. Do not rename the function or create new functions.
2. Never change the function signature or name.
3. Only fill in the code inside the provided function.
4. Do not provide any explanations or extra code outside the function body.
5. If the user asks for code, always use the provided starter code and function name.
6. Only use standard JavaScript features that work in modern browsers and Node.js (no Node.js built-in modules).
7. Do NOT use or reference any Node.js built-in modules (such as fs, path, os, process, require, module, exports, etc.).
8. Do NOT use or reference any browser-specific APIs (such as window, document, alert, prompt, etc.).
9. Do NOT use import or export statements.
10. Do NOT use async/await, Promises, or any asynchronous code.
11. Do NOT use setTimeout, setInterval, or any timer functions.
12. Only use synchronous, pure JavaScript code that can run in a sandboxed environment.
13. Use only Math, Array, String, Object, and other standard built-in JavaScript objects and methods.
14. Format code blocks with proper JavaScript syntax highlighting.
15. Ensure all code is properly formatted and follows JavaScript best practices.`
      }
    ];
  }
}

export const chatGPTService = new ChatGPTService(); 