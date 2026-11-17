
// ===========================================================
// js/storage.js – Модуль роботи з localStorage
// ===========================================================

export const STORAGE_KEY = "pythonstart_progress_v1";

export const POINTS_PER_TOPIC = 10;

const DEFAULT_STATE = {
  completedTopics: [],
  activeTopicId: "variables",
  totalScore: 0
};

function getDefaultProgress() {
  return { ...DEFAULT_STATE, completedTopics: [] };
}
// Очищення списку завершених тем
function sanitizeTopicsList(rawList) {
  if (!Array.isArray(rawList)) return [];

  const cleaned = rawList
    .filter((id) => typeof id === "string" && id.trim().length > 0)
    .map((id) => id.trim());

  return [...new Set(cleaned)];
}
// Завантаження прогресу
export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return getDefaultProgress();

    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object") {
      return getDefaultProgress();
    }

    const validCompleted = sanitizeTopicsList(parsed.completedTopics);

    return {
      completedTopics: validCompleted,
      activeTopicId:
        typeof parsed.activeTopicId === "string" && parsed.activeTopicId.trim().length > 0
          ? parsed.activeTopicId.trim()
          : "variables",
      totalScore: validCompleted.length * POINTS_PER_TOPIC
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

  if (typeof topicId !== "string" || topicId.trim().length === 0) {
    return current;
  }

  const cleanId = topicId.trim();

  if (!current.completedTopics.includes(cleanId)) {
    current.completedTopics.push(cleanId);
    current.totalScore = current.completedTopics.length * POINTS_PER_TOPIC;
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
export function markTopicCompleted(currentState, topicId, points = POINTS_PER_TOPIC) {
  const safeState =
    currentState && typeof currentState === "object"
      ? currentState
      : DEFAULT_STATE;

  const completed = sanitizeTopicsList(safeState.completedTopics);

  if (typeof topicId !== "string" || topicId.trim().length === 0) {
    return {
      ...safeState,
      completedTopics: completed,
      totalScore: completed.length * points
    };
  }

  const cleanId = topicId.trim();

  if (!completed.includes(cleanId)) {
    completed.push(cleanId);
  }

  const updatedState = {
    ...safeState,
    completedTopics: completed,
    totalScore: completed.length * points
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
