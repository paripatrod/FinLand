import { motion } from 'framer-motion'
import { Shield, Eye, Database, Lock, Trash2, Cookie } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

export default function Privacy() {
  const { language } = useLanguage()

  const sections = language === 'th' ? [
    {
      icon: Eye,
      title: 'ข้อมูลที่เราเก็บ',
      content: `FinLand ไม่เก็บข้อมูลส่วนบุคคลของคุณ ข้อมูลการคำนวณทั้งหมดจะถูกประมวลผลในเบราว์เซอร์ของคุณ และไม่ถูกส่งไปยังเซิร์ฟเวอร์ใดๆ`
    },
    {
      icon: Database,
      title: 'Local Storage',
      content: `เราใช้ Local Storage ของเบราว์เซอร์เพื่อบันทึก:
      • ประวัติการคำนวณของคุณ
      • การตั้งค่า (ธีม, ภาษา)
      • ข้อมูลเหล่านี้เก็บอยู่ในเครื่องของคุณเท่านั้น`
    },
    {
      icon: Lock,
      title: 'ความปลอดภัย',
      content: `• ใช้ HTTPS สำหรับการเชื่อมต่อที่ปลอดภัย
      • ไม่มีการส่งข้อมูลการเงินไปยังเซิร์ฟเวอร์
      • ซอร์สโค้ดเปิดเผยให้ตรวจสอบได้`
    },
    {
      icon: Cookie,
      title: 'Cookies',
      content: `FinLand ไม่ใช้ cookies สำหรับติดตามผู้ใช้ เราใช้เฉพาะ Local Storage เพื่อเก็บการตั้งค่าเท่านั้น`
    },
    {
      icon: Trash2,
      title: 'การลบข้อมูล',
      content: `คุณสามารถลบข้อมูลทั้งหมดได้ตลอดเวลาโดย:
      • ล้าง Local Storage ของเบราว์เซอร์
      • หรือใช้ปุ่ม "ล้างประวัติ" ในหน้า Dashboard`
    }
  ] : [
    {
      icon: Eye,
      title: 'Data We Collect',
      content: `FinLand does not collect your personal data. All calculations are processed in your browser and are not sent to any server.`
    },
    {
      icon: Database,
      title: 'Local Storage',
      content: `We use browser Local Storage to save:
      • Your calculation history
      • Settings (theme, language)
      • This data stays only on your device`
    },
    {
      icon: Lock,
      title: 'Security',
      content: `• HTTPS for secure connections
      • No financial data sent to servers
      • Open source code for transparency`
    },
    {
      icon: Cookie,
      title: 'Cookies',
      content: `FinLand does not use cookies for tracking. We only use Local Storage for settings.`
    },
    {
      icon: Trash2,
      title: 'Data Deletion',
      content: `You can delete all data anytime by:
      • Clearing browser Local Storage
      • Or using "Clear History" in Dashboard`
    }
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            {language === 'th' ? 'นโยบายความเป็นส่วนตัว' : 'Privacy Policy'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {language === 'th' 
              ? 'อัปเดตล่าสุด: 30 พฤศจิกายน 2567' 
              : 'Last updated: November 30, 2024'}
          </p>
        </div>

        {/* Summary */}
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-6 mb-8 border border-emerald-200 dark:border-emerald-800">
          <h2 className="font-bold text-emerald-700 dark:text-emerald-300 mb-2">
            {language === 'th' ? '📌 สรุปสั้นๆ' : '📌 TL;DR'}
          </h2>
          <p className="text-emerald-600 dark:text-emerald-400">
            {language === 'th'
              ? 'FinLand ไม่เก็บข้อมูลส่วนตัว ไม่ติดตามผู้ใช้ และไม่แชร์ข้อมูลใดๆ กับบุคคลที่สาม ทุกอย่างอยู่ในเครื่องของคุณ'
              : 'FinLand does not collect personal data, does not track users, and does not share any data with third parties. Everything stays on your device.'}
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <section.icon className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2">
                    {section.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line text-sm">
                    {section.content}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            {language === 'th' 
              ? 'หากมีคำถามเกี่ยวกับนโยบายนี้ สามารถติดต่อเราได้ที่ GitHub' 
              : 'If you have questions about this policy, contact us on GitHub'}
          </p>
        </div>
      </motion.div>
    </div>
  )
}
