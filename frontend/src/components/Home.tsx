import React from 'react'
import { Link } from 'react-router-dom'
import { CreditCard, GraduationCap, TrendingUp, Calculator, CheckCircle, Sparkles, PlayCircle } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { motion } from 'framer-motion'

export default function Home(){
  const { t } = useLanguage()
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  }

  return (
    <motion.div 
      className="space-y-12 sm:space-y-16 lg:space-y-20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Hero Section */}
      <section className="text-center section-spacing container-padding">
        <motion.div 
          className="inline-block p-4 sm:p-5 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl mb-6 sm:mb-8 shadow-md"
          variants={itemVariants}
        >
          <Calculator className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-emerald-600 dark:text-emerald-400" />
        </motion.div>
        <motion.h1 
          className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6 sm:mb-8 px-4 leading-tight"
          variants={itemVariants}
        >
          {t('home.title')}
        </motion.h1>
        <motion.p 
          className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto px-4 mb-2 sm:mb-3 leading-relaxed"
          variants={itemVariants}
        >
          {t('home.subtitle')}
        </motion.p>
        <motion.p 
          className="text-base sm:text-lg lg:text-xl text-emerald-600 dark:text-emerald-400 font-semibold px-4 mb-10 sm:mb-12"
          variants={itemVariants}
        >
          {t('home.tagline')}
        </motion.p>
        
        <motion.div 
          className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center items-center px-4 max-w-2xl mx-auto"
          variants={itemVariants}
        >
          <Link 
            to="/credit-card" 
            className="w-full sm:w-auto min-h-[56px] px-8 sm:px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3 text-base sm:text-lg"
          >
            <CreditCard className="w-6 h-6" />
            <span>{t('home.calcCredit')}</span>
          </Link>
          <Link 
            to="/student-loan" 
            className="w-full sm:w-auto min-h-[56px] px-8 sm:px-10 py-4 bg-white dark:bg-gray-700 border-2 border-emerald-500 dark:border-emerald-400 text-emerald-600 dark:text-emerald-400 rounded-xl font-semibold hover:bg-emerald-50 dark:hover:bg-gray-600 transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3 text-base sm:text-lg shadow-md hover:shadow-lg"
          >
            <GraduationCap className="w-6 h-6" />
            <span>{t('home.calcStudent')}</span>
          </Link>
        </motion.div>
        
        {/* Tutorial Button */}
        <motion.div 
          className="mt-6 flex justify-center"
          variants={itemVariants}
        >
          <Link 
            to="/tutorial" 
            className="inline-flex items-center gap-2 px-5 py-2.5 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors group"
          >
            <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>{t('home.tutorial') || 'ดู Tutorial วิธีใช้งาน'}</span>
          </Link>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="container-padding">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-7">
          <FeatureCard
            icon={<Calculator className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9" />}
            title={t('feature.accurate')}
            description={t('feature.accurate.desc')}
            color="emerald"
          />
          <FeatureCard
            icon={<Sparkles className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9" />}
            title={t('feature.ai')}
            description={t('feature.ai.desc')}
            color="purple"
          />
          <FeatureCard
            icon={<TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9" />}
            title={t('feature.chart')}
            description={t('feature.chart.desc')}
            color="blue"
          />
          <FeatureCard
            icon={<CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9" />}
            title={t('feature.csv')}
            description={t('feature.csv.desc')}
            color="teal"
          />
          <FeatureCard
            icon={<CreditCard className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9" />}
            title={t('feature.credit')}
            description={t('feature.credit.desc')}
            color="emerald"
          />
          <FeatureCard
            icon={<GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9" />}
            title={t('feature.student')}
            description={t('feature.student.desc')}
            color="indigo"
          />
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="container-padding">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* How to Use */}
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 lg:p-10 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 sm:mb-8 flex items-center">
                <span className="inline-block w-2 h-8 sm:h-10 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full mr-3 sm:mr-4"></span>
                {t('howto.title')}
              </h2>
              <ol className="space-y-5 sm:space-y-6">
                <HowToStep number={1} text={t('howto.step1')} />
                <HowToStep number={2} text={t('howto.step2')} />
                <HowToStep number={3} text={t('howto.step3')} />
                <HowToStep number={4} text={t('howto.step4')} />
                <HowToStep number={5} text={t('howto.step5')} />
              </ol>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 p-8 sm:p-10 lg:p-12 rounded-2xl shadow-xl text-white">
              <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{t('cta.title')}</h3>
              <p className="text-base sm:text-lg text-emerald-50 dark:text-emerald-100 mb-8 sm:mb-10">{t('cta.subtitle')}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/credit-card" 
                  className="min-h-[56px] px-8 py-4 bg-white dark:bg-gray-100 text-emerald-600 dark:text-emerald-700 rounded-xl font-semibold hover:bg-emerald-50 dark:hover:bg-white transition-all duration-200 text-center text-base sm:text-lg shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  {t('cta.startCredit')}
                </Link>
                <Link 
                  to="/student-loan" 
                  className="min-h-[56px] px-8 py-4 bg-emerald-600 dark:bg-emerald-700 text-white rounded-xl font-semibold hover:bg-emerald-700 dark:hover:bg-emerald-800 border-2 border-white transition-all duration-200 text-center text-base sm:text-lg shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  {t('cta.startStudent')}
                </Link>
                <Link 
                  to="/dashboard" 
                  className="min-h-[56px] px-8 py-4 bg-purple-600 dark:bg-purple-700 text-white rounded-xl font-semibold hover:bg-purple-700 dark:hover:bg-purple-800 border-2 border-white transition-all duration-200 text-center text-base sm:text-lg shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  {t('cta.viewHistory')}
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 dark:border-amber-500 p-5 sm:p-6 rounded-xl shadow-md">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0 text-2xl sm:text-3xl">
                  ⚠️
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-amber-800 dark:text-amber-300 mb-2">{t('warning.title')}</h3>
                  <p className="text-sm sm:text-base text-amber-700 dark:text-amber-200 leading-relaxed">
                    {t('warning.text')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-700 p-5 sm:p-6 rounded-xl shadow-sm">
              <h3 className="text-base sm:text-lg font-bold text-emerald-900 dark:text-emerald-300 mb-4 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                {t('tips.title')}
              </h3>
              <ul className="text-sm sm:text-base text-emerald-800 dark:text-emerald-200 space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold mt-1">•</span>
                  <span className="leading-relaxed">{t('tips.1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold mt-1">•</span>
                  <span className="leading-relaxed">{t('tips.2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold mt-1">•</span>
                  <span className="leading-relaxed">{t('tips.3')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  const colorClasses = {
    emerald: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    blue: 'from-blue-500 to-blue-600',
    teal: 'from-teal-500 to-teal-600',
    indigo: 'from-indigo-500 to-indigo-600',
  }[color] || 'from-emerald-500 to-emerald-600';

  return (
    <div className="bg-white dark:bg-gray-800 p-6 sm:p-7 lg:p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 h-full transition-all duration-200 hover:shadow-lg">
      <div className={`inline-flex items-center justify-center p-3 sm:p-4 bg-gradient-to-br ${colorClasses} rounded-xl mb-4 sm:mb-5 text-white shadow-lg`}>
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">{title}</h3>
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
    </div>
  );
}

interface HowToStepProps {
  number: number;
  text: string;
}

function HowToStep({ number, text }: HowToStepProps) {
  return (
    <li className="flex items-start gap-4 sm:gap-5">
      <span className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full font-bold text-base sm:text-lg shadow-md">
        {number}
      </span>
      <span className="flex-1 text-base sm:text-lg text-gray-700 dark:text-gray-300 pt-2 sm:pt-3 leading-relaxed">{text}</span>
    </li>
  );
}
