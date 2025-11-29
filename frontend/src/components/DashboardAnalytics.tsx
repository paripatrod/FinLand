import React, { useMemo } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, Calendar, CreditCard, GraduationCap } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import type { SavedCalculation } from '../types'

interface DashboardAnalyticsProps {
  calculations: SavedCalculation[]
}

export default function DashboardAnalytics({ calculations }: DashboardAnalyticsProps) {
  const { t } = useLanguage()

  const analytics = useMemo(() => {
    const creditCardCalcs = calculations.filter(c => c.type === 'credit-card')
    const studentLoanCalcs = calculations.filter(c => c.type === 'student-loan')

    const totalDebt = calculations.reduce((sum, c) => {
      return sum + (c.data.balance || c.data.loan_amount || 0)
    }, 0)

    const totalInterest = calculations.reduce((sum, c) => {
      return sum + (c.result.total_interest || 0)
    }, 0)

    const avgAPR = calculations.length > 0
      ? calculations.reduce((sum, c) => sum + (c.data.apr || c.data.interest_rate || 0), 0) / calculations.length
      : 0

    const avgMonths = calculations.length > 0
      ? calculations.reduce((sum, c) => sum + (c.result.months || c.data.term_months || 0), 0) / calculations.length
      : 0

    // Monthly trend
    const monthlyData = calculations.reduce((acc, calc) => {
      const date = new Date(calc.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, count: 0, totalDebt: 0 }
      }
      acc[monthKey].count += 1
      acc[monthKey].totalDebt += (calc.data.balance || calc.data.loan_amount || 0)
      return acc
    }, {} as Record<string, any>)

    const trendData = Object.values(monthlyData).sort((a: any, b: any) => a.month.localeCompare(b.month))

    // Type distribution
    const typeData = [
      { name: t('dashboard.creditCard'), value: creditCardCalcs.length, color: '#3b82f6' },
      { name: t('dashboard.studentLoan'), value: studentLoanCalcs.length, color: '#8b5cf6' }
    ]

    // Interest comparison
    const interestData = calculations.slice(0, 10).map((c, i) => ({
      name: `#${i + 1}`,
      principal: c.data.balance || c.data.loan_amount || 0,
      interest: c.result.total_interest || 0
    }))

    return {
      totalDebt,
      totalInterest,
      avgAPR,
      avgMonths,
      creditCardCount: creditCardCalcs.length,
      studentLoanCount: studentLoanCalcs.length,
      trendData,
      typeData: typeData.filter(d => d.value > 0),
      interestData
    }
  }, [calculations, t])

  if (calculations.length === 0) return null

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<DollarSign className="w-5 h-5" />}
          label={t('dashboard.totalDebt')}
          value={`${analytics.totalDebt.toLocaleString()} ${t('common.currency')}`}
          color="blue"
        />
        <MetricCard
          icon={<TrendingUp className="w-5 h-5" />}
          label={t('dashboard.totalInterest')}
          value={`${analytics.totalInterest.toLocaleString()} ${t('common.currency')}`}
          color="red"
        />
        <MetricCard
          icon={<TrendingUp className="w-5 h-5" />}
          label={t('dashboard.avgAPR')}
          value={`${analytics.avgAPR.toFixed(2)}%`}
          color="yellow"
        />
        <MetricCard
          icon={<Calendar className="w-5 h-5" />}
          label={t('dashboard.avgDuration')}
          value={`${Math.round(analytics.avgMonths)} ${t('dashboard.months')}`}
          color="green"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Type Distribution */}
        {analytics.typeData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('dashboard.distribution')}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analytics.typeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Monthly Trend */}
        {analytics.trendData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('dashboard.trend')}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} name={t('dashboard.calculations')} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Interest Comparison */}
      {analytics.interestData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('dashboard.interestComparison')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.interestData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toLocaleString()} ${t('common.currency')}`} />
              <Legend />
              <Bar dataKey="principal" fill="#10b981" name={t('dashboard.principal')} />
              <Bar dataKey="interest" fill="#ef4444" name={t('dashboard.interest')} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: string
  color: 'blue' | 'red' | 'yellow' | 'green'
}

function MetricCard({ icon, label, value, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    red: 'from-red-500 to-red-600',
    yellow: 'from-yellow-500 to-yellow-600',
    green: 'from-emerald-500 to-emerald-600'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-shadow">
      <div className={`inline-flex items-center justify-center p-3 bg-gradient-to-br ${colorClasses[color]} rounded-xl mb-3 text-white shadow-sm`}>
        {icon}
      </div>
      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">{label}</div>
      <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
    </div>
  )
}
