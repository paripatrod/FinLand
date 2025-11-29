// PDF Export Utility - Print-friendly payment schedule
import type { SavedCalculation } from '../types';

interface ScheduleRow {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  remaining: number;
}

interface ExportData {
  type: 'credit-card' | 'student-loan';
  data: {
    balance?: number;
    loan_amount?: number;
    apr?: number;
    interest_rate?: number;
    monthly_payment?: number;
    term_months?: number;
  };
  result: {
    months?: number;
    monthly_payment?: number;
    total_paid: number;
    total_interest: number;
    schedule: ScheduleRow[];
  };
  date?: string;
}

/**
 * Generate HTML content for PDF printing
 */
function generatePrintHTML(data: ExportData): string {
  const isCredit = data.type === 'credit-card';
  const principal = data.data.balance || data.data.loan_amount || 0;
  const rate = data.data.apr || data.data.interest_rate || 0;
  const months = data.result.months || data.data.term_months || 0;
  const monthlyPayment = data.result.monthly_payment || data.data.monthly_payment || 0;
  
  const formatNumber = (num: number) => num.toLocaleString('th-TH', { maximumFractionDigits: 2 });
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return new Date().toLocaleDateString('th-TH');
    return new Date(dateStr).toLocaleDateString('th-TH');
  };

  // Calculate summary
  const totalInterest = data.result.total_interest;
  const totalPaid = data.result.total_paid;
  const interestPercent = principal > 0 ? ((totalInterest / principal) * 100).toFixed(1) : '0';

  return `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ตารางการผ่อนชำระ - FinLand</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Sarabun', 'Segoe UI', sans-serif;
      font-size: 12px;
      line-height: 1.5;
      color: #1f2937;
      background: white;
      padding: 20px;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    
    /* Header */
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #10b981;
    }
    
    .header h1 {
      font-size: 24px;
      color: #059669;
      margin-bottom: 5px;
    }
    
    .header .subtitle {
      color: #6b7280;
      font-size: 14px;
    }
    
    .header .date {
      margin-top: 10px;
      color: #9ca3af;
      font-size: 11px;
    }
    
    /* Summary Cards */
    .summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 30px;
    }
    
    .summary-card {
      padding: 15px;
      border-radius: 10px;
      text-align: center;
    }
    
    .summary-card.primary {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
    }
    
    .summary-card.secondary {
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
    }
    
    .summary-card .label {
      font-size: 10px;
      text-transform: uppercase;
      opacity: 0.8;
      margin-bottom: 5px;
    }
    
    .summary-card .value {
      font-size: 18px;
      font-weight: bold;
    }
    
    .summary-card .unit {
      font-size: 11px;
      opacity: 0.7;
    }
    
    /* Info Section */
    .info-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .info-box {
      padding: 15px;
      background: #f9fafb;
      border-radius: 10px;
      border: 1px solid #e5e7eb;
    }
    
    .info-box h3 {
      font-size: 13px;
      color: #374151;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
    }
    
    .info-row .label {
      color: #6b7280;
    }
    
    .info-row .value {
      font-weight: 600;
      color: #1f2937;
    }
    
    /* Table */
    .table-section {
      margin-bottom: 30px;
    }
    
    .table-section h2 {
      font-size: 16px;
      color: #374151;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .table-section h2::before {
      content: '';
      width: 4px;
      height: 20px;
      background: #10b981;
      border-radius: 2px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    
    th {
      background: #10b981;
      color: white;
      padding: 10px 8px;
      text-align: right;
      font-weight: 600;
    }
    
    th:first-child {
      text-align: center;
      border-radius: 8px 0 0 0;
    }
    
    th:last-child {
      border-radius: 0 8px 0 0;
    }
    
    td {
      padding: 8px;
      text-align: right;
      border-bottom: 1px solid #e5e7eb;
    }
    
    td:first-child {
      text-align: center;
      font-weight: 600;
      color: #6b7280;
    }
    
    tr:nth-child(even) {
      background: #f9fafb;
    }
    
    tr:hover {
      background: #ecfdf5;
    }
    
    .highlight-row {
      background: #dcfce7 !important;
      font-weight: 600;
    }
    
    /* Footer */
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #9ca3af;
      font-size: 10px;
    }
    
    .footer .disclaimer {
      margin-bottom: 10px;
      padding: 10px;
      background: #fef3c7;
      border-radius: 8px;
      color: #92400e;
    }
    
    .footer .brand {
      font-weight: 600;
      color: #10b981;
    }
    
    /* Print styles */
    @media print {
      body {
        padding: 10px;
        font-size: 10px;
      }
      
      .summary {
        grid-template-columns: repeat(4, 1fr);
      }
      
      .summary-card {
        padding: 10px;
      }
      
      .summary-card .value {
        font-size: 14px;
      }
      
      table {
        font-size: 9px;
      }
      
      th, td {
        padding: 5px 4px;
      }
      
      .no-print {
        display: none;
      }
      
      @page {
        margin: 1cm;
        size: A4;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>💰 FinLand</h1>
      <p class="subtitle">${isCredit ? 'ตารางการผ่อนชำระบัตรเครดิต' : 'ตารางการผ่อนชำระ กยศ./Student Loan'}</p>
      <p class="date">สร้างเมื่อ: ${formatDate(data.date)}</p>
    </div>
    
    <!-- Summary Cards -->
    <div class="summary">
      <div class="summary-card primary">
        <div class="label">${isCredit ? 'ยอดคงค้าง' : 'ยอดกู้'}</div>
        <div class="value">${formatNumber(principal)}</div>
        <div class="unit">บาท</div>
      </div>
      <div class="summary-card secondary">
        <div class="label">ระยะเวลา</div>
        <div class="value">${months}</div>
        <div class="unit">เดือน (${(months / 12).toFixed(1)} ปี)</div>
      </div>
      <div class="summary-card secondary">
        <div class="label">รวมดอกเบี้ย</div>
        <div class="value">${formatNumber(totalInterest)}</div>
        <div class="unit">บาท (${interestPercent}%)</div>
      </div>
      <div class="summary-card secondary">
        <div class="label">รวมจ่ายทั้งหมด</div>
        <div class="value">${formatNumber(totalPaid)}</div>
        <div class="unit">บาท</div>
      </div>
    </div>
    
    <!-- Info Section -->
    <div class="info-section">
      <div class="info-box">
        <h3>📋 ข้อมูลการกู้</h3>
        <div class="info-row">
          <span class="label">${isCredit ? 'ยอดหนี้บัตรเครดิต' : 'เงินต้น'}</span>
          <span class="value">${formatNumber(principal)} บาท</span>
        </div>
        <div class="info-row">
          <span class="label">อัตราดอกเบี้ยต่อปี</span>
          <span class="value">${rate}%</span>
        </div>
        <div class="info-row">
          <span class="label">อัตราดอกเบี้ยต่อเดือน</span>
          <span class="value">${(rate / 12).toFixed(4)}%</span>
        </div>
      </div>
      <div class="info-box">
        <h3>💳 ข้อมูลการผ่อน</h3>
        <div class="info-row">
          <span class="label">จ่ายต่อเดือน</span>
          <span class="value">${formatNumber(monthlyPayment)} บาท</span>
        </div>
        <div class="info-row">
          <span class="label">จำนวนงวด</span>
          <span class="value">${months} เดือน</span>
        </div>
        <div class="info-row">
          <span class="label">ระยะเวลา</span>
          <span class="value">${Math.floor(months / 12)} ปี ${months % 12} เดือน</span>
        </div>
      </div>
    </div>
    
    <!-- Payment Schedule Table -->
    <div class="table-section">
      <h2>ตารางการผ่อนชำระรายเดือน</h2>
      <table>
        <thead>
          <tr>
            <th>เดือน</th>
            <th>ยอดชำระ (บาท)</th>
            <th>เงินต้น (บาท)</th>
            <th>ดอกเบี้ย (บาท)</th>
            <th>ยอดคงเหลือ (บาท)</th>
          </tr>
        </thead>
        <tbody>
          ${data.result.schedule.map((row, index) => `
            <tr class="${row.remaining === 0 ? 'highlight-row' : ''}">
              <td>${row.month}</td>
              <td>${formatNumber(row.payment)}</td>
              <td>${formatNumber(row.principal)}</td>
              <td>${formatNumber(row.interest)}</td>
              <td>${formatNumber(row.remaining)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="disclaimer">
        ⚠️ ข้อมูลนี้เป็นการคำนวณเชิงประมาณการเพื่อการวางแผนเบื้องต้นเท่านั้น ไม่ใช่คำแนะนำทางการเงินอย่างเป็นทางการ
      </div>
      <p>สร้างโดย <span class="brand">FinLand</span> | © 2025 YDP Eduvice Fellowship</p>
      <p>🌐 finland-app.vercel.app</p>
    </div>
  </div>
  
  <script>
    // Auto print when opened
    // window.onload = () => window.print();
  </script>
</body>
</html>
  `;
}

/**
 * Export payment schedule as printable PDF
 */
export function exportToPDF(data: ExportData): void {
  const html = generatePrintHTML(data);
  
  // Open in new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('กรุณาอนุญาต Pop-up เพื่อพิมพ์เอกสาร');
    return;
  }
  
  printWindow.document.write(html);
  printWindow.document.close();
  
  // Wait for content to load then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
}

/**
 * Export from saved calculation
 */
export function exportCalculationToPDF(calculation: SavedCalculation): void {
  // Extract data with type safety
  const scheduleData = (calculation.result as any).schedule || [];
  
  exportToPDF({
    type: calculation.type,
    data: calculation.data as ExportData['data'],
    result: {
      months: (calculation.result as any).months,
      monthly_payment: (calculation.result as any).monthly_payment,
      total_paid: (calculation.result as any).total_paid || 0,
      total_interest: (calculation.result as any).total_interest || 0,
      schedule: scheduleData
    },
    date: calculation.date
  });
}

/**
 * Quick export with current calculation data
 */
export function printPaymentSchedule(
  type: 'credit-card' | 'student-loan',
  data: ExportData['data'],
  result: ExportData['result']
): void {
  exportToPDF({
    type,
    data,
    result,
    date: new Date().toISOString()
  });
}
