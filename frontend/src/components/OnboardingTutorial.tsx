import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Calculator, 
  Sparkles, 
  TrendingUp, 
  CreditCard,
  GraduationCap,
  CheckCircle,
  ArrowRight,
  Wallet,
  PiggyBank,
  Target
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface TutorialStep {
  id: number;
  icon: React.ReactNode;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  emoji: string;
  gradient: string;
  bgPattern: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    icon: <Wallet className="w-8 h-8" />,
    title: 'ยินดีต้อนรับสู่ FinLand!',
    titleEn: 'Welcome to FinLand!',
    description: 'เครื่องมือช่วยวางแผนปลดหนี้ที่ง่ายและฉลาด พร้อม AI ช่วยวิเคราะห์',
    descriptionEn: 'Smart debt planning tool with AI-powered analysis',
    emoji: '👋',
    gradient: 'from-emerald-400 via-emerald-500 to-teal-600',
    bgPattern: 'radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(20, 184, 166, 0.15) 0%, transparent 50%)'
  },
  {
    id: 2,
    icon: <CreditCard className="w-8 h-8" />,
    title: 'เลือกประเภทหนี้',
    titleEn: 'Select Your Debt Type',
    description: 'เลือก "บัตรเครดิต" หรือ "กยศ." จากเมนูด้านบน',
    descriptionEn: 'Choose "Credit Card" or "Student Loan" from the menu',
    emoji: '💳',
    gradient: 'from-blue-400 via-blue-500 to-indigo-600',
    bgPattern: 'radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)'
  },
  {
    id: 3,
    icon: <Calculator className="w-8 h-8" />,
    title: 'กรอกข้อมูลหนี้',
    titleEn: 'Enter Your Debt Info',
    description: 'ใส่ยอดหนี้ ดอกเบี้ย และยอดผ่อนต่อเดือน แล้วกด "คำนวณ"',
    descriptionEn: 'Fill in balance, interest rate, monthly payment & click "Calculate"',
    emoji: '📝',
    gradient: 'from-violet-400 via-purple-500 to-purple-600',
    bgPattern: 'radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)'
  },
  {
    id: 4,
    icon: <Sparkles className="w-8 h-8" />,
    title: 'รับคำแนะนำจาก AI',
    titleEn: 'Get AI Recommendations',
    description: 'ดูผลลัพธ์พร้อมคำแนะนำส่วนตัวจาก AI เพื่อปลดหนี้เร็วขึ้น!',
    descriptionEn: 'View results with personalized AI tips to pay off debt faster!',
    emoji: '✨',
    gradient: 'from-amber-400 via-orange-500 to-rose-500',
    bgPattern: 'radial-gradient(circle at 80% 80%, rgba(251, 191, 36, 0.15) 0%, transparent 50%), radial-gradient(circle at 20% 20%, rgba(244, 63, 94, 0.15) 0%, transparent 50%)'
  }
];

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

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/60 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="relative w-full max-w-md overflow-hidden"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {/* Main Card */}
        <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Background Pattern */}
          <div 
            className="absolute inset-0 opacity-60"
            style={{ background: step.bgPattern }}
          />
          
          {/* Close Button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 z-20 p-2 bg-white/80 dark:bg-gray-700/80 hover:bg-white dark:hover:bg-gray-600 rounded-full transition-all shadow-sm"
          >
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>

          {/* Content */}
          <div className="relative z-10 px-6 pt-12 pb-6 sm:px-8 sm:pt-14 sm:pb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                {/* Emoji */}
                <motion.div
                  className="text-5xl sm:text-6xl mb-4"
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 10, delay: 0.1 }}
                >
                  {step.emoji}
                </motion.div>

                {/* Icon Badge */}
                <motion.div
                  className={`inline-flex items-center justify-center p-3 bg-gradient-to-br ${step.gradient} rounded-2xl text-white mb-5 shadow-lg`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12, delay: 0.15 }}
                >
                  {step.icon}
                </motion.div>

                {/* Step Counter */}
                <motion.div 
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium text-gray-500 dark:text-gray-400 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <span>ขั้นตอน</span>
                  <span className="text-gray-900 dark:text-white font-bold">{currentStep + 1}</span>
                  <span>/</span>
                  <span>{tutorialSteps.length}</span>
                </motion.div>

                {/* Title */}
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  {language === 'th' ? step.title : step.titleEn}
                </h2>

                {/* Description */}
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-sm mx-auto">
                  {language === 'th' ? step.description : step.descriptionEn}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 pb-6">
            {tutorialSteps.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? `w-8 bg-gradient-to-r ${step.gradient}`
                    : index < currentStep
                    ? 'w-2 bg-emerald-400'
                    : 'w-2 bg-gray-300 dark:bg-gray-600'
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-between px-6 pb-6 sm:px-8 sm:pb-8">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`flex items-center gap-1 px-4 py-2.5 rounded-xl font-medium transition-all text-sm ${
                currentStep === 0
                  ? 'opacity-0 pointer-events-none'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{language === 'th' ? 'ก่อนหน้า' : 'Back'}</span>
            </button>

            <button
              onClick={handleNext}
              className={`flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r ${step.gradient} text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all text-sm`}
            >
              {currentStep === tutorialSteps.length - 1 ? (
                <>
                  <span>{language === 'th' ? 'เริ่มใช้งาน' : 'Get Started'}</span>
                  <CheckCircle className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>{language === 'th' ? 'ถัดไป' : 'Next'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Skip Link */}
        <motion.button
          onClick={handleSkip}
          className="w-full mt-4 text-center text-sm text-gray-400 hover:text-white transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {language === 'th' ? 'ข้ามการแนะนำ' : 'Skip tutorial'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
