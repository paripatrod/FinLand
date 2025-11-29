import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Calculator, 
  Sparkles, 
  TrendingUp, 
  Download,
  CreditCard,
  GraduationCap,
  CheckCircle,
  Play
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Link, useNavigate } from 'react-router-dom';

interface TutorialStep {
  id: number;
  icon: React.ReactNode;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  animation: 'calculator' | 'ai' | 'chart' | 'export';
  color: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    icon: <Calculator className="w-12 h-12" />,
    title: 'ยินดีต้อนรับสู่ FinLand! 🎉',
    titleEn: 'Welcome to FinLand! 🎉',
    description: 'มาเริ่มวางแผนปลดหนี้กันเถอะ! กดปุ่ม "ถัดไป" เพื่อเรียนรู้วิธีใช้งาน',
    descriptionEn: 'Let\'s start planning to pay off your debt! Click "Next" to learn how to use the app',
    animation: 'calculator',
    color: 'emerald'
  },
  {
    id: 2,
    icon: <CreditCard className="w-12 h-12" />,
    title: 'ขั้นตอนที่ 1: เลือกประเภทหนี้',
    titleEn: 'Step 1: Select Debt Type',
    description: 'ไปที่เมนู แล้วเลือก "บัตรเครดิต" หรือ "กยศ." ตามประเภทหนี้ที่คุณมี',
    descriptionEn: 'Go to the menu and select "Credit Card" or "Student Loan" based on your debt type',
    animation: 'calculator',
    color: 'blue'
  },
  {
    id: 3,
    icon: <TrendingUp className="w-12 h-12" />,
    title: 'ขั้นตอนที่ 2: กรอกข้อมูลหนี้',
    titleEn: 'Step 2: Enter Your Debt Info',
    description: 'กรอกยอดหนี้ อัตราดอกเบี้ย และยอดที่จ่ายต่อเดือน แล้วกด "คำนวณ"',
    descriptionEn: 'Enter your balance, interest rate, and monthly payment, then click "Calculate"',
    animation: 'chart',
    color: 'purple'
  },
  {
    id: 4,
    icon: <Sparkles className="w-12 h-12" />,
    title: 'ขั้นตอนที่ 3: ดูผลลัพธ์ & คำแนะนำ',
    titleEn: 'Step 3: View Results & Tips',
    description: 'ดูว่าต้องผ่อนกี่เดือน จ่ายดอกเบี้ยเท่าไหร่ พร้อมรับคำแนะนำจาก AI!',
    descriptionEn: 'See how many months to pay off, total interest, and get AI recommendations!',
    animation: 'ai',
    color: 'teal'
  }
];

// Animation components for each step
function CalculatorAnimation() {
  return (
    <motion.div className="relative w-48 h-36 sm:w-64 sm:h-48 mx-auto">
      {/* Calculator form mockup */}
      <motion.div 
        className="absolute inset-0 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 sm:p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Input fields */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-8 bg-gray-100 dark:bg-gray-700 rounded-lg mb-3"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.3 + i * 0.2, duration: 0.4 }}
          />
        ))}
        {/* Button */}
        <motion.div
          className="h-10 bg-emerald-500 rounded-lg flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: 'spring' }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <Calculator className="w-5 h-5 text-white" />
          </motion.div>
        </motion.div>
      </motion.div>
      
      {/* Floating icons */}
      <motion.div
        className="absolute -top-4 -right-4 p-2 bg-blue-500 rounded-full"
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <CreditCard className="w-5 h-5 text-white" />
      </motion.div>
      <motion.div
        className="absolute -bottom-4 -left-4 p-2 bg-purple-500 rounded-full"
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
      >
        <GraduationCap className="w-5 h-5 text-white" />
      </motion.div>
    </motion.div>
  );
}

function ChartAnimation() {
  const bars = [40, 70, 55, 85, 45, 90, 60];
  
  return (
    <motion.div className="w-48 h-36 sm:w-64 sm:h-48 mx-auto flex items-end justify-center gap-1 sm:gap-2">
      {bars.map((height, i) => (
        <motion.div
          key={i}
          className="w-4 sm:w-6 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg"
          initial={{ height: 0 }}
          animate={{ height: `${height}%` }}
          transition={{ delay: i * 0.1, duration: 0.5, type: 'spring' }}
        />
      ))}
      {/* Trend line */}
      <motion.svg
        className="absolute w-full h-full pointer-events-none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <motion.path
          d="M20 120 Q80 80 140 100 T260 40"
          fill="none"
          stroke="#10b981"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1, duration: 1.5 }}
        />
      </motion.svg>
    </motion.div>
  );
}

