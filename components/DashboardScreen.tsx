import React, { useState, useRef, useEffect } from 'react';
import type { ScreenProps, ChatMessage } from '../types';
import Button from './common/Button';
import Card from './common/Card';
import { ChatBubbleIcon, SendIcon, CreditCardIcon, DocumentTextIcon, UserCircleIcon } from './common/Icons';
import { getChatbotResponse } from '../services/geminiService';
import { useAppContext } from '../App';

const DonutChart = ({ data, size = 120 }: { data: { label: string; value: number; color: string }[], size: number }) => {
    const halfsize = (size * 0.5);
    const radius = halfsize - 10;
    const circumference = 2 * Math.PI * radius;
    let strokeDashoffset = 0;
    const totalValue = data.reduce((acc, item) => acc + item.value, 0);

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
            <circle cx={halfsize} cy={halfsize} r={radius} fill="none" stroke="#e6e6e6" strokeWidth="15" />
            {data.map(({ value, color }, index) => {
                const strokeVal = (value / totalValue) * circumference;
                const dashOffset = strokeDashoffset;
                strokeDashoffset += strokeVal;
                return (
                    <circle
                        key={index}
                        cx={halfsize}
                        cy={halfsize}
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth="15"
                        strokeDasharray={`${strokeVal} ${circumference - strokeVal}`}
                        strokeDashoffset={-dashOffset}
                        strokeLinecap="round"
                        className="donut-segment"
                        aria-label={`${value * 100}% ${color}`}
                    />
                );
            })}
        </svg>
    );
};


