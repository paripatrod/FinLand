import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Sparkles, X, Send, User, Bot, RotateCcw, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../utils/api';
import type { ScenarioComparison } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AIAdvisorProps {
  balance: number;
  apr: number;
  currentPayment: number;
  monthlyIncome?: number;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  comparison?: ScenarioComparison;
  timestamp: Date;
  isGemini?: boolean;
}

export default function AIAdvisor({ balance, apr, currentPayment, monthlyIncome = 0 }: AIAdvisorProps) {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [useGemini, setUseGemini] = useState(true); // Toggle for Gemini AI
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // คำนวณผลลัพธ์สำหรับยอดจ่ายต่างๆ
  const calculateScenario = (monthlyPayment: number): 
    | { error: string; minPayment: number }
    | { payment: number; months: number; totalInterest: number; totalPaid: number } => {
    const monthlyRate = apr / 100 / 12;
    const minInterest = balance * monthlyRate;
    
    if (monthlyPayment <= minInterest) {
      return { error: 'payment_too_low', minPayment: minInterest };
    }

    let remainingBalance = balance;
    let totalInterest = 0;
    let months = 0;
    const maxMonths = 600;

    while (remainingBalance > 0.01 && months < maxMonths) {
      const interestCharge = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestCharge;
      totalInterest += interestCharge;
      remainingBalance -= principalPayment;
      months++;
    }

    return {
      payment: monthlyPayment,
      months,
      totalInterest,
      totalPaid: balance + totalInterest
    };
  };

  // วิเคราะห์คำถามและสร้างคำตอบ
  const analyzeQuestion = (questionText: string): { answer: string; comparison?: ScenarioComparison } => {
    const q = questionText.toLowerCase();
    const numbers = questionText.match(/\d{1,3}(,\d{3})*(\.\d+)?/g)?.map(n => parseFloat(n.replace(/,/g, ''))) || [];
    
    // Case 1: เปรียบเทียบยอดจ่าย 2 แบบ
    if (((q.includes('vs') || q.includes('กับ') || q.includes('เปรียบเทียบ') || q.includes('compare')) && numbers.length >= 2) ||
        ((q.includes('เพิ่ม') || q.includes('ถ้า') || q.includes('if')) && numbers.length >= 2)) {
      
      const payment1 = numbers[0];
      const payment2 = numbers[1];
      const scenario1 = calculateScenario(payment1);
      const scenario2 = calculateScenario(payment2);
      
      if ('error' in scenario1 || 'error' in scenario2) {
        const err = 'error' in scenario1 ? scenario1 : scenario2;
        const minPay = 'minPayment' in err ? err.minPayment : 0;
        return { 
          answer: `⚠️ ยอดจ่ายน้อยเกินไป! ดอกเบี้ยขั้นต่ำคือ ${Math.ceil(minPay).toLocaleString()} บาท/เดือน` 
        };
      }
      
      const comparison: ScenarioComparison = {
        scenario1: scenario1 as any,
        scenario2: scenario2 as any,
        savings: {
          months: scenario1.months - scenario2.months,
          interest: scenario1.totalInterest - scenario2.totalInterest,
          total: scenario1.totalPaid - scenario2.totalPaid,
          percentage: ((scenario1.totalInterest - scenario2.totalInterest) / scenario1.totalInterest) * 100
        }
      };
      
      return {
        answer: `## 📊 เปรียบเทียบการจ่าย\n\n` +
          `| รายการ | 💳 ${payment1.toLocaleString()} บาท | 💳 ${payment2.toLocaleString()} บาท |\n` +
          `|:---|:---:|:---:|\n` +
          `| ⏱️ ระยะเวลา | ${scenario1.months} เดือน | ${scenario2.months} เดือน |\n` +
          `| 📅 คิดเป็น | ${Math.floor(scenario1.months/12)} ปี ${scenario1.months % 12} ด. | ${Math.floor(scenario2.months/12)} ปี ${scenario2.months % 12} ด. |\n` +
          `| 💸 ดอกเบี้ยรวม | ${scenario1.totalInterest.toLocaleString('th-TH', {maximumFractionDigits: 0})} | ${scenario2.totalInterest.toLocaleString('th-TH', {maximumFractionDigits: 0})} |\n` +
          `| 💰 จ่ายทั้งหมด | ${scenario1.totalPaid.toLocaleString('th-TH', {maximumFractionDigits: 0})} | ${scenario2.totalPaid.toLocaleString('th-TH', {maximumFractionDigits: 0})} |\n\n` +
          `### 🎉 ถ้าเพิ่มเป็น ${payment2.toLocaleString()} บาท\n` +
          `- ✅ **เร็วขึ้น ${comparison.savings.months} เดือน**\n` +
          `- ✅ **ประหยัด ${comparison.savings.interest.toLocaleString('th-TH', {maximumFractionDigits: 0})} บาท**`,
        comparison
      };
    }
    
    // Case 2: ถามว่าควรจ่ายเท่าไหร่
    if (q.includes('ควรจ่าย') || q.includes('แนะนำ') || q.includes('should') || q.includes('recommend') || q.includes('ดี')) {
      const monthlyRate = balance * (apr / 100 / 12);
      const minPayment = Math.ceil(monthlyRate * 1.05);
      const recommended = Math.ceil(balance * 0.05);
      const ideal = Math.ceil(balance * 0.10);
      
      const minScenario = calculateScenario(minPayment);
      const recScenario = calculateScenario(recommended);
      const idealScenario = calculateScenario(ideal);
      
      const getMonths = (s: any) => 'months' in s ? s.months : 999;
      const getInterest = (s: any) => 'totalInterest' in s ? s.totalInterest.toLocaleString('th-TH', {maximumFractionDigits: 0}) : '-';
      
      return {
        answer: `## 💡 คำแนะนำการจ่าย\n\n` +
          `| ระดับ | ยอดจ่าย/เดือน | ระยะเวลา | ดอกเบี้ยรวม |\n` +
          `|:---|:---:|:---:|:---:|\n` +
          `| ⚠️ ขั้นต่ำ | ${minPayment.toLocaleString()} | ${getMonths(minScenario)} เดือน | ${getInterest(minScenario)} |\n` +
          `| 👍 แนะนำ | ${recommended.toLocaleString()} | ${getMonths(recScenario)} เดือน | ${getInterest(recScenario)} |\n` +
          `| 🏆 ดีที่สุด | ${ideal.toLocaleString()} | ${getMonths(idealScenario)} เดือน | ${getInterest(idealScenario)} |\n\n` +
          `> 🎯 **สรุป:** ถ้าทำได้ ให้จ่าย **${ideal.toLocaleString()} บาท** จะประหยัดที่สุด!`
      };
    }
    
    // Case 3: ถามว่าปิดเมื่อไหร่
    if (q.includes('เมื่อไหร่') || q.includes('กี่เดือน') || q.includes('when') || q.includes('how long') || q.includes('ปิด')) {
      const current = calculateScenario(currentPayment);
      
      if ('error' in current) {
        const minPay = 'minPayment' in current ? current.minPayment : 0;
        return { 
          answer: `⚠️ ยอดจ่าย ${currentPayment.toLocaleString()} บาท ต่ำเกินไป!\n\nต้องจ่ายอย่างน้อย ${Math.ceil(minPay).toLocaleString()} บาท/เดือน เพื่อให้หนี้ลดลงได้` 
        };
      }
      
      const years = Math.floor(current.months / 12);
      const months = current.months % 12;
      
      return {
        answer: `⏱️ ถ้าจ่าย ${currentPayment.toLocaleString()} บาท/เดือน\n\n` +
          `📅 หนี้หมดใน: ${current.months} เดือน ${years > 0 ? `(${years} ปี ${months} เดือน)` : ''}\n` +
          `💸 ดอกเบี้ยรวม: ${current.totalInterest.toLocaleString('th-TH', {maximumFractionDigits: 0})} บาท\n` +
          `💰 จ่ายทั้งหมด: ${current.totalPaid.toLocaleString('th-TH', {maximumFractionDigits: 0})} บาท`
      };
    }
    
    // Case 4: ถ้ามีตัวเลขเดียว ให้คำนวณตัวนั้น
    if (numbers.length === 1) {
      const payment = numbers[0];
      const scenario = calculateScenario(payment);
      
      if ('error' in scenario) {
        const minPay = 'minPayment' in scenario ? scenario.minPayment : 0;
        return { 
          answer: `⚠️ จ่าย ${payment.toLocaleString()} บาท น้อยเกินไป!\n\nดอกเบี้ยต่อเดือน ~${Math.ceil(minPay).toLocaleString()} บาท\nต้องจ่ายมากกว่านี้ถึงจะลดหนี้ได้` 
        };
      }
      
      const years = Math.floor(scenario.months / 12);
      
      return {
        answer: `📊 ถ้าจ่าย ${payment.toLocaleString()} บาท/เดือน\n\n` +
          `⏱️ หนี้หมดใน: ${scenario.months} เดือน (${years} ปี)\n` +
          `💸 ดอกเบี้ย: ${scenario.totalInterest.toLocaleString('th-TH', {maximumFractionDigits: 0})} บาท\n` +
          `💰 จ่ายทั้งหมด: ${scenario.totalPaid.toLocaleString('th-TH', {maximumFractionDigits: 0})} บาท`
      };
    }
    
    // Default
    return {
      answer: `💬 ถามอะไรก็ได้!\n\nลองพิมพ์:\n• "3000 vs 5000"\n• "ควรจ่ายเท่าไหร่"\n• "จะปิดหนี้เมื่อไหร่"\n• หรือใส่ตัวเลข เช่น "4000"`
    };
  };

  // Handle sending message
  const handleSend = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Check if it's a simple calculation question (use local)
    const isSimpleCalc = /^\d/.test(messageText) || 
                         messageText.includes('vs') || 
                         messageText.includes('เท่าไหร่') ||
                         messageText.includes('เมื่อไหร่') ||
                         messageText.includes('กี่เดือน');
    
    // Try Gemini for complex questions, fallback to local
    if (useGemini && !isSimpleCalc) {
      try {
        const response = await apiClient.post('/api/ai-chat', {
          question: messageText,
          balance,
          apr,
          payment: currentPayment,
          monthly_income: monthlyIncome
        });
        
        const data = await response.json();
        
        if (data.success && data.answer) {
          const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content: data.answer,
            timestamp: new Date(),
            isGemini: true
          };
          setMessages(prev => [...prev, aiMessage]);
          setIsTyping(false);
          return;
        }
      } catch (error) {
        console.log('Gemini unavailable, using local analysis');
        // Fall through to local analysis
      }
    }
    
    // Use local analysis (fallback or simple questions)
    setTimeout(() => {
      const result = analyzeQuestion(messageText);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: result.answer,
        comparison: result.comparison,
        timestamp: new Date(),
        isGemini: false
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  // Quick questions in Thai
  const quickQuestions = language === 'th' ? [
    `ควรจ่ายเท่าไหร่ดี?`,
    `จะปิดหนี้ได้เมื่อไหร่?`,
    `${currentPayment.toLocaleString()} vs ${Math.ceil(currentPayment * 2).toLocaleString()}`,
    `มีวิธีลดหนี้เร็วขึ้นไหม?`,
    `ควรรีไฟแนนซ์ไหม?`
  ] : [
    `How much should I pay?`,
    `When will I be debt free?`,
    `${currentPayment.toLocaleString()} vs ${Math.ceil(currentPayment * 2).toLocaleString()}`,
    `How can I pay off faster?`,
    `Should I refinance?`
  ];

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div className="relative">
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-50"
        title={t('advisor.title')}
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        {!isOpen && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce shadow-sm">
            AI
          </span>
        )}
      </button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed bottom-36 sm:bottom-24 right-2 sm:right-6 left-2 sm:left-auto w-auto sm:w-[400px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-[70vh] sm:max-h-[600px] flex flex-col overflow-hidden"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 flex items-center justify-between shadow-md flex-shrink-0">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base flex items-center gap-1.5">
                    {language === 'th' ? 'AI ที่ปรึกษาหนี้' : 'AI Debt Advisor'}
                    {useGemini && <Zap className="w-3.5 h-3.5 text-yellow-300" />}
                  </h3>
                  <p className="text-xs text-purple-100 opacity-90">
                    {useGemini ? 'Powered by Gemini ✨' : (language === 'th' ? 'โหมดออฟไลน์' : 'Offline mode')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button 
                    onClick={handleClearChat}
                    className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                    title={language === 'th' ? 'ล้างแชท' : 'Clear chat'}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Current Info Bar */}
            <div className="bg-purple-50 dark:bg-purple-900/30 px-4 py-2 text-xs flex-shrink-0 border-b border-purple-100 dark:border-purple-800">
              <span className="text-purple-700 dark:text-purple-300">
                💰 {balance.toLocaleString()} บาท | 📈 {apr}% | 💳 {currentPayment.toLocaleString()} บาท/เดือน
              </span>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
              {messages.length === 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
                    {language === 'th' ? '💡 กดคำถามด้านล่างหรือพิมพ์เอง' : '💡 Tap a question or type your own'}
                  </p>
                  {quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(q)}
                      className="w-full text-left text-sm p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-xl transition-colors border border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500 text-gray-700 dark:text-gray-200"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start gap-2 max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                          msg.type === 'user' 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
                        }`}>
                          {msg.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div className={`rounded-2xl px-4 py-3 ${
                          msg.type === 'user'
                            ? 'bg-emerald-500 text-white rounded-br-md'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-md'
                        }`}>
                          <div className="text-sm leading-relaxed markdown-content">
                            {msg.type === 'user' ? (
                              <div className="whitespace-pre-line">{msg.content}</div>
                            ) : (
                              <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  // @ts-ignore - Ignore strict type checking for markdown components
                                  p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                  // @ts-ignore
                                  ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                                  // @ts-ignore
                                  ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                                  // @ts-ignore
                                  li: ({node, ...props}) => <li className="" {...props} />,
                                  // @ts-ignore
                                  strong: ({node, ...props}) => <span className="font-bold text-purple-700 dark:text-purple-300" {...props} />,
                                  // @ts-ignore
                                  a: ({node, ...props}) => <a className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                                  // @ts-ignore
                                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-purple-300 pl-3 italic my-2" {...props} />,
                                  // @ts-ignore
                                  code: ({node, ...props}) => <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded text-xs font-mono" {...props} />,
                                  // @ts-ignore
                                  table: ({node, ...props}) => <table className="w-full text-xs border-collapse my-2" {...props} />,
                                  // @ts-ignore
                                  thead: ({node, ...props}) => <thead className="bg-purple-100 dark:bg-purple-900/50" {...props} />,
                                  // @ts-ignore
                                  th: ({node, ...props}) => <th className="border border-purple-200 dark:border-purple-700 px-2 py-1.5 text-left font-semibold text-purple-800 dark:text-purple-200" {...props} />,
                                  // @ts-ignore
                                  td: ({node, ...props}) => <td className="border border-gray-200 dark:border-gray-600 px-2 py-1.5" {...props} />,
                                  // @ts-ignore
                                  tr: ({node, ...props}) => <tr className="even:bg-gray-50 dark:even:bg-gray-800/50" {...props} />,
                                  // @ts-ignore
                                  h2: ({node, ...props}) => <h2 className="text-base font-bold mb-2 text-purple-700 dark:text-purple-300" {...props} />,
                                  // @ts-ignore
                                  h3: ({node, ...props}) => <h3 className="text-sm font-bold mt-3 mb-1 text-gray-700 dark:text-gray-300" {...props} />,
                                }}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-3">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-800">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={language === 'th' ? 'พิมพ์คำถาม เช่น "3000 vs 5000"' : 'Type a question...'}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
