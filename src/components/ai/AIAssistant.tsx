'use client';

import { useState } from 'react';
import { geminiModel } from '@/lib/gemini';
import { MessageCircle, Loader2 } from 'lucide-react';

interface AIAssistantProps {
  onSuggestion: (suggestion: string) => void;
}

export const AIAssistant = ({ onSuggestion }: AIAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');

  const generateSuggestion = async () => {
    try {
      setLoading(true);
      const result = await geminiModel.generateContent(input);
      const response = await result.response;
      const text = response.text();
      if (onSuggestion) {
        onSuggestion(text);
      }
    } catch (error) {
      console.error('Error generating suggestion:', error);
    } finally {
      setLoading(false);
      setInput('');
      setIsOpen(false);
    }
  };

  return (
    <div className="dropdown dropdown-top dropdown-end fixed bottom-4 left-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-circle btn-primary"
      >
        <MessageCircle size={20} />
      </button>

      {isOpen && (
        <div className="card w-80 bg-base-200 shadow-xl dropdown-content">
          <div className="card-body">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="textarea textarea-bordered h-32 w-full"
              placeholder="Ask me anything..."
            />
            <div className="card-actions justify-end">
              <button
                onClick={generateSuggestion}
                disabled={loading || !input}
                className="btn btn-primary w-full"
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Generating...
                  </>
                ) : (
                  'Get Suggestion'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 