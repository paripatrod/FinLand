import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Download, Save, Sparkles, Calculator, Printer, ChevronDown, ChevronUp } from 'lucide-react'
import { saveCalculation, saveToHistory } from '../utils/storage'
import { useLanguage } from '../contexts/LanguageContext'
import { apiClient } from '../utils/api'
import AIAdvisor from './AIAdvisor'
import confetti from 'canvas-confetti'
import CountUpNumber from './ui/CountUpNumber'
import CurrencyInput from './ui/CurrencyInput'
import { motion, AnimatePresence } from 'framer-motion'
import { printPaymentSchedule } from '../utils/pdfExport'
import type { CreditCardResponse, AIAnalysisResponse, WhatIfResult } from '../types'

export default function CreditCardCalculator() {
  const { t } = useLanguage()
  const [balance, setBalance] = useState('')
  const [apr, setApr] = useState('')
  const [monthlyPayment, setMonthlyPayment] = useState('')
  const [monthlyIncome, setMonthlyIncome] = useState('')
  const [extraPayment, setExtraPayment] = useState(0)
  const [result, setResult] = useState<CreditCardResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResponse | null>(null)
  
  // Optional fields for better AI analysis
  const [showOptional, setShowOptional] = useState(false)
  const [age, setAge] = useState('')
  const [monthlyExpenses, setMonthlyExpenses] = useState('')
  const [currentSavings, setCurrentSavings] = useState('')
  const [emergencyMonths, setEmergencyMonths] = useState('')

  const whatIfResult = React.useMemo<WhatIfResult | null>(() => {
    if (!result || extraPayment === 0) return null;
    const totalMonthly = Number(monthlyPayment) + extraPayment;
    const monthlyRate = (Number(apr) / 100) / 12;
    let currentBalance = Number(balance);
    let months = 0;
    let totalInterest = 0;
    
    while (currentBalance > 0 && months < 600) {
        months++;
        const interest = currentBalance * monthlyRate;
        const principal = Math.min(totalMonthly - interest, currentBalance);
        currentBalance -= principal;
        totalInterest += interest;
    }
    
    return {
        months,
        totalInterest,
        savedInterest: result.total_interest - totalInterest,
        savedMonths: result.months - months
    };
  }, [result, extraPayment, monthlyPayment, apr, balance]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)
    setSaved(false)
    setAiAnalysis(null)
    
    const bal = Number(balance)
    const rate = Number(apr)
    const payment = Number(monthlyPayment)
    const income = Number(monthlyIncome)
    
    // ========== Client-side Validation ==========
    // 1. ตรวจสอบค่าพื้นฐาน
    if (!bal || bal <= 0) {
      setError('❌ กรุณาระบุยอดหนี้คงค้างที่มากกว่า 0')
      return
    }
    if (!rate || rate <= 0 || rate > 100) {
      setError('❌ กรุณาระบุอัตราดอกเบี้ยระหว่าง 0.01% - 100%')
      return
    }
    if (!payment || payment <= 0) {
      setError('❌ กรุณาระบุยอดจ่ายต่อเดือนที่มากกว่า 0')
      return
    }
    if (!income || income <= 0) {
      setError('❌ กรุณาระบุรายได้ต่อเดือน เพื่อให้ AI วิเคราะห์ได้แม่นยำ')
      return
    }
    
    // 2. คำนวณดอกเบี้ยต่อเดือน และตรวจสอบว่าจ่ายพอไหม
    const monthlyInterest = bal * (rate / 100 / 12)
    const minimumPayment = Math.ceil(monthlyInterest * 1.01) // ดอกเบี้ย + 1% เงินต้น
    
    if (payment <= monthlyInterest) {
      // ❌ จ่ายไม่พอแม้แต่ดอกเบี้ย - หนี้จะเพิ่มขึ้น!
      const shortfall = monthlyInterest - payment
      setError(
        `⚠️ ยอดจ่ายต่ำเกินไป! หนี้จะไม่ลดลงเลย\n\n` +
        `📊 สรุปสถานการณ์:\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `💳 ยอดหนี้: ${bal.toLocaleString()} บาท\n` +
        `📈 ดอกเบี้ย: ${rate}% ต่อปี\n` +
        `💸 ดอกเบี้ยต่อเดือน: ${monthlyInterest.toLocaleString('th-TH', {maximumFractionDigits: 0})} บาท\n` +
        `💰 คุณจ่าย: ${payment.toLocaleString()} บาท/เดือน\n\n` +
        `🚨 ปัญหา: หนี้จะเพิ่มขึ้น ${shortfall.toLocaleString('th-TH', {maximumFractionDigits: 0})} บาท/เดือน!\n\n` +
        `✅ แก้ไข: จ่ายอย่างน้อย ${minimumPayment.toLocaleString()} บาท/เดือน`
      )
      return
    }
    
    // 3. เตือนถ้าจ่ายน้อยมาก (ใช้เวลานานเกิน 50 ปี)
    // ใช้สูตรประมาณ: n = -log(1 - (PV * r) / PMT) / log(1 + r)
    const r = rate / 100 / 12
    const estimatedMonths = payment > monthlyInterest 
      ? Math.log(payment / (payment - bal * r)) / Math.log(1 + r)
      : 9999
    
    if (estimatedMonths > 600) {
      setError(
        `⚠️ ยอดจ่ายต่ำเกินไป! จะใช้เวลานานเกิน 50 ปี\n\n` +
        `📊 สรุป:\n` +
        `💳 ยอดหนี้: ${bal.toLocaleString()} บาท\n` +
        `💸 ดอกเบี้ยต่อเดือน: ~${monthlyInterest.toLocaleString('th-TH', {maximumFractionDigits: 0})} บาท\n` +
        `💰 คุณจ่าย: ${payment.toLocaleString()} บาท (เกินดอกเบี้ยแค่ ${(payment - monthlyInterest).toLocaleString('th-TH', {maximumFractionDigits: 0})} บาท)\n\n` +
        `✅ แนะนำ: จ่ายอย่างน้อย ${Math.ceil(bal * 0.02).toLocaleString()} บาท/เดือน (2% ของหนี้)`
      )
      return
    }
    
    // 4. เตือนถ้า DTI สูงเกินไป
    const dti = (payment / income) * 100
    if (dti > 70) {
      // ไม่ block แต่เตือน - ยังคำนวณต่อได้
      console.warn(`DTI สูงมาก: ${dti.toFixed(1)}%`)
    }
    
    setLoading(true)

    const payload = { balance: Number(balance), apr: Number(apr), monthly_payment: Number(monthlyPayment) }
    try {
      const res = await apiClient.post('/api/calculate/credit-card', payload)
      
      // Clone response to allow reading body twice if needed
      const resClone = res.clone()
      
      // Try to parse JSON, handle non-JSON responses
      let data;
      try {
        data = await res.json()
      } catch (jsonErr) {
        // If response is not JSON (e.g., HTML error page)
        const text = await resClone.text().catch(() => 'Unknown error')
        console.error('Non-JSON response:', text)
        throw new Error(`เซิร์ฟเวอร์ไม่ตอบสนอง กรุณาลองใหม่อีกครั้ง`)
      }
      
      console.log('API Response:', { ok: res.ok, status: res.status, data })
      
      if (!res.ok || data.success === false) {
        // Build detailed error message
        let errorMsg = data.error || 'ไม่สามารถคำนวณได้'
        
        // Add details for payment_too_low error
        if (data.error_type === 'payment_too_low' && data.details) {
          const d = data.details
          errorMsg = `⚠️ ยอดจ่ายต่ำเกินไป!\n\n` +
            `💳 คุณจ่าย: ${Number(d.monthly_payment || monthlyPayment).toLocaleString()} บาท/เดือน\n` +
            `💸 ดอกเบี้ยต่อเดือน: ${Number(d.monthly_interest || 0).toLocaleString()} บาท\n` +
            `📈 หนี้จะเพิ่มขึ้น: ${Number(d.shortfall || 0).toLocaleString()} บาท/เดือน\n\n` +
            `✅ แนะนำ: จ่ายอย่างน้อย ${Number(d.minimum_payment || 0).toLocaleString()} บาท/เดือน`
        } else if (data.message) {
          errorMsg += '\n\n' + data.message
          if (data.recommendation) errorMsg += '\n\n' + data.recommendation
        }
        
        console.log('Setting error:', errorMsg)
        setError(errorMsg)
        setLoading(false)
        return
      }
      
      setResult(data)
      
      // Fire confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#059669', '#34d399']
      })
      
      // บันทึกอัตโนมัติ (Legacy)
      saveCalculation({
        id: Date.now().toString(),
        type: 'credit-card',
        date: new Date().toISOString(),
        data: payload,
        result: data
      })
      
      // บันทึกประวัติ (NEW)
      saveToHistory({
        id: Date.now().toString(),
        type: 'credit-card',
        timestamp: Date.now(),
        inputs: payload,
        results: data
      })
      setSaved(true)
      
      // เรียก AI วิเคราะห์โปรไฟล์อัตโนมัติ (v4.0 - Combined)
      analyzeWithAI(Number(balance), Number(apr), data.months, Number(monthlyPayment), Number(monthlyIncome))
    } catch (err: any) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  async function analyzeWithAI(loanAmount: number, interestRate: number, termMonths: number, monthlyPaymentVal: number, monthlyIncomeVal: number) {
    setAiLoading(true)
    setAiAnalysis(null)
    
    try {
      // Validate optional fields
      const ageVal = age ? Number(age) : 30
      const expensesVal = monthlyExpenses ? Number(monthlyExpenses) : monthlyIncomeVal * 0.5
      const savingsVal = currentSavings ? Number(currentSavings) : 0
      const emergencyVal = emergencyMonths ? Number(emergencyMonths) : 0
      
      // Validation for optional fields
      if (age && (ageVal < 18 || ageVal > 100)) {
        console.warn('อายุไม่ถูกต้อง ใช้ค่า default')
      }
      if (monthlyExpenses && expensesVal > monthlyIncomeVal) {
        console.warn('รายจ่ายมากกว่ารายได้')
      }
      
      // Call AI Analysis v4.0 (Combined with Legacy insights)
      const aiRes = await apiClient.post('/api/ai-analyze', {
        loan_amount: loanAmount,
        interest_rate: interestRate,
        term_months: termMonths,
        monthly_payment: monthlyPaymentVal,
        monthly_income: monthlyIncomeVal,
        monthly_expenses: expensesVal,
        age: ageVal,
        current_savings: savingsVal,
        emergency_months: emergencyVal,
        job_stability: 70,
        payment_history: 80
      })
      const aiData = await aiRes.json()
      if (aiRes.ok && aiData.success) {
        setAiAnalysis(aiData)
      }
    } catch (err) {
      console.error('AI analysis failed:', err)
    } finally {
      setAiLoading(false)
    }
  }

  function formatCurrency(v: number | undefined | null) {
    if (v === undefined || v === null || isNaN(v)) return '0.00'
    return v.toLocaleString('th-TH', { minimumFractionDigits: 2 })
  }

  function downloadCSV() {
    if (!result || !result.schedule) return
    
    // CSV Headers with Thai translation
    const headers = [
      t('table.month') || 'เดือน',
      t('table.payment') || 'จ่าย',
      t('table.interest') || 'ดอกเบี้ย',
      t('table.principal') || 'เงินต้น',
      t('table.remaining') || 'คงเหลือ'
    ]
    
    // Format numbers with comma separator
    const rows = result.schedule.map((row: any) => [
      row.month,
      formatCurrency(row.payment),
      formatCurrency(row.interest),
      formatCurrency(row.principal),
      formatCurrency(row.remaining)
    ])
    
    // Add summary row
    const summaryRow = [
      t('credit.totalPaid') || 'รวมจ่ายทั้งหมด',
      formatCurrency(result.total_paid),
      formatCurrency(result.total_interest),
      formatCurrency(Number(balance)),
      '0.00'
    ]
    
    // Create CSV with BOM for UTF-8
    const BOM = '\uFEFF'
    const csvContent = BOM + [
      `"${t('credit.title') || 'บัตรเครดิต'}"`,
      `"${t('credit.balance')}","${formatCurrency(Number(balance))} ${t('common.currency')}"`,
      `"${t('credit.apr')}","${apr}%"`,
      `"${t('credit.payment')}","${formatCurrency(Number(monthlyPayment))} ${t('common.currency')}"`,
      `"${t('credit.monthsToPayOff')}","${result.months} ${t('common.months')}"`,
      '',
      headers.map(h => `"${h}"`).join(','),
      ...rows.map((r: any[]) => r.map(c => `"${c}"`).join(',')),
      '',
      summaryRow.map(c => `"${c}"`).join(',')
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `บัตรเครดิต-${new Date().toLocaleDateString('th-TH')}.csv`
    link.click()
  }

  return (
    <motion.div 
      className="max-w-6xl mx-auto container-padding"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8 sm:mb-10 lg:mb-12">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4 leading-tight">{t('credit.title')}</h1>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">{t('credit.subtitle')}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 lg:p-10 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <CurrencyInput
              id="balance"
              label={t('credit.balance')}
              value={balance}
              onChange={setBalance}
              placeholder="50000"
              required
              helpText={t('credit.balance.help')}
            />
            
            <div className="relative group">
              <label htmlFor="apr" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400">
                {t('credit.apr')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input 
                  id="apr"
                  type="number"
                  step="0.01"
                  value={apr} 
                  onChange={e => setApr(e.target.value)} 
                  className="w-full pl-4 pr-12 py-4 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-lg font-medium text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 outline-none" 
                  placeholder="16.00"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">%</span>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('credit.apr.help')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <CurrencyInput
              id="monthlyPayment"
              label={t('credit.payment')}
              value={monthlyPayment}
              onChange={setMonthlyPayment}
              placeholder="1500"
              required
              helpText={t('credit.payment.help')}
            />

            <CurrencyInput
              id="monthlyIncome"
              label={t('common.monthlyIncome')}
              value={monthlyIncome}
              onChange={setMonthlyIncome}
              placeholder="25000"
              helpText={t('common.monthlyIncome.help')}
            />
          </div>

          {/* Optional Fields - Collapsible */}
          <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowOptional(!showOptional)}
              className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {t('optional.title')}
                </span>
                <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">
                  {t('optional.badge')}
                </span>
              </div>
              {showOptional ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            <AnimatePresence>
              {showOptional && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-purple-50/50 dark:bg-purple-900/10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Age */}
                      <div className="relative group">
                        <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('optional.age')}
                        </label>
                        <input
                          id="age"
                          type="number"
                          min="18"
                          max="100"
                          value={age}
                          onChange={e => setAge(e.target.value)}
                          className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none"
                          placeholder="30"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {t('optional.age.help')}
                        </p>
                      </div>

                      {/* Monthly Expenses */}
                      <CurrencyInput
                        id="monthlyExpenses"
                        label={t('optional.expenses')}
                        value={monthlyExpenses}
                        onChange={setMonthlyExpenses}
                        placeholder="15000"
                        helpText={t('optional.expenses.help')}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Current Savings */}
                      <CurrencyInput
                        id="currentSavings"
                        label={t('optional.savings')}
                        value={currentSavings}
                        onChange={setCurrentSavings}
                        placeholder="50000"
                        helpText={t('optional.savings.help')}
                      />

                      {/* Emergency Fund Months */}
                      <div className="relative group">
                        <label htmlFor="emergencyMonths" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('optional.emergency')}
                        </label>
                        <input
                          id="emergencyMonths"
                          type="number"
                          min="0"
                          max="24"
                          value={emergencyMonths}
                          onChange={e => setEmergencyMonths(e.target.value)}
                          className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none"
                          placeholder="3"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {t('optional.emergency.help')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-purple-700 dark:text-purple-300">
                        {t('optional.aiNote')}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-emerald-500/30 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('common.calculating')}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Calculator className="w-5 h-5" />
                  {t('common.calculate')}
                </span>
              )}
            </button>
            {result && (
              <button 
                type="button"
                onClick={() => { setBalance(''); setApr(''); setMonthlyPayment(''); setResult(null); setError(null); }}
                className="px-8 py-4 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-600 rounded-xl font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all shadow-sm hover:shadow-md"
              >
                {t('common.reset')}
              </button>
            )}
          </div>
        </form>

        {error && (
          <div 
            role="alert" 
            aria-live="assertive"
            className="mt-6 p-5 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 border-l-4 border-red-500 rounded-xl animate-fade-in shadow-md"
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl" aria-hidden="true">⚠️</div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-red-800 dark:text-red-300 mb-2">ยอดจ่ายต่ำเกินไป</h3>
                <p className="text-sm text-red-700 dark:text-red-200 whitespace-pre-line leading-relaxed">{error}</p>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-6 animate-fade-in" role="region" aria-label="ผลการคำนวณ" aria-live="polite">
            {/* Success Message */}
            {saved && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 p-4 rounded-lg animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Save className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-2" />
                    <span className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">บันทึกผลการคำนวณเรียบร้อยแล้ว!</span>
                  </div>
                  <Link 
                    to="/dashboard" 
                    className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 underline"
                  >
                    {t('common.viewHistory')}
                  </Link>
                </div>
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-4 sm:p-6 rounded-xl shadow-md text-white">
                <div className="text-xs sm:text-sm opacity-90 mb-1">{t('credit.monthsToPayOff')}</div>
                <div className="text-2xl sm:text-3xl font-bold">
                  <CountUpNumber end={result.months} decimals={0} />
                  <span className="text-base sm:text-lg ml-1">{t('common.months')}</span>
                </div>
                <div className="text-xs sm:text-sm opacity-90 mt-1">≈ {(result.months / 12).toFixed(1)} {t('common.years')}</div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 border-2 border-emerald-200 dark:border-emerald-700 p-4 sm:p-6 rounded-xl shadow-md">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">{t('credit.totalPaid')}</div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  <CountUpNumber end={result.total_paid} />
                </div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">{t('common.currency')}</div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 border-2 border-red-200 dark:border-red-700 p-4 sm:p-6 rounded-xl shadow-md">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">{t('credit.totalInterest')}</div>
                <div className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
                  <CountUpNumber end={result.total_interest} />
                </div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">{t('common.currency')} ({((result.total_interest / Number(balance)) * 100).toFixed(1)}%)</div>
              </div>
            </div>

            {/* What-If Analysis */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl shadow-md border-2 border-blue-200 dark:border-blue-700">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{t('whatif.title')}</h3>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('whatif.extraPayment')}: <span className="text-blue-600 dark:text-blue-400 font-bold">{formatCurrency(extraPayment)}</span> {t('common.currency')}
                      <span className="text-gray-500 dark:text-gray-400 text-xs ml-2">({t('dashboard.totalPaid')} {formatCurrency(Number(monthlyPayment) + extraPayment)}/{t('common.months')})</span>
                    </label>
                    <input 
                      type="range" 
                      min="0" 
                      max={Number(monthlyIncome) || Number(monthlyPayment) * 2} 
                      step="100" 
                      value={extraPayment} 
                      onChange={(e) => setExtraPayment(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>0</span>
                      <span>{formatCurrency(Number(monthlyIncome) || Number(monthlyPayment) * 2)}</span>
                    </div>
                    <div className="mt-4 flex justify-center">
                        <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-semibold shadow-sm">
                            + {formatCurrency(extraPayment)} / {t('common.months')}
                        </div>
                    </div>
                  </div>

                  {whatIfResult && (
                    <>
                      {/* Mobile: Compact inline display */}
                      <div className="sm:hidden bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-100 dark:border-blue-800 shadow-sm animate-fade-in">
                        <div className="flex justify-between items-center gap-2 text-sm">
                          <div className="text-center flex-1">
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">💰 -{formatCurrency(whatIfResult.savedInterest)}</span>
                          </div>
                          <div className="text-gray-300 dark:text-gray-600">|</div>
                          <div className="text-center flex-1">
                            <span className="text-blue-600 dark:text-blue-400 font-bold">⏱️ -{whatIfResult.savedMonths} {t('common.months')}</span>
                          </div>
                        </div>
                      </div>
                      {/* Desktop: Full cards */}
                      <div className="hidden sm:grid sm:grid-cols-3 gap-4 animate-fade-in">
                         <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-100 dark:border-blue-800 shadow-sm">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('whatif.saveInterest')}</div>
                            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(whatIfResult.savedInterest)} {t('common.currency')}
                            </div>
                         </div>
                         <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-100 dark:border-blue-800 shadow-sm">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('whatif.fasterBy')}</div>
                            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                              {whatIfResult.savedMonths} {t('common.months')}
                            </div>
                            <div className="text-xs text-gray-400">
                              ({t('table.remaining')} {whatIfResult.months} {t('common.months')})
                            </div>
                         </div>
                         <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-100 dark:border-blue-800 shadow-sm">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('credit.totalInterest')}</div>
                            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                              {formatCurrency(whatIfResult.totalInterest)} {t('common.currency')}
                            </div>
                         </div>
                      </div>
                    </>
                  )}
                  {extraPayment === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center italic">
                      {t('whatif.hint')}
                    </p>
                  )}
                </div>
            </div>

            {/* Chart Section - Pie Chart Only (moved before AI for mobile) */}
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">{t('chart.pieTitle')}</h3>
                  {whatIfResult && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">✨ {t('whatif.title')}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={downloadCSV} 
                    className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 dark:bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 dark:hover:bg-emerald-800 shadow-sm hover:shadow-md transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>CSV</span>
                  </button>
                  <button 
                    onClick={() => printPaymentSchedule('credit-card', 
                      { balance: Number(balance), apr: Number(apr), monthly_payment: Number(monthlyPayment) },
                      result
                    )} 
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-800 shadow-sm hover:shadow-md transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
                <ResponsiveContainer width="100%" height={300} className="max-w-md">
                  <PieChart>
                    <Pie
                      data={[
                        { name: t('table.principal'), value: Number(balance) },
                        { name: t('table.interest'), value: whatIfResult ? whatIfResult.totalInterest : result.total_interest }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell key="cell-0" fill="#10b981" />
                      <Cell key="cell-1" fill="#ef4444" />
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value) + ` ${t('common.currency')}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Summary beside pie chart */}
                <div className="flex flex-col gap-4 min-w-[200px]">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400">{t('table.principal')}</div>
                    <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(Number(balance))} {t('common.currency')}</div>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400">{t('table.interest')}</div>
                    <div className="text-xl font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(whatIfResult ? whatIfResult.totalInterest : result.total_interest)} {t('common.currency')}
                    </div>
                    {whatIfResult && (
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                        💰 {t('whatif.saveInterest')} {formatCurrency(whatIfResult.savedInterest)} {t('common.currency')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 🧠 AI Financial Advisor v4.0 - Ultimate Edition */}
            {aiLoading && (
              <div className="bg-gradient-to-r from-purple-50 dark:from-purple-900/20 to-indigo-50 dark:to-indigo-900/20 p-6 rounded-xl shadow-md border-2 border-purple-200 dark:border-purple-700 animate-pulse">
                <div className="flex items-center space-x-3">
                  <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400 animate-spin" />
                  <p className="text-purple-700 dark:text-purple-300 font-semibold">{t('ai.analyzing')}</p>
                </div>
              </div>
            )}

            {aiAnalysis && (
              <div className={`p-4 sm:p-5 rounded-xl shadow-md border animate-fade-in ${
                aiAnalysis.insights?.severity === 'critical' ? 'bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-900/30 dark:via-orange-900/30 dark:to-yellow-900/30 border-red-300 dark:border-red-700' :
                aiAnalysis.insights?.severity === 'high' ? 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-900/30 dark:via-amber-900/30 dark:to-yellow-900/30 border-orange-300 dark:border-orange-700' :
                aiAnalysis.insights?.severity === 'medium' ? 'bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-900/30 dark:via-amber-900/30 dark:to-orange-900/30 border-yellow-300 dark:border-yellow-700' :
                'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/30 dark:via-teal-900/30 dark:to-cyan-900/30 border-emerald-300 dark:border-emerald-700'
              }`}>
                {/* Header Row */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg shadow ${
                      aiAnalysis.insights?.severity === 'critical' ? 'bg-gradient-to-br from-red-500 to-orange-500' :
                      aiAnalysis.insights?.severity === 'high' ? 'bg-gradient-to-br from-orange-500 to-amber-500' :
                      aiAnalysis.insights?.severity === 'medium' ? 'bg-gradient-to-br from-yellow-500 to-amber-500' :
                      'bg-gradient-to-br from-emerald-500 to-teal-500'
                    }`}>
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">{t('ai.v4.title')}</h3>
                      <p className="text-[10px] text-gray-500">v{aiAnalysis.version}</p>
                    </div>
                  </div>
                  {/* Severity Badge */}
                  <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                    aiAnalysis.insights?.severity === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                    aiAnalysis.insights?.severity === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' :
                    aiAnalysis.insights?.severity === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' :
                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                  }`}>
                    {aiAnalysis.insights?.severity === 'critical' ? t('ai.v4.riskCritical') :
                     aiAnalysis.insights?.severity === 'high' ? t('ai.v4.riskHigh') :
                     aiAnalysis.insights?.severity === 'medium' ? t('ai.v4.riskMedium') : t('ai.v4.riskLow')}
                  </div>
                </div>

                {/* Health Score + Risk Meter Row */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">{t('ai.v4.healthScore')}</span>
                      <span className={`text-xl font-bold ${
                        (aiAnalysis.financial_health?.health_score ?? 0) >= 70 ? 'text-emerald-600' :
                        (aiAnalysis.financial_health?.health_score ?? 0) >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>{aiAnalysis.financial_health?.health_score ?? 0}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className={`h-2 rounded-full transition-all duration-1000 ${
                        (aiAnalysis.financial_health?.health_score ?? 0) >= 70 ? 'bg-emerald-500' :
                        (aiAnalysis.financial_health?.health_score ?? 0) >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`} style={{ width: `${aiAnalysis.financial_health?.health_score ?? 0}%` }} />
                    </div>
                  </div>
                  <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">{t('ai.v4.riskLevel')}</span>
                      <span className={`text-xl font-bold ${
                        (aiAnalysis.insights?.risk_score ?? 0) >= 70 ? 'text-red-600' :
                        (aiAnalysis.insights?.risk_score ?? 0) >= 50 ? 'text-orange-600' :
                        (aiAnalysis.insights?.risk_score ?? 0) >= 30 ? 'text-yellow-600' : 'text-emerald-600'
                      }`}>{aiAnalysis.insights?.risk_score ?? 0}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className={`h-2 rounded-full transition-all duration-1000 ${
                        (aiAnalysis.insights?.risk_score ?? 0) >= 70 ? 'bg-red-500' :
                        (aiAnalysis.insights?.risk_score ?? 0) >= 50 ? 'bg-orange-500' :
                        (aiAnalysis.insights?.risk_score ?? 0) >= 30 ? 'bg-yellow-500' : 'bg-emerald-500'
                      }`} style={{ width: `${aiAnalysis.insights?.risk_score ?? 0}%` }} />
                    </div>
                  </div>
                </div>

                {/* Debt Analysis Row */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="text-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg relative">
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {extraPayment > 0 && whatIfResult ? whatIfResult.months : result?.months || aiAnalysis.debt_analysis?.debt_freedom_months}
                      <span className="text-xs text-gray-500 ml-1">{t('ai.v4.months')}</span>
                    </div>
                    <div className="text-xs text-gray-600">{t('ai.v4.debtFreedom')}</div>
                    {extraPayment > 0 && whatIfResult && whatIfResult.savedMonths > 0 && (
                      <div className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full">-{whatIfResult.savedMonths}</div>
                    )}
                  </div>
                  <div className="text-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                    <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(extraPayment > 0 ? extraPayment : aiAnalysis.debt_analysis?.smart_payment_boost)}
                    </div>
                    <div className="text-xs text-gray-600">{extraPayment > 0 ? t('ai.v4.extraPaymentWhatIf') : t('ai.v4.recommendedExtra')}</div>
                  </div>
                </div>

                {/* What-If Result */}
                {extraPayment > 0 && whatIfResult && (
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg border border-emerald-300 dark:border-emerald-600 mb-3">
                    <div className="text-sm text-emerald-800 dark:text-emerald-200">
                      {t('ai.v4.whatIfResult')} {t('ai.v4.fasterBy')} <b>{whatIfResult.savedMonths}</b> {t('ai.v4.months')} {t('ai.v4.saveAmount')} <b>{formatCurrency(whatIfResult.savedInterest)}</b>
                    </div>
                  </div>
                )}

                {/* 📊 Personalized Tips Section */}
                {aiAnalysis.insights?.tips && aiAnalysis.insights.tips.length > 0 && (
                  <div className="mb-3 p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg">
                    <div className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">{t('ai.v4.personalizedTips')}</div>
                    <div className="space-y-1.5">
                      {aiAnalysis.insights.tips.map((tip: string, i: number) => (
                        <div key={i} className="text-sm text-gray-700 dark:text-gray-300">{tip}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 💡 Action Cards */}
                {aiAnalysis.insights?.actions && aiAnalysis.insights.actions.length > 0 && (
                  <div className="mb-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 rounded-lg border border-amber-200 dark:border-amber-700">
                    <div className="text-xs font-bold text-amber-800 dark:text-amber-200 mb-2">{t('ai.v4.actionTips')}</div>
                    <div className="space-y-1.5">
                      {aiAnalysis.insights.actions.map((action: string, i: number) => (
                        <div key={i} className="text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
                          <span className="font-bold">{i + 1}.</span>
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strategy Row */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="text-xs text-gray-500 mb-1">{t('ai.v4.strategy')}</div>
                    <div className="font-semibold text-sm text-blue-700 dark:text-blue-300">{aiAnalysis.strategy?.payoff_strategy}</div>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                    <div className="text-xs text-gray-500 mb-1">{t('ai.v4.primaryAction')}</div>
                    <div className="font-semibold text-sm text-purple-700 dark:text-purple-300">{aiAnalysis.strategy?.primary_action}</div>
                  </div>
                </div>

                {/* Emergency Fund */}
                {(aiAnalysis.planning?.emergency_buffer_months ?? 0) > 0 && (
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                    {t('ai.v4.emergencyFund')} <b>{aiAnalysis.planning?.emergency_buffer_months}</b> {t('ai.v4.months')}
                  </div>
                )}
              </div>
            )}

            {/* Table Section */}
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('table.title')}</h3>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{t('table.month')}</th>
                        <th className="px-3 sm:px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{t('table.payment')}</th>
                        <th className="px-3 sm:px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">{t('table.interest')}</th>
                        <th className="px-3 sm:px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">{t('table.principal')}</th>
                        <th className="px-3 sm:px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{t('table.remaining')}</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {result.schedule && result.schedule.slice(0, 12).map((row: any) => (
                        <tr key={row.month} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{row.month}</td>
                          <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 text-right">{formatCurrency(row.payment)}</td>
                          <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm text-red-600 dark:text-red-400 text-right hidden sm:table-cell">{formatCurrency(row.interest)}</td>
                          <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm text-emerald-600 dark:text-emerald-400 text-right hidden sm:table-cell">{formatCurrency(row.principal)}</td>
                          <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100 text-right">{formatCurrency(row.remaining)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {result.schedule && result.schedule.length > 12 && (
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                  {t('table.showing')} 12 {t('table.outOf')} {result.schedule.length} {t('table.months')}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* AI Advisor Chatbot */}
      {result && (
        <AIAdvisor 
          balance={Number(balance)} 
          apr={Number(apr)} 
          currentPayment={Number(monthlyPayment)}
          monthlyIncome={Number(monthlyIncome) || 0}
        />
      )}
      {/* Sticky Mobile Summary */}
      {result && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-lg sm:hidden z-50 animate-slide-up">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">จ่ายทั้งหมด</div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatCurrency(result.total_paid)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 dark:text-gray-400">ดอกเบี้ยรวม</div>
              <div className="text-lg font-bold text-red-600 dark:text-red-400">{formatCurrency(result.total_interest)}</div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
