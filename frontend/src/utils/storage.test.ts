import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { saveCalculation, getHistory, saveToHistory, clearHistory } from './storage';

describe('Storage Utils', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('saveCalculation', () => {
    it('should save a calculation to localStorage', () => {
      const calculation = {
        id: '1',
        type: 'credit-card' as const,
        date: new Date().toISOString(),
        data: { balance: 100000, apr: 15, monthly_payment: 3000 },
        result: { months: 44, total_paid: 131000, total_interest: 31000 }
      };

      saveCalculation(calculation);

      const stored = localStorage.getItem('finland_calculations');
      expect(stored).not.toBeNull();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.calculations).toHaveLength(1);
      expect(parsed.calculations[0].id).toBe('1');
    });

    it('should append to existing calculations', () => {
      const calc1 = {
        id: '1',
        type: 'credit-card' as const,
        date: new Date().toISOString(),
        data: { balance: 100000, apr: 15, monthly_payment: 3000 },
        result: { months: 44, total_paid: 131000, total_interest: 31000 }
      };
      
      const calc2 = {
        id: '2',
        type: 'student-loan' as const,
        date: new Date().toISOString(),
        data: { loan_amount: 200000, interest_rate: 1, term_months: 180 },
        result: { monthly_payment: 1200, total_paid: 216000, total_interest: 16000 }
      };

      saveCalculation(calc1);
      saveCalculation(calc2);

      const stored = localStorage.getItem('finland_calculations');
      const parsed = JSON.parse(stored!);
      
      expect(parsed.calculations).toHaveLength(2);
    });

    it('should limit calculations to 50 entries', () => {
      // Add 55 calculations
      for (let i = 0; i < 55; i++) {
        saveCalculation({
          id: String(i),
          type: 'credit-card' as const,
          date: new Date().toISOString(),
          data: { balance: 100000, apr: 15, monthly_payment: 3000 },
          result: { months: 44, total_paid: 131000, total_interest: 31000 }
        });
      }

      const stored = localStorage.getItem('finland_calculations');
      const parsed = JSON.parse(stored!);
      
      expect(parsed.calculations.length).toBeLessThanOrEqual(50);
    });
  });

  describe('getHistory', () => {
    it('should return empty array when no history exists', () => {
      const history = getHistory();
      expect(history).toEqual([]);
    });

    it('should return saved calculations', () => {
      const calculation = {
        id: '1',
        type: 'credit-card' as const,
        date: new Date().toISOString(),
        data: { balance: 100000, apr: 15, monthly_payment: 3000 },
        result: { months: 44, total_paid: 131000, total_interest: 31000 }
      };

      saveCalculation(calculation);
      const history = getHistory();

      expect(history).toHaveLength(1);
      expect(history[0].id).toBe('1');
    });
  });

  describe('clearHistory', () => {
    it('should clear all calculations', () => {
      saveCalculation({
        id: '1',
        type: 'credit-card' as const,
        date: new Date().toISOString(),
        data: { balance: 100000, apr: 15, monthly_payment: 3000 },
        result: { months: 44, total_paid: 131000, total_interest: 31000 }
      });

      clearHistory();
      const history = getHistory();

      expect(history).toEqual([]);
    });
  });

  describe('saveToHistory', () => {
    it('should save with correct format', () => {
      const entry = {
        id: '1',
        type: 'credit-card' as const,
        timestamp: Date.now(),
        inputs: { balance: 100000, apr: 15, monthly_payment: 3000 },
        results: { months: 44, total_paid: 131000, total_interest: 31000 }
      };

      saveToHistory(entry);

      const stored = localStorage.getItem('finland_history');
      expect(stored).not.toBeNull();
      
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].type).toBe('credit-card');
    });
  });
});
