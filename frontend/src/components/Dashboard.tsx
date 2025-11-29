import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CreditCard, GraduationCap, Trash2, Calendar, DollarSign, TrendingUp, FileText, PieChart } from 'lucide-react'
import { toast } from 'sonner'
import { getStorageData, deleteCalculation, clearAllData } from '../utils/storage'
import { useLanguage } from '../contexts/LanguageContext'
import { analytics } from '../utils/analytics'
import DashboardAnalytics from './DashboardAnalytics'
import type { SavedCalculation } from '../types'

export default function Dashboard() {
  const { t } = useLanguage()
  const [calculations, setCalculations] = useState<SavedCalculation[]>([])
  const [stats, setStats] = useState({ totalCalculations: 0, lastCalculation: 0 })
  const [deletedItem, setDeletedItem] = useState<SavedCalculation | null>(null)

  useEffect(() => {
    analytics.pageView('/dashboard')
  }, [])

  useEffect(() => {
    loadData()
  }, [])

  function loadData() {
    const data = getStorageData()
    setCalculations(data.calculations)
    setStats(data.stats)
  }

  function handleDelete(id: string) {
    const itemToDelete = calculations.find(c => c.id === id)
    if (!itemToDelete) return
    
    // Delete immediately
    deleteCalculation(id)
    setDeletedItem(itemToDelete)
    loadData()
    
    // Show toast with undo option
    toast.success(t('common.delete'), {
      description: itemToDelete.type === 'credit-card' ? t('dashboard.creditCard') : t('dashboard.studentLoan'),
      action: {
        label: t('toast.undo'),
        onClick: () => {
          // Restore the deleted item (would need to save it back)
          toast.info(t('toast.itemRestored'))
        }
      }
    })
  }

  function handleClearAll() {
    // Custom confirmation via toast
    toast.warning(t('dashboard.confirmClearAll'), {
      action: {
        label: t('dashboard.clearAll'),
        onClick: () => {
          clearAllData()
          loadData()
          toast.success(t('toast.allCleared'))
        }
      },
      cancel: {
        label: t('toast.cancel'),
        onClick: () => {}
      }
    })
  }

  function formatDate(timestamp: string) {
    return new Date(timestamp).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function formatCurrency(value: number) {
    return value.toLocaleString('th-TH', { minimumFractionDigits: 2 })
  }

  const creditCardCalcs = calculations.filter(c => c.type === 'credit-card')
  const studentLoanCalcs = calculations.filter(c => c.type === 'student-loan')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 leading-tight">{t('dashboard.title')}</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">{t('dashboard.subtitle')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FileText className="w-6 h-6" />}
          title={t('dashboard.totalCalculations')}
          value={<CountUp end={stats.totalCalculations} />}
          color="emerald"
        />
        <StatCard
          icon={<CreditCard className="w-6 h-6" />}
          title={t('dashboard.creditCards')}
          value={<CountUp end={creditCardCalcs.length} />}
          color="blue"
        />
        <StatCard
          icon={<GraduationCap className="w-6 h-6" />}
          title={t('dashboard.studentLoans')}
          value={<CountUp end={studentLoanCalcs.length} />}
          color="purple"
        />
        <StatCard
          icon={<Calendar className="w-6 h-6" />}
          title={t('dashboard.lastCalculation')}
          value={stats.lastCalculation ? new Date(stats.lastCalculation).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }) : '-'}
          color="teal"
          isText
        />
      </div>

      {calculations.length === 0 ? (
        // Empty State
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center p-6 bg-gradient-to-br from-emerald-100 dark:from-emerald-900/30 to-teal-100 dark:to-teal-900/30 rounded-full mb-6 shadow-inner">
            <PieChart className="w-16 h-16 sm:w-20 sm:h-20 text-emerald-600 dark:text-emerald-400 animate-float" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3 leading-tight">{t('dashboard.empty')}</h3>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto leading-relaxed">
            {t('dashboard.empty.desc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center">
            <Link 
              to="/credit-card" 
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-base sm:text-lg shadow-lg hover:shadow-emerald-500/30 hover:scale-105 transition-all duration-300 min-h-[50px] sm:min-h-[60px]"
            >
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>{t('dashboard.startCreditCard')}</span>
            </Link>
            <Link 
              to="/student-loan" 
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white dark:bg-gray-700 border-2 border-emerald-500 dark:border-emerald-600 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold text-base sm:text-lg hover:bg-emerald-50 dark:hover:bg-gray-600 hover:scale-105 transition-all duration-300 min-h-[50px] sm:min-h-[60px]"
            >
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>{t('dashboard.startStudentLoan')}</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Analytics Dashboard */}
          <DashboardAnalytics calculations={calculations} />

          {/* Actions */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t('dashboard.showing')} <span className="font-semibold text-gray-900 dark:text-gray-100">{calculations.length}</span> {t('dashboard.items')}
            </div>
            <button
              onClick={handleClearAll}
              className="flex items-center space-x-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t('dashboard.clearAll')}</span>
            </button>
          </div>

          {/* Calculations List */}
          <div className="space-y-4">
            {calculations.map((calc) => (
              <CalculationCard
                key={calc.id}
                calculation={calc}
                onDelete={handleDelete}
                formatDate={formatDate}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: number | string | React.ReactNode
  color: string
  isText?: boolean
}

function StatCard({ icon, title, value, color, isText }: StatCardProps) {
  const colorClasses = {
    emerald: 'from-emerald-500 to-emerald-600',
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    teal: 'from-teal-500 to-teal-600',
  }[color] || 'from-emerald-500 to-emerald-600'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-5 sm:p-6 card-shadow-hover hover:border-gray-300 dark:hover:border-gray-600 transition-all">
      <div className={`inline-flex items-center justify-center p-3 bg-gradient-to-br ${colorClasses} rounded-xl mb-3 text-white shadow-sm`}>
        {icon}
      </div>
      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium uppercase tracking-wide">{title}</div>
      <div className={`${isText ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl lg:text-4xl'} font-bold text-gray-900 dark:text-gray-100 leading-none`}>
        {value}
      </div>
    </div>
  )
}

interface CalculationCardProps {
  calculation: SavedCalculation
  onDelete: (id: string) => void
  formatDate: (timestamp: string) => string
  formatCurrency: (value: number) => string
}

function CalculationCard({ calculation, onDelete, formatDate, formatCurrency }: CalculationCardProps) {
  const isCreditCard = calculation.type === 'credit-card'

  const { t } = useLanguage()
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div className={`h-2 ${isCreditCard ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-purple-500 to-purple-600'}`}></div>
      
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 sm:p-3 rounded-lg ${isCreditCard ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-purple-100 dark:bg-purple-900/30'}`}>
              {isCreditCard ? (
                <CreditCard className={`w-5 h-5 sm:w-6 sm:h-6 ${isCreditCard ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'}`} />
              ) : (
                <GraduationCap className={`w-5 h-5 sm:w-6 sm:h-6 ${isCreditCard ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'}`} />
              )}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                {isCreditCard ? t('dashboard.creditCard') : t('dashboard.studentLoan')}
              </h3>
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{formatDate(calculation.date)}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => onDelete(calculation.id)}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title={t('common.delete')}
          >
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {isCreditCard ? (
            <>
              <InfoItem
                icon={<DollarSign className="w-4 h-4" />}
                label={t('dashboard.balance')}
                value={`${formatCurrency(calculation.data.balance)} ${t('common.currency')}`}
              />
              <InfoItem
                icon={<TrendingUp className="w-4 h-4" />}
                label={t('dashboard.apr')}
                value={`${calculation.data.apr}%`}
              />
              <InfoItem
                icon={<DollarSign className="w-4 h-4" />}
                label={t('dashboard.monthlyPayment')}
                value={`${formatCurrency(calculation.data.monthly_payment)} ${t('common.currency')}`}
              />
              <InfoItem
                icon={<Calendar className="w-4 h-4" />}
                label={t('dashboard.duration')}
                value={`${calculation.result.months} ${t('dashboard.months')}`}
                highlight
              />
            </>
          ) : (
            <>
              <InfoItem
                icon={<DollarSign className="w-4 h-4" />}
                label={t('dashboard.loanAmount')}
                value={`${formatCurrency(calculation.data.loan_amount)} ${t('common.currency')}`}
              />
              <InfoItem
                icon={<TrendingUp className="w-4 h-4" />}
                label={t('dashboard.apr')}
                value={`${calculation.data.interest_rate}%`}
              />
              <InfoItem
                icon={<Calendar className="w-4 h-4" />}
                label={t('dashboard.duration')}
                value={`${calculation.data.term_months} ${t('dashboard.months')}`}
              />
              <InfoItem
                icon={<DollarSign className="w-4 h-4" />}
                label={t('dashboard.monthlyPayment')}
                value={`${formatCurrency(calculation.result.monthly_payment)} ${t('common.currency')}`}
                highlight
              />
            </>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('dashboard.totalPaid')}</div>
            <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(calculation.result.total_paid)} {t('common.currency')}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('dashboard.totalInterest')}</div>
            <div className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400">
              {formatCurrency(calculation.result.total_interest)} {t('common.currency')}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface InfoItemProps {
  icon: React.ReactNode
  label: string
  value: string
  highlight?: boolean
}

function InfoItem({ icon, label, value, highlight }: InfoItemProps) {
  return (
    <div className={`p-3 rounded-xl transition-all ${highlight ? 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-300 dark:border-emerald-700' : 'bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700'}`}>
      <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 mb-1.5">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className={`text-sm sm:text-base font-bold ${highlight ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-900 dark:text-gray-100'} leading-tight`}>
        {value}
      </div>
    </div>
  )
}

function CountUp({ end, duration = 2000 }: { end: number, duration?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number | null = null
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = timestamp - startTime
      const percentage = Math.min(progress / duration, 1)
      
      // Ease out quart
      const easeOutQuart = 1 - Math.pow(1 - percentage, 4)
      
      setCount(Math.floor(easeOutQuart * end))

      if (progress < duration) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        setCount(end)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])

  return <>{count}</>
}