const LoanOverviewCard = ({ totalAmount, principalPaid, interestPaid }: { totalAmount: number; principalPaid: number; interestPaid: number }) => {
    const amountPaid = principalPaid + interestPaid;
    const remaining = totalAmount - principalPaid; // Remaining principal
    const paidPercentage = totalAmount > 0 ? (principalPaid / totalAmount) * 100 : 0;
    
    const chartDataBreakdown = [
        { label: "Principal Paid", value: principalPaid, color: "#70B865" },
        { label: "Interest Paid", value: interestPaid, color: "#FFD65C" },
    ];


    return (
        <Card>
            <h3 className="font-bold text-gray-800 mb-4">Loan Overview</h3>
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                     <DonutChart data={chartDataBreakdown} size={140} />
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <div className="text-2xl font-bold text-gray-800">{paidPercentage.toFixed(1)}%</div>
                         <div className="text-sm text-gray-500">Principal Paid</div>
                     </div>
                </div>
                <div className="flex-grow w-full">
                    <div className="space-y-3">
                        <div className="flex items-center">
                             <div className="w-3 h-3 rounded-full bg-progressive-green mr-2"></div>
                             <div className="text-sm">
                                 <span className="font-semibold">Principal Paid:</span> ₹{principalPaid.toLocaleString('en-IN')}
                             </div>
                        </div>
                        <div className="flex items-center">
                             <div className="w-3 h-3 rounded-full bg-warm-yellow mr-2"></div>
                             <div className="text-sm">
                                 <span className="font-semibold">Interest Paid:</span> ₹{interestPaid.toLocaleString('en-IN')}
                             </div>
                        </div>
                         <div className="flex items-center">
                             <div className="w-3 h-3 rounded-full bg-gray-200 mr-2"></div>
                             <div className="text-sm">
                                 <span className="font-semibold">Principal Remaining:</span> ₹{remaining.toLocaleString('en-IN')}
                             </div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>₹{principalPaid.toLocaleString('en-IN')}</span>
                             <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                         <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-progressive-green h-2.5 rounded-full" style={{width: `${paidPercentage}%`}}></div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    )
}

const QuickActionsCard = () => (
  <Card>
    <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
    <div className="space-y-3">
      <button className="w-full flex items-center text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
        <CreditCardIcon className="w-6 h-6 mr-3 text-capital-red" />
        <div>
          <p className="font-semibold text-gray-800">Pay Next EMI</p>
          <p className="text-xs text-gray-500">Settle your upcoming payment.</p>
        </div>
      </button>
      <button className="w-full flex items-center text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
        <DocumentTextIcon className="w-6 h-6 mr-3 text-capital-red" />
        <div>
          <p className="font-semibold text-gray-800">Download Statement</p>
          <p className="text-xs text-gray-500">Get your loan statement.</p>
        </div>
      </button>
      <button className="w-full flex items-center text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
        <UserCircleIcon className="w-6 h-6 mr-3 text-capital-red" />
        <div>
          <p className="font-semibold text-gray-800">Update Profile</p>
          <p className="text-xs text-gray-500">Change your contact details.</p>
        </div>
      </button>
    </div>
  </Card>
);

interface ChatbotProps {
  userName: string;
  progress: number;
}

const Chatbot: React.FC<ChatbotProps> = ({ userName, progress }) => {
    const { appState, setChatHistory } = useAppContext();
    const { chatHistory } = appState;
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if(chatHistory.length === 0){
             setChatHistory([
                { sender: 'ai', text: `Hello, ${userName}! I'm your Elevate Guide. I see you've paid off ${progress.toFixed(1)}% of your loan principal. How can I help you today?` }
            ]);
        }
    }, [])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [chatHistory]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { sender: 'user', text: input };
        const newHistory = [...chatHistory, userMessage];
        setChatHistory(newHistory);
        setInput('');
        setIsLoading(true);

        try {
            const aiResponse = await getChatbotResponse(input, newHistory);
            const aiMessage: ChatMessage = { sender: 'ai', text: aiResponse };
            setChatHistory([...newHistory, aiMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = { sender: 'ai', text: "Sorry, I'm having trouble connecting. Please try again." };
            setChatHistory([...newHistory, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <h3 className="font-bold text-gray-800 flex items-center"><ChatBubbleIcon className="w-6 h-6 mr-2 text-capital-red"/> 24/7 Help Assistant</h3>
            <div className="mt-4 h-64 bg-gray-50 rounded-lg p-3 flex flex-col space-y-3 overflow-y-auto">
                {chatHistory.map((msg, index) => (
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
  const { appState, reset } = useAppContext();
  const userName = appState.profile.name?.split(' ')[0] || 'Aditya';
  const hasLoan = !!appState.selectedOffer;

  // Use selected offer data if available, otherwise provide sensible defaults.
  const totalAmount = appState.selectedOffer?.amount ?? 0;
  const nextEmi = appState.selectedOffer?.emi?.toLocaleString('en-IN') ?? 'N/A';
  
  // Dynamic mock data for visualization, based on the actual loan amount
  const principalPaid = hasLoan ? totalAmount * 0.05 : 0; // 5% paid
  const interestPaid = hasLoan ? totalAmount * 0.0125 : 0; // 1.25% paid
  const progress = totalAmount > 0 ? (principalPaid / totalAmount) * 100 : 0;

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Hello, {userName}!</h2>
          <p className="text-gray-600">{hasLoan ? "Here's a summary of your education loan." : "Welcome! Let's get you started."}</p>
        </div>
        <Button variant="ghost" onClick={reset}>Start New Application</Button>
      </div>


      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          {hasLoan ? (
            <LoanOverviewCard totalAmount={totalAmount} principalPaid={principalPaid} interestPaid={interestPaid} />
          ) : (
            <Card>
              <h3 className="font-bold text-gray-800 mb-2">No Active Loan</h3>
              <p className="text-gray-600 mb-4">It looks like you don't have an active loan with us yet. Start your application today to fund your future!</p>
              <Button onClick={reset}>Start Application</Button>
            </Card>
          )}
          <Chatbot userName={userName} progress={progress} />
        </div>
        
        {/* Sidebar Column */}
        <div className="lg:col-span-1 space-y-6">
            <Card className="!bg-capital-red text-white shadow-lg">
                <p className="text-sm opacity-80">Next EMI due</p>
                <p className="text-3xl font-bold mt-1">₹{nextEmi}</p>
                <p className="text-xs opacity-80 mt-1">{hasLoan ? "on 15 July 2025" : "Once loan is active"}</p>
            </Card>
            <QuickActionsCard />
            <div>
                <h3 className="font-bold text-gray-800 mb-2">Student Success Stories</h3>
                <Card>
                    <div className="flex items-center space-x-4">
                        <img src="https://i.pravatar.cc/80?u=priya" alt="Student" className="w-20 h-20 rounded-full object-cover"/>
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