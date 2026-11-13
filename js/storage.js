// ===========================================================
// js/storage.js – Модуль роботи з клієнтським сховищем браузера localStorage
// ===========================================================

const STORAGE_KEY = "pythonstart_progress_v1";

// Допоміжна функція початкового стану прогресу учня
function getDefaultProgress() {
  return {
    completedTopics: [], // Масив ID успішно пройдених тем (наприклад: ["variables"])
    activeTopicId: "variables", // Поточна вибрана тема
    totalScore: 0 // Кількість зароблених балів
  };
}

/**
 * Безпечно зчитує збережений прогрес учня з localStorage
 */
export function loadProgress() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) {
      return getDefaultProgress();
    }

    const parsed = JSON.parse(rawData);

    // Перевіряємо, чи має об'єкт очікувану структуру масиву
    if (!parsed || !Array.isArray(parsed.completedTopics)) {
      return getDefaultProgress();
    }

    return {
      completedTopics: parsed.completedTopics,
      activeTopicId: parsed.activeTopicId || "variables",
      totalScore: Number(parsed.totalScore) || 0
    };
  } catch (error) {
    console.error("Помилка читання localStorage, застосовано початковий стан:", error);
    return getDefaultProgress();
  }
}

/**
 * Зберігає поточний об'єкт прогресу у localStorage у форматі JSON
 */
export function saveProgress(progressState) {
  try {
    const serialized = JSON.stringify(progressState);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error("Не вдалося зберегти прогрес у localStorage:", error);
  }
}

/**
 * Позначає тему як успішно виконану та оновлює бали у сховищі
 */
export function markTopicAsCompleted(topicId) {
  const current = loadProgress();

  if (!current.completedTopics.includes(topicId)) {
    current.completedTopics.push(topicId);
    current.totalScore = current.completedTopics.length * 10;
    saveProgress(current);
  }

  return current;
}

/**
 * Зберігає ID теми, яку учень зараз відкрив для вивчення
 */
export function saveActiveTopicId(topicId) {
  const current = loadProgress();
  current.activeTopicId = topicId;
  saveProgress(current);
  return current;
}

/**
 * Безпечно очищує лише ключ прогресу тренажера PythonStart у localStorage
 */
export function resetProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Не вдалося очистити сховище localStorage:', error);
  }
  return {
    completedTopics: [],
    activeTopicId: 'variables',
    totalScore: 0
  };
}
