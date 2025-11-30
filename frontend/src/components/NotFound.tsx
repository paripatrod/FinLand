import { Link } from 'react-router-dom'
import { Home, Calculator, Search, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'

export default function NotFound() {
  const { language } = useLanguage()
  
  const content = {
    th: {
      title: '404',
      subtitle: 'ไม่พบหน้าที่คุณต้องการ',
      description: 'หน้าที่คุณกำลังมองหาอาจถูกย้าย ลบไป หรือไม่เคยมีอยู่',
      home: 'กลับหน้าแรก',
      creditCard: 'คำนวณบัตรเครดิต',
      studentLoan: 'คำนวณ กยศ.',
      goBack: 'ย้อนกลับ'
    },
    en: {
      title: '404',
      subtitle: 'Page Not Found',
      description: 'The page you are looking for might have been moved, deleted, or never existed.',
      home: 'Go Home',
      creditCard: 'Credit Card Calculator',
      studentLoan: 'Student Loan Calculator',
      goBack: 'Go Back'
    }
  }
  
  const t = content[language as keyof typeof content] || content.th

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg"
      >
        {/* 404 Number */}
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="relative"
        >
          <h1 className="text-[150px] sm:text-[200px] font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 leading-none select-none">
            {t.title}
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="w-16 h-16 sm:w-24 sm:h-24 text-emerald-500/30 animate-pulse" />
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3">
            {t.subtitle}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {t.description}
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 justify-center mb-6"
        >
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-emerald-500/30"
          >
            <Home className="w-5 h-5" />
            {t.home}
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            {t.goBack}
          </button>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="pt-6 border-t border-gray-200 dark:border-gray-700"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">หรือลองใช้เครื่องมือของเรา:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/credit-card"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors text-sm"
            >
              <Calculator className="w-4 h-4 text-emerald-500" />
              {t.creditCard}
            </Link>
            <Link
              to="/student-loan"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors text-sm"
            >
              <Calculator className="w-4 h-4 text-teal-500" />
              {t.studentLoan}
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