function AIAnimation() {
  return (
    <motion.div className="relative w-48 h-36 sm:w-64 sm:h-48 mx-auto flex items-center justify-center">
      {/* Central AI icon */}
      <motion.div
        className="relative z-10 p-4 sm:p-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg"
        animate={{ 
          boxShadow: [
            '0 0 20px rgba(139, 92, 246, 0.3)',
            '0 0 40px rgba(139, 92, 246, 0.6)',
            '0 0 20px rgba(139, 92, 246, 0.3)'
          ]
        }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
      </motion.div>
      
      {/* Orbiting particles */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 bg-purple-400 rounded-full"
          animate={{
            rotate: 360,
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            delay: i * 0.5,
            ease: 'linear'
          }}
          style={{
            transformOrigin: '32px 32px',
            left: 'calc(50% - 6px)',
            top: 'calc(50% - 6px)',
          }}
        />
      ))}
      
      {/* Analysis text */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ repeat: Infinity, duration: 3 }}
      >
        <span className="text-sm text-purple-600 dark:text-purple-400 font-mono">
          Analyzing profile...
        </span>
      </motion.div>
    </motion.div>
  );
}

function ExportAnimation() {
  return (
    <motion.div className="relative w-48 h-36 sm:w-64 sm:h-48 mx-auto flex items-center justify-center">
      {/* Document */}
      <motion.div
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 sm:p-4 w-32 sm:w-40"
        initial={{ y: 0 }}
        animate={{ y: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 2, delay: 1 }}
      >
        {/* Document lines */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="h-2 bg-gray-200 dark:bg-gray-700 rounded mb-2"
            initial={{ width: 0 }}
            animate={{ width: i === 3 ? '60%' : '100%' }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.3 }}
          />
        ))}
        
        {/* Download icon */}
        <motion.div
          className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 p-2 bg-teal-500 rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: 'spring' }}
        >
          <Download className="w-5 h-5 text-white" />
        </motion.div>
      </motion.div>
      
      {/* Format badges */}
      <motion.div
        className="absolute top-4 left-4 px-2 py-1 bg-green-500 text-white text-xs rounded font-bold"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2 }}
      >
        CSV
      </motion.div>
      <motion.div
        className="absolute top-4 right-4 px-2 py-1 bg-red-500 text-white text-xs rounded font-bold"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.4 }}
      >
        PDF
      </motion.div>
    </motion.div>
  );
}

const animations: Record<string, React.FC> = {
  calculator: CalculatorAnimation,
  chart: ChartAnimation,
  ai: AIAnimation,
  export: ExportAnimation
};

export default function OnboardingTutorial() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has seen tutorial
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (hasSeenTutorial === 'true') {
      setIsVisible(false);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('hasSeenTutorial', 'true');
    setIsVisible(false);
    navigate('/');
  };

  const handleSkip = () => {
    localStorage.setItem('hasSeenTutorial', 'true');
    setIsVisible(false);
    navigate('/');
  };

  const step = tutorialSteps[currentStep];
  const AnimationComponent = animations[step.animation];

  const colorClasses: Record<string, string> = {
    emerald: 'from-emerald-500 to-emerald-600',
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-indigo-600',
    teal: 'from-teal-500 to-teal-600'
  };

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Progress bar */}
        <div className="sticky top-0 z-10 h-2 bg-gray-100 dark:bg-gray-700">
          <motion.div
            className={`h-full bg-gradient-to-r ${colorClasses[step.color]}`}
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5 text-emerald-500" />
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {t('tutorial.title')}
            </span>
          </div>
          <button
            onClick={handleSkip}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              {/* Step indicator */}
              <div className="flex justify-center gap-2 mb-6">
                {tutorialSteps.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index === currentStep
                        ? `bg-gradient-to-r ${colorClasses[step.color]}`
                        : index < currentStep
                        ? 'bg-emerald-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    animate={index === currentStep ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                ))}
              </div>

              {/* Icon */}
              <motion.div
                className={`inline-flex items-center justify-center p-4 bg-gradient-to-br ${colorClasses[step.color]} rounded-2xl text-white mb-6 shadow-lg`}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 15 }}
              >
                {step.icon}
              </motion.div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4 px-2">
                {language === 'th' ? step.title : step.titleEn}
              </h2>

              {/* Description */}
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-md mx-auto px-2">
                {language === 'th' ? step.description : step.descriptionEn}
              </p>

              {/* Animation */}
              <div className="h-40 sm:h-52 flex items-center justify-center">
                <AnimationComponent />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all text-sm sm:text-base ${
              currentStep === 0
                ? 'opacity-50 cursor-not-allowed text-gray-400'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">{t('tutorial.back')}</span>
          </button>

          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {currentStep + 1} / {tutorialSteps.length}
          </span>

          <button
            onClick={handleNext}
            className={`flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r ${colorClasses[step.color]} text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all text-sm sm:text-base`}
          >
            {currentStep === tutorialSteps.length - 1 ? (
              <>
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{t('tutorial.start')}</span>
              </>
            ) : (
              <>
                <span>{t('tutorial.next')}</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
