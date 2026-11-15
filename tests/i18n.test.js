
// Файл: tests/i18n.test.js – Модульні тести локалізації та контракту даних (ЛР № 11)

import { describe, it, expect } from 'vitest';
import { t } from '../js/i18n.js';
import { messages } from '../js/messages.uk.js';
import { topicsData } from '../data/topics.js';

describe('Модуль js/i18n.js – Українська локалізація інтерфейсу', () => {
  it('повинен повертати правильний український переклад за наявним ключем словника', () => {
    expect(t('app.title')).toBe(messages['app.title']);
    expect(t('exercise.correct')).toContain('Правильно');
  });

  it('повинен повертати сам ключ як резервне значення, якщо переклад відсутній у словнику (Edge Case)', () => {
    expect(t('unknownMissingKey')).toBe('unknownMissingKey');
  });
});

describe('Контракт даних data/topics.js – Цілісність структури навчальних тем', () => {
  it('масив topicsData повинен містити рівно 3 навчальні теми курсу', () => {
    expect(Array.isArray(topicsData)).toBe(true);
    expect(topicsData).toHaveLength(3);
  });

  it('кожна тема повинна мати всі обов’язкові непорожні поля', () => {
    const requiredFields = [
      'id',
      'title',
      'description',
      'theory',
      'task',
      'correctAnswer'
    ];

    topicsData.forEach((topic) => {
      requiredFields.forEach((field) => {
        expect(typeof topic[field]).toBe('string');
        expect(topic[field].trim().length).toBeGreaterThan(0);
      });
    });
  });

  it('усі ідентифікатори тем (id) повинні бути унікальними', () => {
    const ids = topicsData.map((item) => item.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
  });
});
