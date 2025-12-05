import React, { createContext, useContext, useState } from 'react'

export type Language = 'th' | 'en' | 'zh' | 'ja'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
  th: {
    // Navigation
    'nav.home': 'หน้าแรก',
    'nav.creditCard': 'บัตรเครดิต',
    'nav.studentLoan': 'กยศ./กู้นักศึกษา',
    'nav.dashboard': 'ประวัติ',
    
    // Home Page
    'home.title': 'FinLand',
    'home.subtitle': 'เครื่องมือคำนวณหนี้ พร้อม AI วิเคราะห์สุขภาพการเงิน',
    'home.tagline': 'ฟรี 100% • ไม่ต้องสมัคร • ใช้งานได้ทันที',
    'home.calcCredit': 'คำนวณบัตรเครดิต',
    'home.calcStudent': 'คำนวณ กยศ.',
    'home.tutorial': 'วิธีใช้งาน',
    
    // Features
    'feature.accurate': 'คำนวณแม่นยำ',
    'feature.accurate.desc': 'คำนวณดอกเบี้ยและค่างวด พร้อมตารางผ่อนชำระรายเดือน',
    'feature.ai': 'AI วิเคราะห์',
    'feature.ai.desc': 'วิเคราะห์สุขภาพการเงินใน 20+ มิติ ด้วย ML ที่เทรนจาก 1M+ ตัวอย่าง (R² 98.8%)',
    'feature.chart': 'กราฟ Interactive',
    'feature.chart.desc': 'ดูกราฟยอดคงเหลือ ดอกเบี้ย และ What-If Analysis',
    'feature.csv': 'Export ได้',
    'feature.csv.desc': 'ดาวน์โหลดเป็น CSV หรือ PDF เก็บไว้ใช้งาน',
    'feature.credit': 'บัตรเครดิต',
    'feature.credit.desc': 'คำนวณระยะเวลาปิดหนี้ ดอกเบี้ยรวม และวิธีปลดหนี้เร็วขึ้น',
    'feature.student': 'กยศ.',
    'feature.student.desc': 'รองรับดอกเบี้ย 1% ตามเงื่อนไข กยศ. พร้อมคำนวณค่างวด',
    
    // How To Use
    'howto.title': 'ใช้งานง่าย 3 ขั้นตอน',
    'howto.step1': 'กรอกยอดหนี้ ดอกเบี้ย และยอดจ่ายต่อเดือน',
    'howto.step2': 'ดูผลลัพธ์ ตารางผ่อนชำระ และกราฟ',
    'howto.step3': 'รับคำแนะนำจาก AI เพื่อปลดหนี้เร็วขึ้น',
    'howto.step4': '',
    'howto.step5': '',
    
    // CTA
    'cta.title': 'พร้อมวางแผนปลดหนี้แล้วหรือยัง?',
    'cta.subtitle': 'เริ่มใช้งานฟรี ไม่ต้องสมัครสมาชิก',
    'cta.startCredit': 'เริ่มเลย →',
    'cta.startStudent': 'คำนวณ กยศ.',
    'cta.viewHistory': 'ดูประวัติ',
    
    // Warning
    'warning.title': 'ข้อควรระวัง',
    'warning.text': 'ผลลัพธ์เป็นการคำนวณเชิงประมาณการสำหรับการตัดสินใจเบื้องต้น ไม่ใช่คำแนะนำทางการเงินอย่างเป็นทางการ กรุณาปรึกษาที่ปรึกษาการเงินสำหรับคำแนะนำเฉพาะบุคคล',
    
    // Tips
    'tips.title': 'รู้หรือไม่?',
    'tips.1': 'จ่ายเพิ่มแค่ 500 บาท/เดือน อาจประหยัดดอกเบี้ยได้หลายหมื่น',
    'tips.2': 'DTI ไม่ควรเกิน 40% ของรายได้',
    'tips.3': 'ควรมีเงินสำรองฉุกเฉินอย่างน้อย 3-6 เดือน',
    
    // Credit Card Calculator
    'credit.title': 'คำนวณการจ่ายหนี้บัตรเครดิต',
    'credit.subtitle': 'คำนวณระยะเวลาในการปิดหนี้บัตรเครดิต พร้อมดอกเบี้ยที่ต้องจ่าย',
    'credit.balance': 'ยอดคงค้าง (บาท)',
    'credit.balance.help': 'ยอดหนี้บัตรเครดิตปัจจุบัน',
    'credit.apr': 'อัตราดอกเบี้ยต่อปี (APR %)',
    'credit.apr.help': 'ดูได้จากใบแจ้งยอดบัตรเครดิต',
    'credit.payment': 'ยอดจ่ายต่อเดือน (บาท)',
    'credit.payment.help': 'ยอดที่คุณสามารถจ่ายได้ต่อเดือน (แนะนำให้มากกว่ายอดขั้นต่ำ)',
    'credit.monthsToPayOff': 'ระยะเวลาจนปิดหนี้',
    'credit.totalPaid': 'รวมจ่ายทั้งหมด',
    'credit.totalInterest': 'รวมดอกเบี้ย',
    
    // Student Loan Calculator
    'student.title': 'คำนวณกยศ. / Student Loan',
    'student.subtitle': 'คำนวณค่างวดรายเดือนสำหรับเงินกู้นักศึกษาและกยศ. พร้อมดอกเบี้ยรวม',
    'student.principal': 'ยอดกู้ (บาท)',
    'student.principal.help': 'ยอดเงินกู้ทั้งหมด',
    'student.apr': 'อัตราดอกเบี้ยต่อปี (%)',
    'student.apr.help': 'กยศ. มักเป็น 1% ต่อปี',
    'student.years': 'ระยะเวลา (ปี)',
    'student.years.help': 'ระยะเวลาผ่อนชำระ (กยศ. มักเป็น 10-15 ปี)',
    'student.monthlyPayment': 'จ่ายต่อเดือน',
    'student.totalPaid': 'รวมจ่ายทั้งหมด',
    'student.totalInterest': 'รวมดอกเบี้ย',
    
    // Common
    'common.calculate': 'คำนวณตอนนี้',
    'common.calculating': 'กำลังคำนวณ...',
    'common.reset': 'รีเซ็ต',
    'common.required': '*',
    'common.placeholder': 'เช่น',
    'common.months': 'เดือน',
    'common.years': 'ปี',
    'common.currency': 'บาท',
    'common.perMonth': 'ต่อเดือน',
    'common.viewHistory': 'ดูประวัติ',
    'common.saved': 'บันทึกเรียบร้อยแล้ว',
    'common.download': 'ดาวน์โหลด CSV',
    'common.error': 'เกิดข้อผิดพลาด',
    'common.monthlyIncome': 'รายได้ต่อเดือน',
    'common.delete': 'ลบ',
    
    // Dashboard
    'dashboard.title': 'ประวัติการคำนวณ',
    'dashboard.subtitle': 'ดูประวัติและสรุปผลการคำนวณทั้งหมด',
    'dashboard.empty': 'ยังไม่มีประวัติการคำนวณ',
    'dashboard.empty.desc': 'เริ่มต้นใช้งานเครื่องคำนวณเพื่อบันทึกประวัติ',
    'dashboard.totalCalculations': 'คำนวณทั้งหมด',
    'dashboard.creditCards': 'บัตรเครดิต',
    'dashboard.studentLoans': 'กยศ./Student Loan',
    'dashboard.lastCalculation': 'ล่าสุด',
    'dashboard.startCreditCard': 'คำนวณบัตรเครดิต',
    'dashboard.startStudentLoan': 'คำนวณกยศ.',
    'dashboard.showing': 'แสดง',
    'dashboard.items': 'รายการ',
    'dashboard.clearAll': 'ลบทั้งหมด',
    'dashboard.confirmDelete': 'คุณต้องการลบการคำนวณนี้ใช่หรือไม่?',
    'dashboard.confirmClearAll': 'คุณต้องการลบประวัติการคำนวณทั้งหมดใช่หรือไม่?',
    'dashboard.creditCard': 'บัตรเครดิต',
    'dashboard.studentLoan': 'กยศ. / Student Loan',
    'dashboard.balance': 'ยอดคงค้าง',
    'dashboard.apr': 'อัตราดอกเบี้ย',
    'dashboard.monthlyPayment': 'จ่ายต่อเดือน',
    'dashboard.duration': 'ระยะเวลา',
    'dashboard.months': 'เดือน',
    'dashboard.loanAmount': 'ยอดกู้',
    'dashboard.totalPaid': 'รวมจ่ายทั้งหมด',
    'dashboard.totalInterest': 'รวมดอกเบี้ย',
    'dashboard.totalDebt': 'หนี้รวมทั้งหมด',
    'dashboard.avgAPR': 'ดอกเบี้ยเฉลี่ย',
    'dashboard.avgDuration': 'ระยะเวลาเฉลี่ย',
    'dashboard.distribution': 'สัดส่วนประเภทหนี้',
    'dashboard.trend': 'แนวโน้มรายเดือน',
    'dashboard.interestComparison': 'เปรียบเทียบดอกเบี้ย',
    'dashboard.calculations': 'จำนวนครั้ง',
    'dashboard.principal': 'เงินต้น',
    'dashboard.interest': 'ดอกเบี้ย',
    
    // AI Analysis
    'ai.analyzing': 'AI กำลังวิเคราะห์โปรไฟล์หนี้ของคุณ...',
    'ai.profileTitle': 'AI วิเคราะห์โปรไฟล์หนี้ของคุณ',
    'ai.riskLevel': 'ระดับความเสี่ยงทางการเงิน',
    'ai.recommendation': 'คำแนะนำการดำเนินการ',
    'ai.accuracy': 'ความแม่นยำ',
    
    // Table
    'table.title': 'ตารางการผ่อนชำระรายเดือน',
    'table.schedule': 'ตารางผ่อนชำระ',
    'table.month': 'เดือน',
    'table.payment': 'จ่าย',
    'table.interest': 'ดอกเบี้ย',
    'table.principal': 'เงินต้น',
    'table.remaining': 'คงเหลือ',
    'table.showing': 'แสดง',
    'table.outOf': 'จาก',
    'table.months': 'เดือน',
    'table.showingFirst': 'แสดง',
    'table.monthsFirst': 'เดือนแรก จากทั้งหมด',
    'table.monthsTotal': 'เดือน',
    'table.downloadCSV': '(ดาวน์โหลด CSV เพื่อดูข้อมูลทั้งหมด)',
    
    // Chart
    'chart.title': 'กราฟแสดงยอดหนี้คงเหลือ',
    'chart.pieTitle': 'สัดส่วนเงินต้นและดอกเบี้ย',
    'chart.balance': 'ยอดคงเหลือ',
    'chart.interest': 'ดอกเบี้ย',

    // AI Advisor
    'advisor.title': 'AI ที่ปรึกษาการเงินมืออาชีพ',
    'advisor.currentInfo': 'ข้อมูลหนี้ปัจจุบันของคุณ',
    'advisor.balance': 'ยอดหนี้คงค้าง',
    'advisor.interest': 'อัตราดอกเบี้ย',
    'advisor.payment': 'จ่ายต่อเดือน',
    'advisor.quickQuestions': 'คำถามที่ถามบ่อย (คลิกเลย!)',
    'advisor.inputPlaceholder': 'ถามอะไรก็ได้... เช่น "เปรียบเทียบ 2000 vs 3000" หรือ "ควรจ่ายเท่าไหร่?"',
    'advisor.send': 'ส่งคำถาม',
    'advisor.newQuestion': 'ถามคำถามใหม่',
    'advisor.comparisonTitle': 'เปรียบเทียบแบบละเอียด',
    'advisor.scenario1': 'แบบที่ 1 (จ่ายน้อย)',
    'advisor.scenario2': 'แบบที่ 2 (จ่ายมากขึ้น)',
    'advisor.savings': 'ประหยัดได้ทั้งหมด',
    'advisor.faster': 'เร็วขึ้น',
    'advisor.saveMoney': 'ประหยัดเงิน',
    'advisor.reduceInterest': 'ลดดอกเบี้ยได้',
    'advisor.perYear': 'ต่อปี',
    'advisor.answer.tooLow': 'ยอดจ่ายต่ำเกินไป! จ่ายไม่ครอบคลุมดอกเบี้ย หนี้จะไม่หมดเลย',
    'advisor.recommendation': 'คำแนะนำจาก AI',
    'advisor.minPayment': 'ขั้นต่ำสุด (ไม่แนะนำ!)',
    'advisor.recommendedPayment': 'แนะนำ (สมดุลดี)',
    'advisor.idealPayment': 'เหมาะสุด (ประหยัดสูงสุด!)',
    'advisor.result': 'ผลลัพธ์การคำนวณ',
    
    // Severity Levels
    'severity.low': 'ความเสี่ยงต่ำ',
    'severity.medium': 'ความเสี่ยงปานกลาง',
    'severity.high': 'ความเสี่ยงสูง',
    'severity.critical': 'ความเสี่ยงวิกฤต',
    'severity.unknown': 'ไม่ทราบ',
    
    // Toast Messages
    'toast.undo': 'ย้อนกลับ',
    'toast.cancel': 'ยกเลิก',
    'toast.itemRestored': 'กู้คืนรายการแล้ว',
    'toast.allCleared': 'ลบข้อมูลทั้งหมดแล้ว',
    
    // Tutorial
    'tutorial.title': 'คู่มือการใช้งาน',
    'tutorial.back': 'ย้อนกลับ',
    'tutorial.next': 'ถัดไป',
    'tutorial.start': 'เริ่มใช้งาน',
    'tutorial.skip': 'ข้าม',
    
    // AI Advisor Header
    'advisor.headerTitle': 'AI ที่ปรึกษาการเงิน',
    'advisor.headerSubtitle': 'ผู้ช่วยวิเคราะห์การเงินส่วนตัว',
    
    // What-If Analysis
    'whatif.title': 'What-If Analysis: ลองจ่ายเพิ่มดูไหม?',
    'whatif.extraPayment': 'จ่ายเพิ่มอีก',
    'whatif.perMonth': 'ต่อเดือน',
    'whatif.result': 'ผลลัพธ์',
    'whatif.fasterBy': 'เร็วขึ้น',
    'whatif.saveInterest': 'ประหยัดดอกเบี้ย',
    'whatif.hint': 'ลองเลื่อนแถบเพื่อดูว่าถ้าจ่ายเพิ่มจะประหยัดได้เท่าไหร่',
    
    // Print
    'print.title': 'พิมพ์ PDF',
    
    // AI v4.0 Section
    'ai.v4.title': '🧠 AI วิเคราะห์การเงิน',
    'ai.v4.healthScore': '❤️ สุขภาพการเงิน',
    'ai.v4.riskLevel': '⚡ ระดับความเสี่ยง',
    'ai.v4.riskMeter': '📊 Risk Meter',
    'ai.v4.riskLow': '🟢 ความเสี่ยงต่ำ',
    'ai.v4.riskMedium': '🟡 ความเสี่ยงปานกลาง',
    'ai.v4.riskHigh': '🟠 ความเสี่ยงสูง',
    'ai.v4.riskCritical': '🔴 ความเสี่ยงวิกฤต',
    'ai.v4.debtFreedom': 'ปลดหนี้',
    'ai.v4.debtFreedomStudent': 'ปลดหนี้ กยศ.',
    'ai.v4.recommendedExtra': 'แนะนำจ่ายเพิ่ม',
    'ai.v4.recommendedExtraMonth': 'แนะนำจ่ายเพิ่ม/เดือน',
    'ai.v4.extraPaymentWhatIf': 'จ่ายเพิ่ม (What-If)',
    'ai.v4.whatIfResult': '🎯 What-If:',
    'ai.v4.fasterBy': 'เร็วขึ้น',
    'ai.v4.saveAmount': 'ประหยัด',
    'ai.v4.personalizedTips': '📊 วิเคราะห์จากข้อมูลของคุณ',
    'ai.v4.actionTips': '💡 สิ่งที่ควรทำ',
    'ai.v4.personalizedTipsFor': '💡 คำแนะนำเฉพาะคุณ:',
    'ai.v4.strategy': '🎯 กลยุทธ์',
    'ai.v4.strategyRecommended': '🎯 กลยุทธ์แนะนำ',
    'ai.v4.primaryAction': '⭐ Action',
    'ai.v4.primaryActionFirst': '⭐ สิ่งที่ควรทำก่อน',
    'ai.v4.emergencyFund': '🏦 ควรมีเงินสำรองฉุกเฉินอย่างน้อย',
    'ai.v4.months': 'เดือน',
    'ai.v4.dtiRatio': '📊 DTI Ratio',
    'ai.v4.interest': '💰 ดอกเบี้ย',
    'ai.v4.actions': '🎯 Actions:',
    'ai.v4.payMoreTip': '💡 จ่ายเพิ่มจะเร็วขึ้น',
    'ai.v4.saveTip': 'ประหยัด',
    
    // Footer
    'footer.about': 'เกี่ยวกับเรา',
    'footer.aboutText': 'เครื่องมือคำนวณการเงินออนไลน์ฟรี พัฒนาโดย YDP Eduvice Fellowship',
    'footer.tools': 'เครื่องมือ',
    'footer.contact': 'ติดต่อ',
    'footer.contactText': 'สำหรับข้อเสนอแนะและคำถาม',
    'footer.email': 'อีเมล',
    'footer.copyright': '© 2025 YDP Eduvice Fellowship - FinLand',
    'footer.disclaimer': 'ผลลัพธ์เป็นการประมาณการ ไม่ใช่คำแนะนำทางการเงินอย่างเป็นทางการ',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.creditCard': 'Credit Card',
    'nav.studentLoan': 'Student Loan',
    'nav.dashboard': 'History',
    
    // Home Page
    'home.title': 'FinLand - Online Financial Calculator',
    'home.subtitle': 'Calculate credit card, student loan debt with AI profile analysis',
    'home.tagline': '100% Free • Easy to Use • Mobile Friendly',
    'home.calcCredit': 'Credit Card Calculator',
    'home.calcStudent': 'Student Loan Calculator',
    'home.tutorial': 'Watch Tutorial',
    
    // Features
    'feature.accurate': 'Accurate Calculation',
    'feature.accurate.desc': 'Precise interest and payment calculations with monthly breakdown',
    'feature.ai': 'AI Analysis',
    'feature.ai.desc': 'AI analyzes your debt profile with personalized advice (supports 100 profiles, ~90% accuracy)',
    'feature.chart': 'Interactive Charts',
    'feature.chart.desc': 'Interactive charts showing balance and interest over time',
    'feature.csv': 'CSV Download',
    'feature.csv.desc': 'Download payment schedule as CSV file for your records',
    'feature.credit': 'Credit Card',
    'feature.credit.desc': 'Calculate credit card payoff time with total interest',
    'feature.student': 'Student Loan',
    'feature.student.desc': 'Calculate student loan payments for all loan types',
    
    // How To Use
    'howto.title': 'How to Use',
    'howto.step1': 'Choose your calculator (Credit Card or Student Loan)',
    'howto.step2': 'Enter debt amount, interest rate, and payment term',
    'howto.step3': 'View interactive payment schedule and charts',
    'howto.step4': 'Use AI analysis to get personalized recommendations',
    'howto.step5': 'Download CSV schedule for future reference',
    
    // CTA
    'cta.title': 'Ready to Start Planning Your Finances?',
    'cta.subtitle': 'Use our tools for free, no registration required',
    'cta.startCredit': 'Start Credit Card Calculator',
    'cta.startStudent': 'Start Student Loan Calculator',
    'cta.viewHistory': 'View History',
    
    // Warning
    'warning.title': 'Important Notice',
    'warning.text': 'Results are estimates for initial decision-making purposes only. This is not official financial advice. Please consult a financial advisor for personalized recommendations.',
    
    // Tips
    'tips.title': 'Tips',
    'tips.1': 'Pay more than minimum to significantly reduce interest',
    'tips.2': 'Always compare interest rates before borrowing',
    'tips.3': 'Set a budget and plan before borrowing',
    
    // Credit Card Calculator
    'credit.title': 'Credit Card Payoff Calculator',
    'credit.subtitle': 'Calculate time to pay off credit card debt with interest',
    'credit.balance': 'Balance (THB)',
    'credit.balance.help': 'Current credit card balance',
    'credit.apr': 'Annual Interest Rate (APR %)',
    'credit.apr.help': 'Found on your credit card statement',
    'credit.payment': 'Monthly Payment (THB)',
    'credit.payment.help': 'Amount you can pay monthly (recommended more than minimum)',
    'credit.monthsToPayOff': 'Time to Pay Off',
    'credit.totalPaid': 'Total Paid',
    'credit.totalInterest': 'Total Interest',
    
    // Student Loan Calculator
    'student.title': 'Student Loan Calculator',
    'student.subtitle': 'Calculate monthly payments for student loans with total interest',
    'student.principal': 'Loan Amount (THB)',
    'student.principal.help': 'Total loan amount to repay',
    'student.apr': 'Annual Interest Rate (%)',
    'student.apr.help': 'Typical student loans are 1-2% per year',
    'student.years': 'Term (Years)',
    'student.years.help': 'Repayment period (typically 10-15 years)',
    'student.monthlyPayment': 'Monthly Payment',
    'student.totalPaid': 'Total Paid',
    'student.totalInterest': 'Total Interest',
    
    // Common
    'common.calculate': 'Calculate Now',
    'common.calculating': 'Calculating...',
    'common.reset': 'Reset',
    'common.required': '*',
    'common.placeholder': 'e.g.',
    'common.months': 'months',
    'common.years': 'years',
    'common.currency': 'THB',
    'common.perMonth': 'per month',
    'common.viewHistory': 'View History',
    'common.saved': 'Saved successfully',
    'common.download': 'Download CSV',
    'common.error': 'Error',
    'common.monthlyIncome': 'Monthly Income',
    'common.delete': 'Delete',
    
    // Dashboard
    'dashboard.title': 'Calculation History',
    'dashboard.subtitle': 'View all your calculation history and summaries',
    'dashboard.empty': 'No calculation history yet',
    'dashboard.empty.desc': 'Start using the calculators to save history',
    'dashboard.totalCalculations': 'Total Calculations',
    'dashboard.creditCards': 'Credit Cards',
    'dashboard.studentLoans': 'Student Loans',
    'dashboard.lastCalculation': 'Latest',
    'dashboard.startCreditCard': 'Calculate Credit Card',
    'dashboard.startStudentLoan': 'Calculate Student Loan',
    'dashboard.showing': 'Showing',
    'dashboard.items': 'items',
    'dashboard.clearAll': 'Clear All',
    'dashboard.confirmDelete': 'Do you want to delete this calculation?',
    'dashboard.confirmClearAll': 'Do you want to delete all calculation history?',
    'dashboard.creditCard': 'Credit Card',
    'dashboard.studentLoan': 'Student Loan',
    'dashboard.balance': 'Balance',
    'dashboard.apr': 'Interest Rate',
    'dashboard.monthlyPayment': 'Monthly Payment',
    'dashboard.duration': 'Duration',
    'dashboard.months': 'months',
    'dashboard.loanAmount': 'Loan Amount',
    'dashboard.totalPaid': 'Total Paid',
    'dashboard.totalInterest': 'Total Interest',
    'dashboard.totalDebt': 'Total Debt',
    'dashboard.avgAPR': 'Average APR',
    'dashboard.avgDuration': 'Avg Duration',
    'dashboard.distribution': 'Type Distribution',
    'dashboard.trend': 'Monthly Trend',
    'dashboard.interestComparison': 'Interest Comparison',
    'dashboard.calculations': 'Calculations',
    'dashboard.principal': 'Principal',
    'dashboard.interest': 'Interest',
    
    // AI Analysis
    'ai.analyzing': 'AI is analyzing your debt profile...',
    'ai.profileTitle': 'AI Debt Profile Analysis',
    'ai.riskLevel': 'Financial Risk Level',
    'ai.recommendation': 'Action Recommendation',
    'ai.accuracy': 'Accuracy',
    
    // Table
    'table.title': 'Monthly Payment Schedule',
    'table.month': 'Month',
    'table.payment': 'Payment',
    'table.interest': 'Interest',
    'table.principal': 'Principal',
    'table.remaining': 'Remaining',
    'table.showingFirst': 'Showing first',
    'table.monthsFirst': 'months out of',
    'table.monthsTotal': 'total',
    'table.downloadCSV': '(Download CSV to see all data)',
    
    // Chart
    'chart.title': 'Remaining Balance Chart',
    'chart.pieTitle': 'Principal vs Interest Breakdown',
    'chart.balance': 'Balance',
    'chart.interest': 'Interest',

    // AI Advisor
    'advisor.title': 'AI Financial Advisor',
    'advisor.currentInfo': 'Current Info:',
    'advisor.balance': 'Balance',
    'advisor.interest': 'Interest',
    'advisor.payment': 'Monthly Payment',
    'advisor.quickQuestions': 'Quick Questions:',
    'advisor.inputPlaceholder': 'Ask a question... e.g. What if I pay 2000?',
    'advisor.send': 'Send',
    'advisor.newQuestion': 'New Question',
    'advisor.comparisonTitle': 'Detailed Comparison',
    'advisor.scenario1': 'Scenario 1',
    'advisor.scenario2': 'Scenario 2',
    'advisor.savings': 'Savings',
    'advisor.faster': 'Faster',
    'advisor.saveMoney': 'Save',
    'advisor.reduceInterest': 'Reduce Interest',
    'advisor.perYear': 'per year',
    'advisor.warning': 'Warning',
    'advisor.answer.tooLow': 'Payment too low! Cannot cover interest, debt will never be paid off',
    'advisor.recommendation': 'AI Recommendation',
    'advisor.minPayment': 'Minimum (Not Recommended!)',
    'advisor.recommendedPayment': 'Recommended (Good Balance)',
    'advisor.idealPayment': 'Ideal (Maximum Savings!)',
    'advisor.result': 'Calculation Result',
    
    // Severity Levels
    'severity.low': 'Low Risk',
    'severity.medium': 'Medium Risk',
    'severity.high': 'High Risk',
    'severity.critical': 'Critical Risk',
    'severity.unknown': 'Unknown',
    
    // Toast Messages
    'toast.undo': 'Undo',
    'toast.cancel': 'Cancel',
    'toast.itemRestored': 'Item restored',
    'toast.allCleared': 'All calculations cleared',
    
    // Tutorial
    'tutorial.title': 'Tutorial',
    'tutorial.back': 'Back',
    'tutorial.next': 'Next',
    'tutorial.start': 'Get Started',
    'tutorial.skip': 'Skip',
    
    // AI Advisor Header
    'advisor.headerTitle': 'AI Financial Advisor',
    'advisor.headerSubtitle': 'Your personal finance assistant',
    
    // What-If Analysis
    'whatif.title': 'What-If Analysis: Try paying more?',
    'whatif.extraPayment': 'Extra payment',
    'whatif.perMonth': 'per month',
    'whatif.result': 'Result',
    'whatif.fasterBy': 'Faster by',
    'whatif.saveInterest': 'Save interest',
    'whatif.hint': 'Try sliding to see how much you can save by paying more',
    
    // Print
    'print.title': 'Print PDF',
    
    // AI v4.0 Section
    'ai.v4.title': '🧠 AI Financial Analysis',
    'ai.v4.healthScore': '❤️ Financial Health',
    'ai.v4.riskLevel': '⚡ Risk Level',
    'ai.v4.riskMeter': '📊 Risk Meter',
    'ai.v4.riskLow': '🟢 Low Risk',
    'ai.v4.riskMedium': '🟡 Medium Risk',
    'ai.v4.riskHigh': '🟠 High Risk',
    'ai.v4.riskCritical': '🔴 Critical Risk',
    'ai.v4.debtFreedom': 'Debt Freedom',
    'ai.v4.debtFreedomStudent': 'Student Loan Freedom',
    'ai.v4.recommendedExtra': 'Recommended Extra',
    'ai.v4.recommendedExtraMonth': 'Recommended Extra/mo',
    'ai.v4.extraPaymentWhatIf': 'Extra (What-If)',
    'ai.v4.whatIfResult': '🎯 What-If:',
    'ai.v4.fasterBy': 'Faster by',
    'ai.v4.saveAmount': 'Save',
    'ai.v4.personalizedTips': '📊 Analysis from your data',
    'ai.v4.actionTips': '💡 Recommended Actions',
    'ai.v4.personalizedTipsFor': '💡 Tips for you:',
    'ai.v4.strategy': '🎯 Strategy',
    'ai.v4.strategyRecommended': '🎯 Recommended Strategy',
    'ai.v4.primaryAction': '⭐ Action',
    'ai.v4.primaryActionFirst': '⭐ Priority Action',
    'ai.v4.emergencyFund': '🏦 You should have at least',
    'ai.v4.months': 'months',
    'ai.v4.dtiRatio': '📊 DTI Ratio',
    'ai.v4.interest': '💰 Interest',
    'ai.v4.actions': '🎯 Actions:',
    'ai.v4.payMoreTip': '💡 Pay more to finish faster by',
    'ai.v4.saveTip': 'Save',
    
    // Footer
    'footer.about': 'About Us',
    'footer.aboutText': 'Free online financial calculator developed by YDP Eduvice Fellowship',
    'footer.tools': 'Tools',
    'footer.contact': 'Contact',
    'footer.contactText': 'For suggestions and questions',
    'footer.email': 'Email',
    'footer.copyright': '© 2025 YDP Eduvice Fellowship - FinLand',
    'footer.disclaimer': 'Results are estimates and not official financial advice',
  },
  zh: {
    // Navigation
    'nav.home': '首页',
    'nav.creditCard': '信用卡',
    'nav.studentLoan': '学生贷款',
    'nav.dashboard': '历史记录',
    
    // Home Page
    'home.title': 'FinLand - 在线财务计算器',
    'home.subtitle': '计算信用卡、学生贷款债务，配备AI分析',
    'home.tagline': '100%免费 • 易于使用 • 移动友好',
    'home.calcCredit': '信用卡计算器',
    'home.calcStudent': '学生贷款计算器',
    'home.tutorial': '观看教程',
    
    // Features
    'feature.accurate': '精确计算',
    'feature.accurate.desc': '精确的利息和付款计算，每月明细',
    'feature.ai': 'AI分析',
    'feature.ai.desc': 'AI分析您的债务并提供个性化建议（支持100种配置，精度约90%）',
    'feature.chart': '交互式图表',
    'feature.chart.desc': '交互式图表显示余额和利息变化',
    'feature.csv': 'CSV下载',
    'feature.csv.desc': '下载还款时间表为CSV文件保存',
    'feature.credit': '信用卡',
    'feature.credit.desc': '计算信用卡还清时间和总利息',
    'feature.student': '学生贷款',
    'feature.student.desc': '计算所有类型学生贷款的还款',
    
    // How To Use
    'howto.title': '使用方法',
    'howto.step1': '选择计算器（信用卡或学生贷款）',
    'howto.step2': '输入债务金额、利率和还款期限',
    'howto.step3': '查看交互式还款时间表和图表',
    'howto.step4': '使用AI分析获取个性化建议',
    'howto.step5': '下载CSV时间表以备将来参考',
    
    // CTA
    'cta.title': '准备开始规划您的财务了吗？',
    'cta.subtitle': '免费使用我们的工具，无需注册',
    'cta.startCredit': '开始信用卡计算',
    'cta.startStudent': '开始学生贷款计算',
    'cta.viewHistory': '查看历史',
    
    // Warning
    'warning.title': '重要提示',
    'warning.text': '结果仅供初步决策参考。这不是官方财务建议。请咨询财务顾问获取个性化建议。',
    
    // Tips
    'tips.title': '提示',
    'tips.1': '支付超过最低额可显著减少利息',
    'tips.2': '借款前始终比较利率',
    'tips.3': '借款前设定预算并做好规划',
    
    // Credit Card Calculator
    'credit.title': '信用卡还款计算器',
    'credit.subtitle': '计算还清信用卡债务的时间和利息',
    'credit.balance': '余额（泰铢）',
    'credit.balance.help': '当前信用卡余额',
    'credit.apr': '年利率（APR %）',
    'credit.apr.help': '可在信用卡账单上找到',
    'credit.payment': '每月还款（泰铢）',
    'credit.payment.help': '您每月可以支付的金额（建议高于最低还款额）',
    'credit.monthsToPayOff': '还清期限',
    'credit.totalPaid': '总还款',
    'credit.totalInterest': '总利息',
    
    // Student Loan Calculator
    'student.title': '学生贷款计算器',
    'student.subtitle': '计算学生贷款的月付款和总利息',
    'student.principal': '贷款金额（泰铢）',
    'student.principal.help': '需偿还的总贷款金额',
    'student.apr': '年利率（%）',
    'student.apr.help': '典型学生贷款利率为每年1-2%',
    'student.years': '期限（年）',
    'student.years.help': '还款期限（通常为10-15年）',
    'student.monthlyPayment': '月付款',
    'student.totalPaid': '总还款',
    'student.totalInterest': '总利息',
    
    // Common
    'common.calculate': '立即计算',
    'common.calculating': '计算中...',
    'common.reset': '重置',
    'common.required': '*',
    'common.placeholder': '例如',
    'common.months': '月',
    'common.years': '年',
    'common.currency': '泰铢',
    'common.perMonth': '每月',
    'common.viewHistory': '查看历史',
    'common.saved': '保存成功',
    'common.download': '下载CSV',
    'common.error': '错误',
    'common.monthlyIncome': '月收入',
    'common.delete': '删除',
    
    // Dashboard
    'dashboard.title': '计算历史',
    'dashboard.subtitle': '查看所有计算历史和摘要',
    'dashboard.empty': '暂无计算历史',
    'dashboard.empty.desc': '开始使用计算器以保存历史',
    'dashboard.totalCalculations': '总计算次数',
    'dashboard.creditCards': '信用卡',
    'dashboard.studentLoans': '学生贷款',
    'dashboard.lastCalculation': '最新',
    'dashboard.startCreditCard': '计算信用卡',
    'dashboard.startStudentLoan': '计算学生贷款',
    'dashboard.showing': '显示',
    'dashboard.items': '项',
    'dashboard.clearAll': '全部清除',
    'dashboard.confirmDelete': '您确定要删除此计算吗？',
    'dashboard.confirmClearAll': '您确定要删除所有计算历史吗？',
    'dashboard.creditCard': '信用卡',
    'dashboard.studentLoan': '学生贷款',
    'dashboard.balance': '余额',
    'dashboard.apr': '利率',
    'dashboard.monthlyPayment': '月付款',
    'dashboard.duration': '期限',
    'dashboard.months': '月',
    'dashboard.loanAmount': '贷款金额',
    'dashboard.totalPaid': '总支付',
    'dashboard.totalInterest': '总利息',
    'dashboard.totalDebt': '总债务',
    'dashboard.avgAPR': '平均利率',
    'dashboard.avgDuration': '平均期限',
    'dashboard.distribution': '类型分布',
    'dashboard.trend': '月度趋势',
    'dashboard.interestComparison': '利息对比',
    'dashboard.calculations': '计算次数',
    'dashboard.principal': '本金',
    'dashboard.interest': '利息',
    
    // AI Analysis
    'ai.analyzing': 'AI正在分析您的债务状况...',
    'ai.profileTitle': 'AI债务状况分析',
    'ai.riskLevel': '财务风险等级',
    'ai.recommendation': '行动建议',
    'ai.accuracy': '准确率',
    
    // Table
    'table.title': '月度还款计划表',
    'table.month': '月份',
    'table.payment': '还款',
    'table.interest': '利息',
    'table.principal': '本金',
    'table.remaining': '余额',
    'table.showingFirst': '显示前',
    'table.monthsFirst': '个月，共',
    'table.monthsTotal': '个月',
    'table.downloadCSV': '(下载CSV查看全部数据)',

    // Chart
    'chart.title': '余额图表',
    'chart.pieTitle': '本金与利息比例',
    'chart.balance': '余额',
    'chart.interest': '利息',

    // AI Advisor
    'advisor.title': 'AI 财务顾问',
    'advisor.currentInfo': '当前信息：',
    'advisor.balance': '余额',
    'advisor.interest': '利息',
    'advisor.payment': '每月还款',
    'advisor.quickQuestions': '快速问题：',
    'advisor.inputPlaceholder': '提问... 例如：如果我每月支付2000？',
    'advisor.send': '发送',
    'advisor.newQuestion': '新问题',
    'advisor.comparisonTitle': '详细比较',
    'advisor.scenario1': '方案 1',
    'advisor.scenario2': '方案 2',
    'advisor.savings': '节省',
    'advisor.faster': '提前',
    'advisor.saveMoney': '节省金额',
    'advisor.reduceInterest': '减少利息',
    'advisor.perYear': '年',
    'advisor.warning': '警告',
    'advisor.answer.tooLow': '还款额太低！无法覆盖利息，债务永远还不清',
    'advisor.recommendation': 'AI建议',
    'advisor.minPayment': '最低还款（不推荐！）',
    'advisor.recommendedPayment': '推荐还款（平衡方案）',
    'advisor.idealPayment': '理想还款（最大节省！）',
    'advisor.result': '计算结果',
    
    // Severity Levels
    'severity.low': '低风险',
    'severity.medium': '中等风险',
    'severity.high': '高风险',
    'severity.critical': '严重风险',
    'severity.unknown': '未知',
    
    // Toast Messages
    'toast.undo': '撤销',
    'toast.cancel': '取消',
    'toast.itemRestored': '已恢复项目',
    'toast.allCleared': '已清除所有计算',
    
    // Tutorial
    'tutorial.title': '使用教程',
    'tutorial.back': '返回',
    'tutorial.next': '下一步',
    'tutorial.start': '开始使用',
    'tutorial.skip': '跳过',
    
    // AI Advisor Header
    'advisor.headerTitle': 'AI 财务顾问',
    'advisor.headerSubtitle': '您的个人财务助手',
    
    // What-If Analysis
    'whatif.title': '假设分析：尝试多付一些？',
    'whatif.extraPayment': '额外还款',
    'whatif.perMonth': '每月',
    'whatif.result': '结果',
    'whatif.fasterBy': '提前',
    'whatif.saveInterest': '节省利息',
    'whatif.hint': '尝试滑动查看多付能节省多少',
    
    // Print
    'print.title': '打印 PDF',
    
    // AI v4.0 Section
    'ai.v4.title': '🧠 AI 财务分析',
    'ai.v4.healthScore': '❤️ 财务健康',
    'ai.v4.riskLevel': '⚡ 风险等级',
    'ai.v4.riskMeter': '📊 风险仪表',
    'ai.v4.riskLow': '🟢 低风险',
    'ai.v4.riskMedium': '🟡 中等风险',
    'ai.v4.riskHigh': '🟠 高风险',
    'ai.v4.riskCritical': '🔴 严重风险',
    'ai.v4.debtFreedom': '还清债务',
    'ai.v4.debtFreedomStudent': '还清学生贷款',
    'ai.v4.recommendedExtra': '建议多付',
    'ai.v4.recommendedExtraMonth': '建议多付/月',
    'ai.v4.extraPaymentWhatIf': '多付 (假设)',
    'ai.v4.whatIfResult': '🎯 假设:',
    'ai.v4.fasterBy': '提前',
    'ai.v4.saveAmount': '节省',
    'ai.v4.personalizedTips': '📊 根据您的数据分析',
    'ai.v4.actionTips': '💡 建议操作',
    'ai.v4.personalizedTipsFor': '💡 专属建议:',
    'ai.v4.strategy': '🎯 策略',
    'ai.v4.strategyRecommended': '🎯 推荐策略',
    'ai.v4.primaryAction': '⭐ 操作',
    'ai.v4.primaryActionFirst': '⭐ 优先操作',
    'ai.v4.emergencyFund': '🏦 您应该至少有',
    'ai.v4.months': '个月',
    'ai.v4.dtiRatio': '📊 DTI 比率',
    'ai.v4.interest': '💰 利息',
    'ai.v4.actions': '🎯 操作:',
    'ai.v4.payMoreTip': '💡 多付可提前完成',
    'ai.v4.saveTip': '节省',
    
    // Footer
    'footer.about': '关于我们',
    'footer.aboutText': '免费在线财务计算器，由YDP Eduvice Fellowship开发',
    'footer.tools': '工具',
    'footer.contact': '联系我们',
    'footer.contactText': '如有建议和问题',
    'footer.email': '电子邮件',
    'footer.copyright': '© 2025 YDP Eduvice Fellowship - FinLand',
    'footer.disclaimer': '结果仅供参考，非正式财务建议',
  },
  ja: {
    // Navigation
    'nav.home': 'ホーム',
    'nav.creditCard': 'クレジットカード',
    'nav.studentLoan': '学生ローン',
    'nav.dashboard': '履歴',
    
    // Home Page
    'home.title': 'FinLand - 金融計算機',
    'home.subtitle': 'クレジットカード、学生ローン債務をAI分析付きで計算',
    'home.tagline': '100%無料 • 使いやすい • モバイル対応',
    'home.calcCredit': 'クレジットカード計算機',
    'home.calcStudent': '学生ローン計算機',
    'home.tutorial': 'チュートリアルを見る',
    
    // Features
    'feature.accurate': '正確な計算',
    'feature.accurate.desc': '正確な利息と支払い計算、月別の内訳付き',
    'feature.ai': 'AI分析',
    'feature.ai.desc': 'AIがあなたの債務を分析し、アドバイスを提供（100プロファイル対応、精度約90%）',
    'feature.chart': 'インタラクティブチャート',
    'feature.chart.desc': '残高と利息の変化を可視化するインタラクティブチャート',
    'feature.csv': 'CSVダウンロード',
    'feature.csv.desc': '返済スケジュールをCSVファイルでダウンロード',
    'feature.credit': 'クレジットカード',
    'feature.credit.desc': 'クレジットカード債務の完済までの期間と総利息を計算',
    'feature.student': '学生ローン',
    'feature.student.desc': 'すべてのタイプの学生ローンの支払いを計算',
    
    // How To Use
    'howto.title': '使い方',
    'howto.step1': '計算機を選択（クレジットカードまたは学生ローン）',
    'howto.step2': '債務金額、金利、期間を入力',
    'howto.step3': 'インタラクティブな返済スケジュールとチャートを確認',
    'howto.step4': 'AI分析で個別のアドバイスを取得',
    'howto.step5': 'CSVスケジュールをダウンロードして保存',
    
    // CTA
    'cta.title': '財務計画を始める準備はできましたか？',
    'cta.subtitle': '登録不要で無料でご利用いただけます',
    'cta.startCredit': 'クレジットカード計算を開始',
    'cta.startStudent': '学生ローン計算を開始',
    'cta.viewHistory': '履歴を見る',
    
    // Warning
    'warning.title': '重要なお知らせ',
    'warning.text': '結果は初期判断の参考のみです。これは公式の財務アドバイスではありません。個別のアドバイスについては財務アドバイザーにご相談ください。',
    
    // Tips
    'tips.title': 'ヒント',
    'tips.1': '最低額以上の支払いで利息を大幅に削減できます',
    'tips.2': '借り入れ前に必ず金利を比較してください',
    'tips.3': '借り入れ前に予算を設定し計画を立てましょう',
    
    // Credit Card Calculator
    'credit.title': 'クレジットカード返済計算機',
    'credit.subtitle': 'クレジットカード債務の完済時間と利息を計算',
    'credit.balance': '残高（バーツ）',
    'credit.balance.help': '現在のクレジットカード残高',
    'credit.apr': '年利率（APR %）',
    'credit.apr.help': 'クレジットカード明細書で確認できます',
    'credit.payment': '毎月の支払い（バーツ）',
    'credit.payment.help': '毎月支払える金額（最低支払額以上推奨）',
    'credit.monthsToPayOff': '完済までの期間',
    'credit.totalPaid': '総支払額',
    'credit.totalInterest': '総利息',
    
    // Student Loan Calculator
    'student.title': '学生ローン計算機',
    'student.subtitle': '学生ローンの月々の支払いと総利息を計算',
    'student.principal': 'ローン金額（バーツ）',
    'student.principal.help': '返済すべき総ローン金額',
    'student.apr': '年利率（%）',
    'student.apr.help': '一般的な学生ローンは年1-2%',
    'student.years': '期間（年）',
    'student.years.help': '返済期間（通常10-15年）',
    'student.monthlyPayment': '月々の支払い',
    'student.totalPaid': '総支払額',
    'student.totalInterest': '総利息',
    
    // Common
    'common.calculate': '今すぐ計算',
    'common.calculating': '計算中...',
    'common.reset': 'リセット',
    'common.required': '*',
    'common.placeholder': '例',
    'common.months': 'ヶ月',
    'common.years': '年',
    'common.currency': 'バーツ',
    'common.perMonth': '/月',
    'common.viewHistory': '履歴を見る',
    'common.saved': '保存しました',
    'common.download': 'CSVダウンロード',
    'common.error': 'エラー',
    'common.monthlyIncome': '月収',
    'common.delete': '削除',
    
    // Dashboard
    'dashboard.title': '計算履歴',
    'dashboard.subtitle': 'すべての計算履歴と概要を表示',
    'dashboard.empty': '計算履歴がありません',
    'dashboard.empty.desc': '計算機を使用して履歴を保存',
    'dashboard.totalCalculations': '総計算回数',
    'dashboard.creditCards': 'クレジットカード',
    'dashboard.studentLoans': '学生ローン',
    'dashboard.lastCalculation': '最新',
    'dashboard.startCreditCard': 'クレジットカード計算',
    'dashboard.startStudentLoan': '学生ローン計算',
    'dashboard.showing': '表示中',
    'dashboard.items': '件',
    'dashboard.clearAll': 'すべて削除',
    'dashboard.confirmDelete': 'この計算を削除しますか？',
    'dashboard.confirmClearAll': 'すべての計算履歴を削除しますか？',
    'dashboard.creditCard': 'クレジットカード',
    'dashboard.studentLoan': '学生ローン',
    'dashboard.balance': '残高',
    'dashboard.apr': '金利',
    'dashboard.monthlyPayment': '月々の支払い',
    'dashboard.duration': '期間',
    'dashboard.months': 'ヶ月',
    'dashboard.loanAmount': 'ローン金額',
    'dashboard.totalPaid': '総支払額',
    'dashboard.totalInterest': '総利息',
    'dashboard.totalDebt': '総債務',
    'dashboard.avgAPR': '平均金利',
    'dashboard.avgDuration': '平均期間',
    'dashboard.distribution': 'タイプ分布',
    'dashboard.trend': '月間トレンド',
    'dashboard.interestComparison': '利息比較',
    'dashboard.calculations': '計算回数',
    'dashboard.principal': '元金',
    'dashboard.interest': '利息',
    
    // AI Analysis
    'ai.analyzing': 'AIがあなたの債務状況を分析中...',
    'ai.profileTitle': 'AI債務状況分析',
    'ai.riskLevel': '財務リスクレベル',
    'ai.recommendation': 'アクションの推奨事項',
    'ai.accuracy': '精度',
    
    // Table
    'table.title': '月々の返済スケジュール',
    'table.month': '月',
    'table.payment': '支払い',
    'table.interest': '利息',
    'table.principal': '元金',
    'table.remaining': '残高',
    'table.showingFirst': '最初の',
    'table.monthsFirst': 'ヶ月（全',
    'table.monthsTotal': 'ヶ月）',
    'table.downloadCSV': '（CSVダウンロードで全データ表示）',

    // Chart
    'chart.title': '残高チャート',
    'chart.pieTitle': '元金対利息の内訳',
    'chart.balance': '残高',
    'chart.interest': '利息',

    // AI Advisor
    'advisor.title': 'AI 財務顧問',
    'advisor.currentInfo': '現在の情報：',
    'advisor.balance': '残高',
    'advisor.interest': '利息',
    'advisor.payment': '月々の支払い',
    'advisor.quickQuestions': 'クイック質問：',
    'advisor.inputPlaceholder': '質問する... 例：2000払ったら？',
    'advisor.send': '送信',
    'advisor.newQuestion': '新しい質問',
    'advisor.comparisonTitle': '詳細比較',
    'advisor.scenario1': 'シナリオ 1',
    'advisor.scenario2': 'シナリオ 2',
    'advisor.savings': '節約',
    'advisor.faster': '短縮',
    'advisor.saveMoney': '節約額',
    'advisor.reduceInterest': '利息削減',
    'advisor.perYear': '年',
    'advisor.warning': '警告',
    'advisor.answer.tooLow': '支払額が低すぎます！利息をカバーできず、借金は永久に返済できません',
    'advisor.recommendation': 'AIからの推奨',
    'advisor.minPayment': '最低額（非推奨！）',
    'advisor.recommendedPayment': '推奨額（バランス良し）',
    'advisor.idealPayment': '理想額（最大節約！）',
    'advisor.result': '計算結果',
    
    // Severity Levels
    'severity.low': '低リスク',
    'severity.medium': '中程度のリスク',
    'severity.high': '高リスク',
    'severity.critical': '重大なリスク',
    'severity.unknown': '不明',
    
    // Toast Messages
    'toast.undo': '元に戻す',
    'toast.cancel': 'キャンセル',
    'toast.itemRestored': 'アイテムを復元しました',
    'toast.allCleared': 'すべての計算を削除しました',
    
    // Tutorial
    'tutorial.title': 'チュートリアル',
    'tutorial.back': '戻る',
    'tutorial.next': '次へ',
    'tutorial.start': '始める',
    'tutorial.skip': 'スキップ',
    
    // AI Advisor Header
    'advisor.headerTitle': 'AI 財務顧問',
    'advisor.headerSubtitle': 'あなたの個人財務アシスタント',
    
    // What-If Analysis
    'whatif.title': '仮定分析：もっと支払ってみる？',
    'whatif.extraPayment': '追加支払い',
    'whatif.perMonth': '毎月',
    'whatif.result': '結果',
    'whatif.fasterBy': '短縮',
    'whatif.saveInterest': '利息を節約',
    'whatif.hint': 'スライドして多く支払うとどれくらい節約できるか確認',
    
    // Print
    'print.title': 'PDF印刷',
    
    // AI v4.0 Section
    'ai.v4.title': '🧠 AI 財務分析',
    'ai.v4.healthScore': '❤️ 財務健全度',
    'ai.v4.riskLevel': '⚡ リスクレベル',
    'ai.v4.riskMeter': '📊 リスクメーター',
    'ai.v4.riskLow': '🟢 低リスク',
    'ai.v4.riskMedium': '🟡 中程度のリスク',
    'ai.v4.riskHigh': '🟠 高リスク',
    'ai.v4.riskCritical': '🔴 重大なリスク',
    'ai.v4.debtFreedom': '完済まで',
    'ai.v4.debtFreedomStudent': '学生ローン完済',
    'ai.v4.recommendedExtra': '追加支払い推奨',
    'ai.v4.recommendedExtraMonth': '追加支払い推奨/月',
    'ai.v4.extraPaymentWhatIf': '追加 (仮定)',
    'ai.v4.whatIfResult': '🎯 仮定:',
    'ai.v4.fasterBy': '短縮',
    'ai.v4.saveAmount': '節約',
    'ai.v4.personalizedTips': '📊 あなたのデータから分析',
    'ai.v4.actionTips': '💡 推奨アクション',
    'ai.v4.personalizedTipsFor': '💡 あなたへのアドバイス:',
    'ai.v4.strategy': '🎯 戦略',
    'ai.v4.strategyRecommended': '🎯 推奨戦略',
    'ai.v4.primaryAction': '⭐ アクション',
    'ai.v4.primaryActionFirst': '⭐ 優先アクション',
    'ai.v4.emergencyFund': '🏦 少なくとも持つべき緊急資金',
    'ai.v4.months': 'ヶ月',
    'ai.v4.dtiRatio': '📊 DTI 比率',
    'ai.v4.interest': '💰 利息',
    'ai.v4.actions': '🎯 アクション:',
    'ai.v4.payMoreTip': '💡 多く支払えば早く完済',
    'ai.v4.saveTip': '節約',
    
    // Footer
    'footer.about': '私たちについて',
    'footer.aboutText': 'YDP Eduvice Fellowshipが開発した無料のオンライン金融計算機',
    'footer.tools': 'ツール',
    'footer.contact': 'お問い合わせ',
    'footer.contactText': 'ご提案・ご質問はこちらまで',
    'footer.email': 'メール',
    'footer.copyright': '© 2025 YDP Eduvice Fellowship - FinLand',
    'footer.disclaimer': '結果は推定値であり、正式な財務アドバイスではありません',
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language') as Language | null
    return saved || 'th'
  })

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
