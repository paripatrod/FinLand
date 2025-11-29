import React, { useState } from 'react';
import { MessageCircle, Sparkles, TrendingDown, TrendingUp, Calculator, X, Send, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import type { ScenarioComparison } from '../types';

interface AIAdvisorProps {
  balance: number;
  apr: number;
  currentPayment: number;
}

export default function AIAdvisor({ balance, apr, currentPayment }: AIAdvisorProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [comparison, setComparison] = useState<ScenarioComparison | null>(null);

  // คำนวณผลลัพธ์สำหรับยอดจ่ายต่างๆ
  const calculateScenario = (monthlyPayment: number) => {
    const monthlyRate = apr / 100 / 12;
    
    // Check if payment covers interest
    const minInterest = balance * monthlyRate;
    if (monthlyPayment <= minInterest) {
      return { error: 'payment_too_low', minPayment: minInterest };
    }

    let remainingBalance = balance;
    let totalInterest = 0;
    let months = 0;
    const maxMonths = 600; // 50 years max

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

  // วิเคราะห์คำถามและตอบ
  const analyzeQuestion = () => {
    const q = question.toLowerCase();
    
    // ตรวจจับตัวเลขในคำถาม
    const numbers = question.match(/\d{1,3}(,\d{3})*(\.\d+)?/g)?.map(n => parseFloat(n.replace(/,/g, ''))) || [];
    
    // Case 1: เปรียบเทียบยอดจ่าย 2 แบบ (เช่น "2000 vs 3000" หรือ "เปรียบเทียบ 2000 กับ 3000")
    if (((q.includes('vs') || q.includes('กับ') || q.includes('เปรียบเทียบ') || q.includes('compare')) && numbers.length >= 2) ||
        ((q.includes('เพิ่ม') || q.includes('เปลี่ยน') || q.includes('ถ้า') || q.includes('if') || q.includes('change')) && 
        (q.includes('จ่าย') || q.includes('ชำระ') || q.includes('pay')) && numbers.length >= 2)) {
      
      const payment1 = numbers[0];
      const payment2 = numbers[1];
      
      const scenario1 = calculateScenario(payment1);
      const scenario2 = calculateScenario(payment2);
      
      if (!scenario1 || 'error' in scenario1 || !scenario2 || 'error' in scenario2) {
        const err1 = scenario1 && 'error' in scenario1 ? scenario1 : null;
        const err2 = scenario2 && 'error' in scenario2 ? scenario2 : null;
        
        if (err1?.error === 'payment_too_low') {
             setAnswer(`⚠️ **${t('advisor.warning')}**: ยอดจ่าย ${payment1.toLocaleString()} บาท น้อยกว่าดอกเบี้ยขั้นต่ำ (${err1.minPayment.toLocaleString('th-TH', {maximumFractionDigits: 0})} บาท) หนี้จะไม่หมด!`);
        } else if (err2?.error === 'payment_too_low') {
             setAnswer(`⚠️ **${t('advisor.warning')}**: ยอดจ่าย ${payment2.toLocaleString()} บาท น้อยกว่าดอกเบี้ยขั้นต่ำ (${err2.minPayment.toLocaleString('th-TH', {maximumFractionDigits: 0})} บาท) หนี้จะไม่หมด!`);
        } else {
             setAnswer(`⚠️ ${t('advisor.answer.tooLow') || 'Payment too low to cover interest'}`);
        }
        setComparison(null);
        return;
      }
      
      const monthsDiff = scenario1.months - scenario2.months;
      const interestSaved = scenario1.totalInterest - scenario2.totalInterest;
      const totalSaved = scenario1.totalPaid - scenario2.totalPaid;
      
      setComparison({
        scenario1,
        scenario2,
        savings: {
          months: monthsDiff,
          interest: interestSaved,
          total: totalSaved,
          percentage: (interestSaved / scenario1.totalInterest) * 100
        }
      });
      
      const savingsPercentage = (interestSaved / scenario1.totalInterest) * 100;
      
      const years1 = Math.floor(scenario1.months / 12);
      const years2 = Math.floor(scenario2.months / 12);
      const monthsSaved = scenario1.months - scenario2.months;
      const yearsSaved = Math.floor(monthsSaved / 12);
      
      setAnswer(
        `🎯 **${t('advisor.result')}**\n\n` +
        `${t('advisor.scenario1')}: **${payment1.toLocaleString()} ${t('common.currency')}**\n` +
        `├ ⏱️ ใช้เวลา: **${scenario1.months} ${t('common.months')}** (${years1} ปี ${scenario1.months % 12} ${t('common.months')})\n` +
        `├ 💸 ดอกเบี้ยรวม: **${scenario1.totalInterest.toLocaleString('th-TH', {maximumFractionDigits: 0})} ${t('common.currency')}**\n` +
        `└ 💰 จ่ายทั้งหมด: **${scenario1.totalPaid.toLocaleString('th-TH', {maximumFractionDigits: 0})} ${t('common.currency')}**\n\n` +
        `${t('advisor.scenario2')}: **${payment2.toLocaleString()} ${t('common.currency')}** ⭐\n` +
        `├ ⏱️ ใช้เวลา: **${scenario2.months} ${t('common.months')}** (${years2} ปี ${scenario2.months % 12} ${t('common.months')})\n` +
        `├ 💸 ดอกเบี้ยรวม: **${scenario2.totalInterest.toLocaleString('th-TH', {maximumFractionDigits: 0})} ${t('common.currency')}**\n` +
        `└ 💰 จ่ายทั้งหมด: **${scenario2.totalPaid.toLocaleString('th-TH', {maximumFractionDigits: 0})} ${t('common.currency')}**\n\n` +
        `🎉 **${t('advisor.savings')}**\n` +
        `⚡ เร็วขึ้น: **${monthsDiff} ${t('common.months')}** ${yearsSaved > 0 ? `(${yearsSaved} ปี!)` : ''}\n` +
        `💰 ประหยัด: **${interestSaved.toLocaleString('th-TH', {maximumFractionDigits: 0})} ${t('common.currency')}** (${savingsPercentage.toFixed(1)}%)\n` +
        `💵 รวมประหยัด: **${totalSaved.toLocaleString('th-TH', {maximumFractionDigits: 0})} ${t('common.currency')}**\n\n` +
        `💡 **${t('advisor.recommendation')}:** จ่าย **${payment2.toLocaleString()} ${t('common.currency')}** ดีกว่ามาก! คุ้มค่าที่สุด! 🏆`
      );
      return;
    }
    
    // Case 2: ถามว่าควรจ่ายเท่าไหร่
    if (q.includes('ควรจ่าย') || q.includes('จ่ายเท่าไหร่') || q.includes('แนะนำ') || q.includes('should') || q.includes('recommend')) {
      const monthlyRate = balance * (apr / 100 / 12);
      const minPayment = Math.ceil(monthlyRate * 1.05);
      const recommended = Math.ceil(balance * 0.05); // 5% ของยอดหนี้
      const ideal = Math.ceil(balance * 0.10); // 10% ของยอดหนี้
      
      const minScenario = calculateScenario(minPayment);
      const recScenario = calculateScenario(recommended);
      const idealScenario = calculateScenario(ideal);
      
      const minYears = Math.floor((minScenario?.months || 0) / 12);
      const recYears = Math.floor((recScenario?.months || 0) / 12);
      const idealYears = Math.floor((idealScenario?.months || 0) / 12);
      
      setAnswer(
        `💡 **${t('advisor.recommendation')}**\n\n` +
        `⚠️ **${t('advisor.minPayment')}: ${minPayment.toLocaleString()} ${t('common.currency')}**\n` +
        `├ ⏱️ ใช้เวลา: **${minScenario?.months} ${t('common.months')}** (${minYears} ปี!)  ❌ นานมาก!\n` +
        `├ 💸 ดอกเบี้ย: **${(minScenario?.totalInterest || 0).toLocaleString('th-TH', {maximumFractionDigits: 0})} ${t('common.currency')}** ❌ สูงมาก!\n` +
        `└ ⚠️ **หนี้จะไม่หมดง่ายๆ** ใช้เวลานานมาก!\n\n` +
        `👍 **${t('advisor.recommendedPayment')}: ${recommended.toLocaleString()} ${t('common.currency')}** (5% ของยอดหนี้)\n` +
        `├ ⏱️ ใช้เวลา: **${recScenario?.months} ${t('common.months')}** (${recYears} ปี)\n` +
        `├ 💸 ดอกเบี้ย: **${(recScenario?.totalInterest || 0).toLocaleString('th-TH', {maximumFractionDigits: 0})} ${t('common.currency')}**\n` +
        `├ 💰 ประหยัดกว่าขั้นต่ำ: **${((minScenario?.totalInterest || 0) - (recScenario?.totalInterest || 0)).toLocaleString('th-TH', {maximumFractionDigits: 0})} ${t('common.currency')}** ✅\n` +
        `└ ✨ **สมดุลระหว่างงบประมาณกับการประหยัดดอกเบี้ย**\n\n` +
        `🏆 **${t('advisor.idealPayment')}: ${ideal.toLocaleString()} ${t('common.currency')}** (10% ของยอดหนี้)\n` +
        `├ ⏱️ ใช้เวลา: **${idealScenario?.months} ${t('common.months')}** (${idealYears} ปี) ⚡ เร็วสุด!\n` +
        `├ 💸 ดอกเบี้ย: **${(idealScenario?.totalInterest || 0).toLocaleString('th-TH', {maximumFractionDigits: 0})} ${t('common.currency')}** 🎯 ต่ำสุด!\n` +
        `├ 💰 ประหยัดกว่าขั้นต่ำ: **${((minScenario?.totalInterest || 0) - (idealScenario?.totalInterest || 0)).toLocaleString('th-TH', {maximumFractionDigits: 0})} ${t('common.currency')}** 🏆\n` +
        `└ 🌟 **คุ้มค่าที่สุด! แนะนำสูงสุด!**\n\n` +
        `🎯 **สรุป:** ถ้าทำได้ให้จ่าย **${ideal.toLocaleString()} ${t('common.currency')}** จะประหยัดได้สูงสุด! 💪`
      );
      setComparison(null);
      return;
    }
    
    // Case 3: ถามว่าปิดเมื่อไหร่
    if (q.includes('เมื่อไหร่') || q.includes('กี่เดือน') || q.includes('นานแค่ไหน') || q.includes('when') || q.includes('how long')) {
      const current = calculateScenario(currentPayment);
      if (!current || 'error' in current) {
        setAnswer(`⚠️ ${t('advisor.answer.tooLow') || 'Payment too low'}`);
        return;
      }
      
      const years = Math.floor(current.months / 12);
      const months = current.months % 12;
      
      setAnswer(
        `💡 **Result:**\n\n` +
        `${t('advisor.payment')} **${currentPayment.toLocaleString()} ${t('common.currency')}**\n` +
        `${t('credit.monthsToPayOff')}: **${current.months} ${t('common.months')}** ${years > 0 ? `(${years} ${t('common.years')} ${months} ${t('common.months')})` : ''}\n\n` +
        `💰 ${t('credit.totalInterest')}: ${current.totalInterest.toLocaleString('th-TH', {maximumFractionDigits: 0})} ${t('common.currency')}\n` +
        `💵 ${t('credit.totalPaid')}: ${current.totalPaid.toLocaleString('th-TH', {maximumFractionDigits: 0})} ${t('common.currency')}`
      );
      setComparison(null);
      return;
    }
    
    // Default: แนะนำการใช้
    setAnswer(
      `💬 **${t('advisor.title')}**\n\n` +
      `${t('advisor.quickQuestions')}\n` +
      `• "2000 vs 3000"\n` +
      `• "How much should I pay?"\n` +
      `• "When will I be debt free?"`
    );
    setComparison(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      analyzeQuestion();
    }
  };

  const quickQuestions = [
    `🤔 ถ้าจ่ายเพิ่มขึ้นเป็น ${Math.ceil(currentPayment * 1.5).toLocaleString()} บาท จะดีไหม?`,
    `💡 ควรจ่ายเท่าไหร่ดี? แนะนำหน่อย`,
    `⏱️ จะปิดหนี้เมื่อไหร่ ถ้าจ่าย ${currentPayment.toLocaleString()} บาท?`,
    `📊 เปรียบเทียบ ${currentPayment.toLocaleString()} vs ${Math.ceil(currentPayment * 2).toLocaleString()} บาท`
  ];

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
      {isOpen && (
        <div className="fixed bottom-36 sm:bottom-24 right-2 sm:right-6 left-2 sm:left-auto w-auto sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-[60vh] sm:max-h-[600px] flex flex-col animate-fade-in overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">{t('advisor.headerTitle')}</h3>
                <p className="text-xs text-purple-100 opacity-90">{t('advisor.headerSubtitle')}</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Current Info */}
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-sm">
              <p className="font-semibold text-purple-900 dark:text-purple-200 mb-1">📊 {t('advisor.currentInfo')}</p>
              <p className="text-purple-700 dark:text-purple-300">💰 {t('advisor.balance')}: {balance.toLocaleString()} {t('common.currency')}</p>
              <p className="text-purple-700 dark:text-purple-300">📈 {t('advisor.interest')}: {apr}% {t('advisor.perYear')}</p>
              <p className="text-purple-700 dark:text-purple-300">💳 {t('advisor.payment')}: {currentPayment.toLocaleString()} {t('common.currency')}</p>
            </div>

            {/* Quick Questions */}
            {!answer && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">💡 {t('advisor.quickQuestions')}</p>
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => { setQuestion(q); setTimeout(() => analyzeQuestion(), 100); }}
                    className="w-full text-left text-sm p-2 bg-gray-50 dark:bg-gray-700/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors border border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500 text-gray-800 dark:text-gray-200"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Answer */}
            {answer && (
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 rounded-lg border-2 border-purple-200 dark:border-purple-700">
                <div className="prose prose-sm max-w-none text-gray-800 dark:text-gray-200 whitespace-pre-line">
                  {answer}
                </div>
              </div>
            )}

            {/* Comparison Table */}
            {comparison && (
              <div className="bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-700 rounded-lg overflow-hidden">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3">
                  <h4 className="font-bold text-purple-900 dark:text-purple-200 flex items-center">
                    <Calculator className="w-4 h-4 mr-2" />
                    {t('advisor.comparisonTitle')}
                  </h4>
                </div>
                <div className="p-3 space-y-3">
                  {/* Scenario 1 */}
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="font-semibold text-red-900 dark:text-red-300 mb-2">
                      📊 {t('advisor.scenario1')}: {comparison.scenario1.payment.toLocaleString()} {t('common.currency')}
                    </p>
                    <div className="text-sm text-red-800 dark:text-red-300 space-y-1">
                      <p>⏱️ {t('dashboard.duration')}: {comparison.scenario1.months} {t('common.months')}</p>
                      <p>💸 {t('advisor.interest')}: {comparison.scenario1.totalInterest.toLocaleString('th-TH', {maximumFractionDigits: 0})} {t('common.currency')}</p>
                      <p>💰 {t('credit.totalPaid')}: {comparison.scenario1.totalPaid.toLocaleString('th-TH', {maximumFractionDigits: 0})} {t('common.currency')}</p>
                    </div>
                  </div>

                  {/* Scenario 2 */}
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="font-semibold text-green-900 dark:text-green-300 mb-2">
                      ✅ {t('advisor.scenario2')}: {comparison.scenario2.payment.toLocaleString()} {t('common.currency')}
                    </p>
                    <div className="text-sm text-green-800 dark:text-green-300 space-y-1">
                      <p>⏱️ {t('dashboard.duration')}: {comparison.scenario2.months} {t('common.months')}</p>
                      <p>💸 {t('advisor.interest')}: {comparison.scenario2.totalInterest.toLocaleString('th-TH', {maximumFractionDigits: 0})} {t('common.currency')}</p>
                      <p>💰 {t('credit.totalPaid')}: {comparison.scenario2.totalPaid.toLocaleString('th-TH', {maximumFractionDigits: 0})} {t('common.currency')}</p>
                    </div>
                  </div>

                  {/* Savings */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-3 rounded-lg border-2 border-yellow-300 dark:border-yellow-700">
                    <p className="font-bold text-orange-900 dark:text-orange-300 mb-2 flex items-center">
                      <TrendingDown className="w-4 h-4 mr-1" />
                      {t('advisor.savings')}
                    </p>
                    <div className="text-sm text-orange-800 dark:text-orange-300 space-y-1 font-semibold">
                      <p>⚡ {t('advisor.faster')}: {comparison.savings.months} {t('common.months')}</p>
                      <p>💰 {t('advisor.saveMoney')}: {comparison.savings.total.toLocaleString('th-TH', {maximumFractionDigits: 0})} {t('common.currency')}</p>
                      <p>📉 {t('advisor.reduceInterest')}: {comparison.savings.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={t('advisor.inputPlaceholder')}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                aria-label={t('advisor.send')}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            {answer && (
              <button
                type="button"
                onClick={() => { setQuestion(''); setAnswer(null); setComparison(null); }}
                className="mt-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
              >
                🔄 {t('advisor.newQuestion')}
              </button>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
