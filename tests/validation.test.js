
import { describe, it, expect } from 'vitest';
import {
  normalizeAnswer,
  diagnoseStudentMistake,
  validateExerciseAnswer
} from '../js/validation.js';

import { messages } from '../js/messages.uk.js';
import { t } from '../js/i18n.js';

describe('normalizeAnswer', () => {
  it('видаляє зайві пробіли', () => {
    expect(normalizeAnswer('   15   ')).toBe('15');
    expect(normalizeAnswer(' Зараховано ')).toBe('Зараховано');
  });

  it('обробляє null та undefined', () => {
    expect(normalizeAnswer(null)).toBe('');
    expect(normalizeAnswer(undefined)).toBe('');
  });
});

describe('diagnoseStudentMistake', () => {
  it('розпізнає використання print()', () => {
    expect(diagnoseStudentMistake('print(15)', '15'))
      .toBe('mistakeUsedPrint');
  });

  it('розпізнає зайві лапки', () => {
    expect(diagnoseStudentMistake('"15"', '15'))
      .toBe('mistakeExtraQuotes');
  });

  it('розпізнає помилку на одиницю', () => {
    expect(diagnoseStudentMistake('14', '15'))
      .toBe('mistakeOffByOne');
  });
});

describe('validateExerciseAnswer', () => {
  it('визначає правильну відповідь', () => {
    const result = validateExerciseAnswer('15', '15');

    expect(result.isCorrect).toBe(true);
    expect(result.status).toBe('success');
    expect(result.messageKey).toBe('exercise.correct');
  });

  it('ігнорує регістр та зайві пробіли', () => {
    const result = validateExerciseAnswer('   ЗАРАХОВАНО ', 'зараховано');

    expect(result.isCorrect).toBe(true);
    expect(result.status).toBe('success');
  });

  it('визначає порожню відповідь', () => {
    for (const answer of ['', '   ']) {
      const result = validateExerciseAnswer(answer, '15');

      expect(result.isCorrect).toBe(false);
      expect(result.status).toBe('empty');
      expect(result.messageKey).toBe('exercise.emptyWarning');
    }
  });

  it('визначає неправильну відповідь', () => {
    const result = validateExerciseAnswer('99', '15');

    expect(result.isCorrect).toBe(false);
    expect(result.status).toBe('error');
  });
});

describe('i18n', () => {
  it('повертає переклад повідомлення за ключем', () => {
    expect(t('mistakeOffByOne')).toBe(messages.mistakeOffByOne);
  });
});
