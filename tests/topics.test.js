
// Файл: tests/topics.test.js – Модульні тести пошуку та фільтрації тем (ЛР № 11)

import { describe, it, expect } from 'vitest';
import { filterTopicsData } from '../js/topics.js';
import { topicsData } from '../data/topics.js';

describe('Модуль js/topics.js – Пошук та фільтрація навчальних тем у каталозі', () => {
  it('повинен знаходити тему за ключовим словом у назві', () => {
    const result = filterTopicsData(topicsData, {
      searchQuery: 'змінні'
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('variables');
  });

  it('повинен виконувати пошук без урахування регістру та зайвих пробілів', () => {
    const result = filterTopicsData(topicsData, {
      searchQuery: '   ЦИКЛИ   '
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('loops');
  });

  it('повинен знаходити тему за ключовим словом в описі', () => {
    const result = filterTopicsData(topicsData, {
      searchQuery: 'обчислень'
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('loops');
  });

  it('повинен повертати всі 3 теми при порожньому запиті або рядку з пробілів', () => {
    const emptyRes = filterTopicsData(topicsData, {
      searchQuery: ''
    });

    const spacesRes = filterTopicsData(topicsData, {
      searchQuery: '    '
    });

    expect(emptyRes).toHaveLength(3);
    expect(spacesRes).toHaveLength(3);
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
    expect(pendingList).toHaveLength(1);
    expect(pendingList.map((topic) => topic.id)).toEqual(['loops']);
  });
});
