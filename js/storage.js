
// ===========================================================
// js/storage.js – Модуль роботи з клієнтським сховищем
// ===========================================================

export const STORAGE_KEY = "pythonstart_progress_v1";

const DEFAULT_STATE = {
  completedTopics: [],
  activeTopicId: "variables",
  totalScore: 0
};

// Повертає початковий стан прогресу
function getDefaultProgress() {
  return {
    ...DEFAULT_STATE,
    completedTopics: []
  };
}

// Завантажує прогрес із localStorage
export function loadProgress() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);

    if (!rawData) {
      return getDefaultProgress();
    }

    const parsed = JSON.parse(rawData);

    if (!parsed || typeof parsed !== "object") {
      return getDefaultProgress();
    }

    return {
      completedTopics: Array.isArray(parsed.completedTopics)
        ? parsed.completedTopics
        : [],
      activeTopicId:
        typeof parsed.activeTopicId === "string"
          ? parsed.activeTopicId
          : "variables",
      totalScore:
        typeof parsed.totalScore === "number"
          ? parsed.totalScore
          : 0
    };
  } catch (error) {
    console.error("Помилка читання localStorage:", error);
    return getDefaultProgress();
  }
}

// Зберігає прогрес
export function saveProgress(progressState) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(progressState)
    );
  } catch (error) {
    console.warn("Не вдалося зберегти прогрес:", error);
  }
}

// Позначає тему як виконану
export function markTopicAsCompleted(topicId) {
  const current = loadProgress();

  if (!current.completedTopics.includes(topicId)) {
    current.completedTopics.push(topicId);
    current.totalScore = current.completedTopics.length * 10;
    saveProgress(current);
  }

  return current;
}

// Альтернативний варіант функції для сумісності з app.js
export function markTopicCompleted(currentState, topicId, points = 10) {
  const completed = Array.isArray(currentState.completedTopics)
    ? [...currentState.completedTopics]
    : [];

  let score = typeof currentState.totalScore === "number"
    ? currentState.totalScore
    : 0;

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

// Зберігає активну тему
export function saveActiveTopicId(topicId) {
  const current = loadProgress();
  current.activeTopicId = topicId;
  saveProgress(current);
  return current;
}

// Очищає тільки прогрес PythonStart
export function resetProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Не вдалося очистити localStorage:", error);
  }

  return getDefaultProgress();
}
