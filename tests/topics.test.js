
// ===========================================================
// Файл: tests/topics.test.js
// Модульні тести пошуку, фільтрації та статистики каталогу
// ЛР № 12 – BUG-03
// ===========================================================

import { describe, it, expect } from 'vitest';
import { filterTopicsData, getCatalogStats } from '../js/topics.js';
import { topicsData } from '../data/topics.js';

describe('Модуль js/topics.js – Пошук, фільтрація та статистика навчальних тем', () => {

  it('повинен знаходити тему за збігом ключового слова у назві', () => {
    const result = filterTopicsData(topicsData, {
      searchQuery: 'списки'
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('lists');
  });

  it('повинен виконувати пошук без урахування регістру та кратних внутрішніх пробілів (BUG-03)', () => {
    const result = filterTopicsData(topicsData, {
      searchQuery: '   ЦИКЛИ   '
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('loops');
  });

  it('повинен знаходити тему, якщо пошукове слово зустрічається лише в описі', () => {
    const result = filterTopicsData(topicsData, {
      searchQuery: 'колекції'
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('lists');
  });

  it('повинен повертати всі 4 теми при порожньому запиті або рядку з пробілів', () => {
    const emptyRes = filterTopicsData(topicsData, {
      searchQuery: ''
    });

    const spacesRes = filterTopicsData(topicsData, {
      searchQuery: '    '
    });

    expect(emptyRes).toHaveLength(4);
    expect(spacesRes).toHaveLength(4);
  });

  it('повинен повертати порожній масив, якщо збігів немає, і не змінювати вхідний масив', () => {
    const snapshot = [...topicsData];

    const result = filterTopicsData(topicsData, {
      searchQuery: 'нейромережа'
    });

    expect(result).toEqual([]);
    expect(topicsData).toEqual(snapshot);
  });

  it('повинен коректно фільтрувати опрацьовані та неопрацьовані теми', () => {
    const completed = ['variables', 'conditions'];

    const doneList = filterTopicsData(topicsData, {
      filter: 'completed',
      completedTopics: completed
    });

    const pendingList = filterTopicsData(topicsData, {
      filter: 'pending',
      completedTopics: completed
    });

    expect(doneList).toHaveLength(2);
    expect(pendingList).toHaveLength(2);
    expect(pendingList.map((t) => t.id)).toEqual(['loops', 'lists']);
  });

  it('повинен безпечно обробляти null замість масиву тем і completedTopics (BUG-03)', () => {
    expect(
      filterTopicsData(null, { searchQuery: 'змінні' })
    ).toEqual([]);

    const result = filterTopicsData(topicsData, {
      filter: 'completed',
      completedTopics: null
    });

    expect(result).toEqual([]);
  });

  it('повинен безпечно обробляти undefined замість completedTopics', () => {
    const result = filterTopicsData(topicsData, {
      filter: 'completed',
      completedTopics: undefined
    });

    expect(result).toEqual([]);
  });

  it('повинен коректно обчислювати статистику каталогу через getCatalogStats()', () => {
    const stats = getCatalogStats(topicsData, [
      'variables',
      'loops'
    ]);

    expect(stats).toEqual({
      total: 4,
      completed: 2,
      remaining: 2,
      percent: 50
    });
  });

  it('повинен повертати нульову статистику для порожнього або некоректного масиву', () => {
    expect(getCatalogStats([])).toEqual({
      total: 0,
      completed: 0,
      remaining: 0,
      percent: 0
    });

    expect(getCatalogStats(null)).toEqual({
      total: 0,
      completed: 0,
      remaining: 0,
      percent: 0
    });
  });

  it('повинен безпечно обробляти null у списку completedTopics під час підрахунку статистики', () => {
    const stats = getCatalogStats(topicsData, null);

    expect(stats).toEqual({
      total: 4,
      completed: 0,
      remaining: 4,
      percent: 0
    });
  });

  // CI-перевірка цілісності даних навчальних тем
  it("CI-перевірка цілісності даних: усі теми мають унікальні id та непорожній expectedAnswer", () => {
    const ids = topicsData.map((t) => t.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);

    topicsData.forEach((topic) => {
      expect(typeof topic.expectedAnswer).toBe("string");
      expect(topic.expectedAnswer.trim().length).toBeGreaterThan(0);
    });
  });

});
