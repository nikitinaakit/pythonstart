// Файл: tests/storage.test.js – Модульні тести клієнтського сховища (ЛР № 11)
import { describe, it, expect, beforeEach } from 'vitest';
import {
  STORAGE_KEY,
  loadProgress,
  markTopicCompleted,
  resetProgress
} from '../js/storage.js';

function createLocalStorageMock() {
  let store = {};
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    },
    setItem(key, value) {
      store[key] = String(value);
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      store = {};
    }
  };
}

describe('Модуль js/storage.js – Керування навчальним прогресом у localStorage', () => {
  beforeEach(() => {
    globalThis.localStorage = createLocalStorageMock();
  });

  it('повинен повертати безпечний початковий стан (0 балів), коли сховище порожнє', () => {
    const state = loadProgress();
    expect(state).toEqual({
      completedTopics: [],
      activeTopicId: 'variables',
      totalScore: 0
    });
  });

  it('повинен додавати тему до виконаних і нараховувати +10 балів при першому проходженні', () => {
    const initial = loadProgress();
    const updated = markTopicCompleted(initial, 'variables', 10);

    expect(updated.completedTopics).toContain('variables');
    expect(updated.totalScore).toBe(10);
    expect(loadProgress().totalScore).toBe(10);
  });

  it('не повинен двічі нараховувати бали за одну й ту саму тему при повторному проходженні (Edge Case)', () => {
    let state = loadProgress();
    state = markTopicCompleted(state, 'variables', 10);
    state = markTopicCompleted(state, 'variables', 10);

    expect(state.completedTopics).toHaveLength(1);
    expect(state.totalScore).toBe(10);
  });

  it('повинен скидати прогрес і бали до нуля через resetProgress()', () => {
    let state = loadProgress();
    state = markTopicCompleted(state, 'loops', 10);
    const resetState = resetProgress();

    expect(resetState.completedTopics).toEqual([]);
    expect(resetState.totalScore).toBe(0);
    expect(globalThis.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('не повинен падати і має повертати початковий стан, якщо у сховищі пошкоджений JSON (Edge Case)', () => {
    globalThis.localStorage.setItem(STORAGE_KEY, '{невалідний_json_рядок!!!');
    const recovered = loadProgress();

    expect(recovered.completedTopics).toEqual([]);
    expect(recovered.totalScore).toBe(0);
  });
});

