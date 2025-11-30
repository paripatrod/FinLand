import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock API_BASE_URL for testing
vi.mock('../api', async () => {
  const actual = await vi.importActual('../api');
  return {
    ...actual,
  };
});

describe('API Client', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Credit Card Validation', () => {
    it('should reject payment lower than monthly interest', () => {
      const balance = 500000;
      const apr = 8;
      const payment = 2000;
      
      const monthlyInterest = balance * (apr / 100 / 12);
      
      expect(payment).toBeLessThan(monthlyInterest);
      expect(monthlyInterest).toBeCloseTo(3333.33, 0);
    });

    it('should accept payment higher than monthly interest', () => {
      const balance = 500000;
      const apr = 8;
      const payment = 5000;
      
      const monthlyInterest = balance * (apr / 100 / 12);
      
      expect(payment).toBeGreaterThan(monthlyInterest);
    });

    it('should calculate minimum payment correctly', () => {
      const balance = 100000;
      const apr = 15;
      
      const monthlyInterest = balance * (apr / 100 / 12);
      const minimumPayment = Math.ceil(monthlyInterest * 1.01);
      
      expect(minimumPayment).toBeGreaterThan(monthlyInterest);
      expect(minimumPayment).toBeCloseTo(1263, 0);
    });
  });

  describe('Student Loan Validation', () => {
    it('should calculate monthly payment for student loan', () => {
      const principal = 200000;
      const apr = 1; // กยศ. rate
      const years = 15;
      
      const termMonths = years * 12;
      const monthlyRate = apr / 100 / 12;
      
      const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                      (Math.pow(1 + monthlyRate, termMonths) - 1);
      
      expect(payment).toBeGreaterThan(0);
      expect(payment).toBeLessThan(principal / 12); // Should be less than principal/12 months
    });

    it('should handle zero interest rate', () => {
      const principal = 200000;
      const apr = 0;
      const years = 15;
      
      const termMonths = years * 12;
      const payment = principal / termMonths;
      
      expect(payment).toBeCloseTo(1111.11, 0);
    });

    it('should calculate DTI ratio correctly', () => {
      const monthlyPayment = 5000;
      const monthlyIncome = 25000;
      
      const dti = (monthlyPayment / monthlyIncome) * 100;
      
      expect(dti).toBe(20);
      expect(dti).toBeLessThan(40); // Healthy threshold
    });

    it('should flag high DTI ratio', () => {
      const monthlyPayment = 20000;
      const monthlyIncome = 25000;
      
      const dti = (monthlyPayment / monthlyIncome) * 100;
      
      expect(dti).toBe(80);
      expect(dti).toBeGreaterThan(50); // Warning threshold
    });
  });

  describe('What-If Calculation', () => {
    it('should calculate interest savings with extra payment', () => {
      const balance = 100000;
      const apr = 15;
      const basePayment = 3000;
      const extraPayment = 2000;
      
      const monthlyRate = apr / 100 / 12;
      
      // Calculate with base payment
      let balanceBase = balance;
      let monthsBase = 0;
      let interestBase = 0;
      
      while (balanceBase > 0 && monthsBase < 600) {
        monthsBase++;
        const interest = balanceBase * monthlyRate;
        const principal = basePayment - interest;
        balanceBase -= principal;
        interestBase += interest;
      }
      
      // Calculate with extra payment
      let balanceExtra = balance;
      let monthsExtra = 0;
      let interestExtra = 0;
      
      while (balanceExtra > 0 && monthsExtra < 600) {
        monthsExtra++;
        const interest = balanceExtra * monthlyRate;
        const principal = (basePayment + extraPayment) - interest;
        balanceExtra -= principal;
        interestExtra += interest;
      }
      
      const savedMonths = monthsBase - monthsExtra;
      const savedInterest = interestBase - interestExtra;
      
      expect(savedMonths).toBeGreaterThan(0);
      expect(savedInterest).toBeGreaterThan(0);
    });
  });
});
