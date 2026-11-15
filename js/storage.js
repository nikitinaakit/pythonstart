
// ===========================================================
// js/storage.js – Модуль роботи з localStorage
// ===========================================================

export const STORAGE_KEY = "pythonstart_progress_v1";

const DEFAULT_STATE = {
  completedTopics: [],
  activeTopicId: "variables",
  totalScore: 0
};

function getDefaultProgress() {
  return { ...DEFAULT_STATE, completedTopics: [] };
}

// Завантаження прогресу
export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return getDefaultProgress();

    const parsed = JSON.parse(raw);

    if (!parsed || !Array.isArray(parsed.completedTopics)) {
      return getDefaultProgress();
    }

    return {
      completedTopics: parsed.completedTopics,
      activeTopicId: parsed.activeTopicId || "variables",
      totalScore: Number(parsed.totalScore) || 0
    };
  } catch (error) {
    console.warn("Помилка читання localStorage:", error);
    return getDefaultProgress();
  }
}

// Збереження прогресу
export function saveProgress(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Помилка запису localStorage:", error);
  }
}

// Позначення теми як завершеної (для app.js)
export function markTopicAsCompleted(topicId) {
  const current = loadProgress();

  if (!current.completedTopics.includes(topicId)) {
    current.completedTopics.push(topicId);
    current.totalScore = current.completedTopics.length * 10;
    saveProgress(current);
  }

  return current;
}

// Збереження активної теми (для app.js)
export function saveActiveTopicId(topicId) {
  const current = loadProgress();
  current.activeTopicId = topicId;
  saveProgress(current);
  return current;
}

// Позначення теми як завершеної (для api.js)
export function markTopicCompleted(currentState, topicId, points = 10) {
  const completed = Array.isArray(currentState.completedTopics)
    ? [...currentState.completedTopics]
    : [];

  let score = Number(currentState.totalScore) || 0;

  if (!completed.includes(topicId)) {
    completed.push(topicId);
    score += points;
  }

  const updatedState = {
    ...currentState,
    completedTopics: completed,
    totalScore: score
  };

  saveProgress(updatedState);
  return updatedState;
}

// Скидання прогресу
export function resetProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Не вдалося очистити localStorage:", error);
  }

  return getDefaultProgress();
}
