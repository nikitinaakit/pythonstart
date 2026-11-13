// Файл: tests/topics.test.js – Модульні тести пошуку та фільтрації тем (ЛР № 11)
import { describe, it, expect } from 'vitest';
import { filterTopicsData } from '../js/topics.js';
import { topicsData } from '../data/topics.js';

describe('Модуль js/topics.js – Пошук та фільтрація навчальних тем у каталозі', () => {
  it('повинен знаходити тему за збігом ключового слова у назві', () => {
    const result = filterTopicsData(topicsData, { searchQuery: 'списки' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('lists');
  });

  it('повинен виконувати пошук без урахування регістру літер та зайвих пробілів (Edge Case)', () => {
    const result = filterTopicsData(topicsData, { searchQuery: '   ЦИКЛИ   ' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('loops');
  });

  it('повинен знаходити тему, якщо пошукове слово зустрічається лише в описі (description)', () => {
    const result = filterTopicsData(topicsData, { searchQuery: 'колекції' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('lists');
  });

  it('повинен повертати всі 4 теми при порожньому запиті або рядку з пробілів (Edge Case)', () => {
    const emptyRes = filterTopicsData(topicsData, { searchQuery: '' });
    const spacesRes = filterTopicsData(topicsData, { searchQuery: '    ' });
    expect(emptyRes).toHaveLength(4);
    expect(spacesRes).toHaveLength(4);
  });

  it('повинен повертати порожній масив, якщо збігів немає, і не змінювати вхідний масив', () => {
    const snapshot = [...topicsData];
    const result = filterTopicsData(topicsData, { searchQuery: 'нейромережа' });
    expect(result).toEqual([]);
    expect(topicsData).toEqual(snapshot);
  });

  it('повинен коректно фільтрувати опрацьовані (completed) та неопрацьовані (pending) теми', () => {
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
});
