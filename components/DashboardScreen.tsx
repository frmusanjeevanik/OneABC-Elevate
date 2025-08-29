
import React, { useState, useRef, useEffect } from 'react';
import type { ScreenProps, ChatMessage } from '../types';
import Button from './common/Button';
import Card from './common/Card';
import { ChatBubbleIcon, SendIcon } from './common/Icons';
import { getChatbotResponse } from '../services/geminiService';
import { useAppContext } from '../App';

interface ChatbotProps {
  userName: string;
  progress: number;
}

const Chatbot: React.FC<ChatbotProps> = ({ userName, progress }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { sender: 'ai', text: `Hello, ${userName}! I'm your Elevate Guide. I see you've completed ${progress.toFixed(0)}% of your loan repayment. How can I help you today?` }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const aiResponse = await getChatbotResponse(input, messages);
            const aiMessage: ChatMessage = { sender: 'ai', text: aiResponse };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = { sender: 'ai', text: "Sorry, I'm having trouble connecting. Please try again." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <h3 className="font-bold text-gray-800 flex items-center"><ChatBubbleIcon className="w-6 h-6 mr-2 text-capital-red"/> 24/7 Help Assistant</h3>
            <div className="mt-4 h-64 bg-gray-50 rounded-lg p-3 flex flex-col space-y-3 overflow-y-auto">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs rounded-lg px-3 py-2 ${msg.sender === 'user' ? 'bg-capital-red text-white' : 'bg-gray-200 text-gray-800'}`}>
                            <p className="text-sm">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-200 text-gray-800 rounded-lg px-3 py-2">
                           <div className="flex items-center space-x-1">
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                           </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="mt-3 flex space-x-2">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-grow px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-capital-red focus:border-capital-red sm:text-sm"
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading || !input.trim()} className="p-2 bg-capital-red text-white rounded-md hover:bg-red-700 disabled:bg-gray-400">
                    <SendIcon className="w-5 h-5"/>
                </button>
            </form>
        </Card>
    );
};

const DashboardScreen: React.FC<ScreenProps> = ({ setJourneyStep }) => {
  const { appState } = useAppContext();
  const userName = appState.profile.name?.split(' ')[0] || 'Aditya';
  const nextEmi = appState.selectedOffer?.emi?.toLocaleString('en-IN') ?? '49,447';
  const totalAmount = appState.selectedOffer?.amount ?? 4000000;
  const amountPaid = 250000; // This would typically come from backend/state
  const progress = totalAmount > 0 ? (amountPaid / totalAmount) * 100 : 0;


  return (
    <div className="animate-fade-in-up">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Hello, {userName}!</h2>
        <p className="text-gray-600">Here's a summary of your education loan.</p>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h3 className="font-bold text-gray-800 mb-2">Repayment Progress</h3>
            <Card>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Paid: ₹{amountPaid.toLocaleString('en-IN')}</span>
                <span className="text-gray-500">Total: ₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-progressive-green h-4 rounded-full" style={{width: `${progress}%`}}></div>
              </div>
              <p className="text-xs text-right mt-1 text-gray-500">{progress.toFixed(2)}% completed</p>
            </Card>
          </div>
          <Chatbot userName={userName} progress={progress} />
        </div>
        
        {/* Sidebar Column */}
        <div className="lg:col-span-1 space-y-6">
            <Card className="!bg-capital-red text-white">
                <p className="text-sm opacity-80">Next EMI due</p>
                <p className="text-3xl font-bold mt-1">₹{nextEmi}</p>
                <p className="text-xs opacity-80 mt-1">on 15 July 2025</p>
            </Card>
            <div>
                <h3 className="font-bold text-gray-800 mb-2">Student Success Stories</h3>
                <Card>
                    <div className="flex items-center space-x-4">
                        <img src="https://picsum.photos/seed/student/80/80" alt="Student" className="w-20 h-20 rounded-full object-cover"/>
                        <div>
                            <p className="italic text-gray-600">"OneABC Elevate made my dream of studying abroad a reality. The process was so simple and stress-free."</p>
                            <p className="font-semibold text-right mt-2 text-gray-800">- Priya Sharma, MIT</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;