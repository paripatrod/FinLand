// API Request/Response Types
export interface CreditCardRequest { 
  balance: number; 
  apr: number; 
  monthly_payment: number;
}

export interface CreditCardResponse { 
  success?: boolean;
  months: number;
  total_paid: number;
  total_interest: number;
  schedule: PaymentScheduleItem[];
}

export interface StudentLoanRequest { 
  loan_amount: number; 
  interest_rate: number; 
  term_months: number;
}

export interface StudentLoanResponse { 
  success?: boolean;
  monthly_payment: number;
  total_paid: number;
  total_interest: number;
  schedule: PaymentScheduleItem[];
}

export interface PaymentScheduleItem {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  remaining: number;
}

// AI Analysis v4.0 Response Types
export interface AIAnalysisResponse {
  success: boolean;
  version: string;
  financial_health?: {
    health_score: number;
    dti_ratio: number;
    affordability_index: number;
  };
  insights?: {
    severity: 'critical' | 'high' | 'medium' | 'low';
    risk_score: number;
    tips: string[];
    actions: string[];
  };
  debt_analysis?: {
    debt_freedom_months: number;
    smart_payment_boost: number;
    time_saved: number;
    time_saved_months?: number;
    money_saved: number;
    money_saved_total?: number;
  };
  strategy?: {
    payoff_strategy: string;
    primary_action: string;
    urgency_level?: string;
  };
  planning?: {
    emergency_buffer_months: number;
  };
  personalized_insights?: {
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    risk_meter: number;
    smart_tips: string[];
    dti_analysis?: {
      status: 'healthy' | 'warning' | 'critical';
      ratio: number;
      message: string;
    };
  };
}

// AI Profile Types
export interface AIProfile {
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_score: number;
  dti_ratio: number;
  debt_category: string;
  recommendations: string[];
  predicted_profile: string;
  confidence: number;
}

// What-If Analysis Types
export interface WhatIfResult {
  months: number;
  totalInterest: number;
  savedInterest: number;
  savedMonths: number;
}

// Storage Types
export interface SavedCalculation {
  id: string;
  type: 'credit-card' | 'student-loan';
  date: string;
  data: Record<string, number>;  // Flexible for both types
  result: Record<string, number>;  // Flexible for both types
}

export interface CreditCardData {
  balance: number;
  apr: number;
  monthly_payment: number;
}

export interface StudentLoanData {
  loan_amount: number;
  interest_rate: number;
  term_months: number;
}

export interface CreditCardResult {
  months: number;
  total_paid: number;
  total_interest: number;
  schedule?: PaymentScheduleItem[];
}

export interface StudentLoanResult {
  monthly_payment: number;
  total_paid: number;
  total_interest: number;
  schedule?: PaymentScheduleItem[];
}

export interface StorageData {
  calculations: SavedCalculation[];
  stats: {
    totalCalculations: number;
    lastCalculation: number;
  };
}

// Scenario Comparison for AI Advisor
export interface ScenarioComparison {
  scenario1: {
    payment: number;
    months: number;
    totalInterest: number;
    totalPaid: number;
  };
  scenario2: {
    payment: number;
    months: number;
    totalInterest: number;
    totalPaid: number;
  };
  savings: {
    months: number;
    interest: number;
    total: number;
    percentage: number;
  };
}
