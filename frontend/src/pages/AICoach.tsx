import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { Send, Brain, Bot, User, Trash2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export const AICoach: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hello! Main InterviewHub AI Experience Bot hoon. Main database me stored actual experiences aur questions ko analyze karke batata hoon kis company me kya pucha jata hai.\n\nAap mujhse kisi bhi company ke interview rounds aur important topics ke baare me pooch sakte hain.\n\n*Jaise ki: **Amazon**, **Google**, **YuppTV**, ya **Meta**!*",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    "Amazon me DSA round me kya puchte hain?",
    "Google interview ke liye important topics?",
    "Tell me about YuppTV interview rounds.",
    "Meta software engineering prep tips"
  ];

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/ai/chat', { message: textToSend });
      const botMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'bot',
        text: response.data.response || "Sorry, I couldn't process that query.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'bot',
        text: "Error connecting to AI Server. Please try again later.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: "Hello! Main InterviewHub AI Experience Bot hoon. Main database me stored actual experiences aur questions ko analyze karke batata hoon kis company me kya pucha jata hai.\n\nAap mujhse kisi bhi company ke interview rounds aur important topics ke baare me pooch sakte hain.\n\n*Jaise ki: **Amazon**, **Google**, **YuppTV**, ya **Meta**!*",
        timestamp: new Date()
      }
    ]);
  };

  // Custom resilient markdown compiler for bolding, headers, and bullet lists
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, lineIdx) => {
      let currentLine = line;

      // Handle Headers
      if (currentLine.startsWith('### ')) {
        return <h4 key={lineIdx} className="text-sm font-bold text-indigo-300 mt-2 mb-1 uppercase tracking-wider">{currentLine.substring(4)}</h4>;
      }
      if (currentLine.startsWith('## ') || currentLine.startsWith('# ')) {
        const textStr = currentLine.startsWith('## ') ? currentLine.substring(3) : currentLine.substring(2);
        return <h3 key={lineIdx} className="text-base font-bold text-indigo-400 mt-3 mb-1">{textStr}</h3>;
      }

      // Handle Bullet Lists
      if (currentLine.trim().startsWith('- ') || currentLine.trim().startsWith('* ')) {
        const listText = currentLine.trim().substring(2);
        // Process bolding within bullet point
        const parts = listText.split('**');
        const formattedListText = parts.map((part, partIdx) => 
          partIdx % 2 === 1 ? <strong key={partIdx} className="font-bold text-white">{part}</strong> : part
        );
        return (
          <li key={lineIdx} className="ml-5 list-disc text-slate-300 text-sm my-0.5">
            {formattedListText}
          </li>
        );
      }

      // Process Bolding **text** and Italics *text* on regular line
      const boldParts = currentLine.split('**');
      const formattedLine = boldParts.map((boldPart, boldIdx) => {
        if (boldIdx % 2 === 1) {
          return <strong key={boldIdx} className="font-bold text-white">{boldPart}</strong>;
        }
        
        // Process Italics *text* inside non-bold parts
        const italicParts = boldPart.split('*');
        return italicParts.map((italicPart, italicIdx) => 
          italicIdx % 2 === 1 ? <em key={italicIdx} className="italic text-slate-200">{italicPart}</em> : italicPart
        );
      });

      return <p key={lineIdx} className="text-slate-300 text-sm leading-relaxed my-1 min-h-[1rem]">{formattedLine}</p>;
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Header Bar */}
      <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/20">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-white">AI Experience Chatbot</h2>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected to Portal Database Analytics
            </p>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/50 rounded-lg transition"
          title="Clear Chat History"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Stream Container */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-900/50">
        {messages.map(msg => (
          <div 
            key={msg.id} 
            className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              msg.sender === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-800 border border-slate-700 text-indigo-400'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Chat bubble body */}
            <div className={`rounded-xl px-4 py-3 border text-sm ${
              msg.sender === 'user'
                ? 'bg-blue-600/10 border-blue-500/30 text-slate-100 shadow-sm'
                : 'bg-slate-950/40 border-slate-800 text-slate-200 shadow-sm'
            }`}>
              <div className="space-y-1">
                {renderFormattedText(msg.text)}
              </div>
              <span className="text-[10px] text-slate-500 mt-2 block text-right">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {/* Loading placeholder */}
        {loading && (
          <div className="flex gap-3 max-w-[80%]">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-indigo-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="rounded-xl px-4 py-3 bg-slate-950/40 border border-slate-800 text-slate-400 flex items-center gap-2 text-sm">
              <span className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              AI database stats analyze kar raha hai...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested chips & Input area */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-4">
        {/* Suggestion Chips */}
        {messages.length === 1 && (
          <div className="space-y-1.5">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Suggested Questions</p>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs transition duration-150 text-left font-medium"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Text Area Form */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="flex gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Ask about placement rounds (e.g., 'Amazon me kya puchte hain?')..."
            className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 text-slate-100 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl flex items-center justify-center transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
