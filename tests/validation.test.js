
import { describe, it, expect } from 'vitest';

import {
  sanitizeInput,
  normalizeAnswer,
  diagnoseStudentMistake,
  validateUserAnswer
} from '../js/validation.js';

import { messagesUk } from '../js/messages.uk.js';

describe('Модуль js/validation.js – Валідація відповідей, діагностика та захист від XSS', () => {

  describe('sanitizeInput() та normalizeAnswer()', () => {

    it('повинен видаляти HTML-теги та кутові дужки для захисту від XSS (BUG-02)', () => {
      const malicious = '<script>alert("xss")</script>15<b>!</b>';

      expect(sanitizeInput(malicious)).toBe('alert("xss")15!');
    });

    it('повинен обрізати зайві пробіли та прибирати крапку з комою в кінці (BUG-02)', () => {
      expect(normalizeAnswer('  15;  ')).toBe('15');
      expect(normalizeAnswer('x = 10;')).toBe('x = 10');
    });

    it('повинен безпечно повертати порожній рядок для null або undefined', () => {
      expect(normalizeAnswer(null)).toBe('');
      expect(sanitizeInput(undefined)).toBe('');
    });

  });

  describe('validateUserAnswer()', () => {

    it('повинен повертати isValid: true для точної відповіді та відповіді з крапкою з комою', () => {
      expect(validateUserAnswer('15', '15').isValid).toBe(true);
      expect(validateUserAnswer(' 15; ', '15').isValid).toBe(true);
    });

    it('повинен зараховувати правильну відповідь незалежно від регістру та пробілів', () => {
      const result = validateUserAnswer(' зараховано ', 'Зараховано');

      expect(result.isValid).toBe(true);
      expect(result.status).toBe('correct');
    });

    it('повинен повертати статус empty для порожнього рядка, пробілів або порожніх HTML-тегів', () => {
      expect(validateUserAnswer('', '15').status).toBe('empty');
      expect(validateUserAnswer('   ', '15').status).toBe('empty');
      expect(validateUserAnswer('<script></script>', '15').status).toBe('empty');
    });

    it('повинен повертати статус incorrect для неправильної відповіді', () => {
      const result = validateUserAnswer('99', '15');

      expect(result.isValid).toBe(false);
      expect(result.status).toBe('incorrect');
    });

  });

  describe('diagnoseStudentMistake()', () => {

    it('повинен розпізнавати зайвий виклик print(...) замість результату', () => {
      expect(diagnoseStudentMistake('print(15)', '15'))
        .toBe(messagesUk.mistakeUsedPrint);
    });

    it('повинен розпізнавати зайві лапки навколо правильної відповіді', () => {
      expect(diagnoseStudentMistake('"15"', '15'))
        .toBe(messagesUk.mistakeExtraQuotes);
    });

    it('повинен розпізнавати похибку на одиницю (Off-by-one)', () => {
      expect(diagnoseStudentMistake('14', '15'))
        .toBe(messagesUk.mistakeOffByOne);
    });

  });

});
