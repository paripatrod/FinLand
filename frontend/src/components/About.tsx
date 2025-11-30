import { motion } from 'framer-motion'
import { Heart, Code, Shield, Zap, Users, Github, Mail } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

export default function About() {
  const { language } = useLanguage()
  
  const content = {
    th: {
      title: 'เกี่ยวกับ FinLand',
      subtitle: 'แอปคำนวณหนี้ฟรี 100% สำหรับคนไทย',
      mission: 'พันธกิจของเรา',
      missionText: 'เราเชื่อว่าทุกคนควรมีเครื่องมือในการวางแผนการเงินที่ดี โดยไม่ต้องเสียค่าใช้จ่าย FinLand ถูกสร้างขึ้นเพื่อช่วยให้คนไทยเข้าใจและจัดการหนี้สินได้อย่างมีประสิทธิภาพ',
      features: [
        { icon: Shield, title: 'ปลอดภัย 100%', desc: 'ไม่เก็บข้อมูลส่วนตัว คำนวณในเครื่องของคุณ' },
        { icon: Zap, title: 'รวดเร็ว', desc: 'คำนวณทันที ไม่ต้องรอโหลด' },
        { icon: Heart, title: 'ฟรีตลอดชีพ', desc: 'ไม่มีค่าใช้จ่าย ไม่มีโฆษณา' },
        { icon: Code, title: 'โอเพ่นซอร์ส', desc: 'ซอร์สโค้ดเปิดเผยบน GitHub' }
      ],
      team: 'ทีมพัฒนา',
      teamDesc: 'พัฒนาโดย YDP Eduvice Fellowship ด้วยความตั้งใจที่จะช่วยเหลือสังคมไทย',
      contact: 'ติดต่อเรา',
      version: 'เวอร์ชัน'
    },
    en: {
      title: 'About FinLand',
      subtitle: '100% Free Debt Calculator for Thai People',
      mission: 'Our Mission',
      missionText: 'We believe everyone deserves access to good financial planning tools without any cost. FinLand was created to help Thai people understand and manage their debts effectively.',
      features: [
        { icon: Shield, title: '100% Secure', desc: 'No personal data stored. Calculate on your device.' },
        { icon: Zap, title: 'Lightning Fast', desc: 'Instant calculations, no loading.' },
        { icon: Heart, title: 'Free Forever', desc: 'No fees, no ads.' },
        { icon: Code, title: 'Open Source', desc: 'Source code available on GitHub.' }
      ],
      team: 'Our Team',
      teamDesc: 'Developed by YDP Eduvice Fellowship with the intention to help Thai society.',
      contact: 'Contact Us',
      version: 'Version'
    }
  }
  
  const t = content[language as keyof typeof content] || content.th

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600 mb-3">
            {t.title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {t.subtitle}
          </p>
        </div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-8 mb-8 border border-emerald-200 dark:border-emerald-800"
        >
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Heart className="w-6 h-6 text-emerald-500" />
            {t.mission}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {t.missionText}
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
        >
          {t.features.map((feature, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors"
            >
              <feature.icon className="w-8 h-8 text-emerald-500 mb-3" />
              <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Team */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-500" />
            {t.team}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {t.teamDesc}
          </p>
          
          {/* Contact */}
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">{t.contact}</h3>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://github.com/paripatrod/FinLand"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <a
              href="mailto:contact@finland.app"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Email
            </a>
          </div>
        </motion.div>

        {/* Version */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>{t.version}: 4.1.0 • AI Financial Advisor v4.0</p>
          <p className="mt-1">Made with ❤️ in Thailand 🇹🇭</p>
        </div>
      </motion.div>
    </div>
  )
}
