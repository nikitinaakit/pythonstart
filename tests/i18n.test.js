// Файл: tests/i18n.test.js – Модульні тести локалізації та контракту даних (ЛР № 11)
import { describe, it, expect } from 'vitest';
import { t } from '../js/i18n.js';
import { messagesUk } from '../js/messages.uk.js';
import { topicsData } from '../data/topics.js';

describe('Модуль js/i18n.js – Українська локалізація інтерфейсу', () => {
  it('повинен повертати правильний український переклад за наявним ключем словника', () => {
    expect(t('appTitle')).toBe(messagesUk.appTitle);
    expect(t('answerCorrect')).toContain('Правильна');
  });

  it('повинен повертати сам ключ як резервне значення, якщо переклад відсутній у словнику (Edge Case)', () => {
    expect(t('unknownMissingKey')).toBe('unknownMissingKey');
  });
});

describe('Контракт даних data/topics.js – Цілісність структури навчальних тем', () => {
  it('масив topicsData повинен містити щонайменше 4 навчальні теми курсу', () => {
    expect(Array.isArray(topicsData)).toBe(true);
    expect(topicsData.length).toBeGreaterThanOrEqual(4);
  });

  it('кожна тема у data/topics.js повинна мати всі обов’язкові непорожні поля контракту', () => {
    const requiredFields = [
      'id',
      'stepLabel',
      'title',
      'description',
      'theory',
      'codeExample',
      'tip',
      'task',
      'hint',
      'correctAnswer'
    ];

    topicsData.forEach((topic) => {
      requiredFields.forEach((field) => {
        expect(typeof topic[field]).toBe('string');
        expect(topic[field].trim().length).toBeGreaterThan(0);
      });
    });
  });

  it('усі ідентифікатори тем (id) у масиві topicsData мають бути унікальними', () => {
    const ids = topicsData.map((item) => item.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
