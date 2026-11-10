

// ===========================================================
// js/app.js – Головний модуль ініціалізації та координації тренажера PythonStart
// ===========================================================
import { initApiWidget } from "./apiWidget.js";

import { getTopicsCatalog, getTopicById, renderTopicsCatalog } from "./topics.js";
import { validateExerciseAnswer } from "./validation.js";
import { t } from "./i18n.js";
import {
  loadProgress,
  markTopicAsCompleted,
  saveActiveTopicId,
  resetProgress
} from "./storage.js";
import { renderLessonWorkspace, bindWorkspaceEvents } from "./workspace.js";

// Поточний стан застосунку на стороні клієнта
let appState = loadProgress();

/**
 * Оновлює лічильник виконаних тем у верхній шапці сайту (#progress-counter)
 */
function updateHeaderProgress() {
  const counterEl = document.querySelector("#progress-counter");
  const totalTopics = getTopicsCatalog().length;
  const doneCount = appState.completedTopics.length;

  if (counterEl) {
    counterEl.textContent = `${doneCount} / ${totalTopics} (${appState.totalScore} балів)`;
  }
}

/**
 * Динамічно відображає блок зворотного зв'язку (успіх, помилка або підказка)
 * @param {string} type - Тип повідомлення: "success" | "error" | "hint"
 * @param {string} titleText - Заголовок повідомлення
 * @param {string} bodyText - Пояснювальний текст
 */
function renderFeedback(type, titleText, bodyText) {
  const container = document.querySelector("#feedback-container");
  if (!container) return;

  // Очищуємо попередні демонстраційні або старі повідомлення
  container.replaceChildren();

  const box = document.createElement("div");
  box.className = type === "success" ? "feedback-box feedback-success" : "feedback-box feedback-error";
  box.setAttribute("role", type === "error" ? "alert" : "status");

  // Якщо це дружня підказка, стилізуємо спокійним синім акцентом
  if (type === "hint") {
    box.style.backgroundColor = "#EFF6FF";
    box.style.borderColor = "#93C5FD";
    box.style.color = "#1E3A8A";
  }

  const strongEl = document.createElement("strong");
  strongEl.textContent = titleText;

  const textEl = document.createElement("p");
  textEl.textContent = bodyText;

  box.append(strongEl, textEl);
  container.append(box);
}

/**
 * Очищує блок повідомлень при переході на нову тему
 */
function clearFeedback() {
  const container = document.querySelector("#feedback-container");
  if (container) {
    container.replaceChildren();
  }
}

/**
 * Перемикає поточну навчальну тему
 */
function handleSelectTopic(topicId) {
  appState = saveActiveTopicId(topicId);
  const currentTopic = getTopicById(appState.activeTopicId);

  renderTopicsCatalog({
    activeTopicId: appState.activeTopicId,
    completedTopics: appState.completedTopics,
    onSelectTopic: handleSelectTopic
  });

  renderLessonWorkspace(currentTopic);
  clearFeedback();
}

/**
 * Обробляє перевірку відповіді учня після відправлення форми
 */
function handleCheckAnswer(userInput) {
  const currentTopic = getTopicById(appState.activeTopicId);
  if (!currentTopic) return;

  const result = validateExerciseAnswer(userInput, currentTopic.correctAnswer);

  if (result.status === "empty") {
    renderFeedback(
      "error",
      t("exercise.emptyWarning"),
      "Введіть команду або відповідь у текстове поле вище та натисніть «Перевірити відповідь»."
    );
    return;
  }

  if (result.isCorrect) {
    // Зберігаємо успішне виконання теми у localStorage
    appState = markTopicAsCompleted(currentTopic.id);
    updateHeaderProgress();

    // Оновлюємо бейджі статусів у каталозі тем
    renderTopicsCatalog({
      activeTopicId: appState.activeTopicId,
      completedTopics: appState.completedTopics,
      onSelectTopic: handleSelectTopic
    });

    renderFeedback(
      "success",
      t("exercise.correct"),
      `Чудово! Правильна відповідь для теми «${currentTopic.title}»: ${currentTopic.correctAnswer}.`
    );
  } else {
    renderFeedback(
      "error",
      t("exercise.incorrect"),
      `Ви ввели «${userInput.trim()}». Зверніть увагу на приклад коду ліворуч або натисніть «Показати підказку».`
    );
  }
}

/**
 * Показує текстову підказку до поточного завдання
 */
function handleShowHint() {
  const currentTopic = getTopicById(appState.activeTopicId);
  if (!currentTopic) return;

  renderFeedback(
    "hint",
    t("exercise.hintPrefix"),
    currentTopic.hint || "Уважно перечитайте теоретичну довідку ліворуч."
  );
}

/**
 * Додає можливість скинути прогрес подвійним кліком по індикатору прогресу в шапці
 */
function bindResetShortcut() {
  const progressPill = document.querySelector(".progress-pill");
  if (!progressPill) return;

  progressPill.title = "Подвійний клік – скинути збережений прогрес у localStorage";
  progressPill.style.cursor = "pointer";

  progressPill.addEventListener("dblclick", () => {
    appState = resetProgress();
    updateHeaderProgress();
    handleSelectTopic(appState.activeTopicId);
    renderFeedback(
      "hint",
      "🔄 Прогрес навчання скинуто",
      "Дані у клієнтському сховищі localStorage очищено. Ви можете пройти всі теми спочатку!"
    );
  });
}

/**
 * Головна функція запуску застосунку після завантаження DOM
 */
export function initApp() {
  appState = loadProgress();
  const initialTopic = getTopicById(appState.activeTopicId);

  updateHeaderProgress();

  renderTopicsCatalog({
    activeTopicId: appState.activeTopicId,
    completedTopics: appState.completedTopics,
    onSelectTopic: handleSelectTopic
  });

  renderLessonWorkspace(initialTopic);
  clearFeedback();

  bindWorkspaceEvents({
    onSubmitAnswer: handleCheckAnswer,
    onShowHint: handleShowHint
  });
initApiWidget();
  bindResetShortcut();
  console.log("Навчальний тренажер PythonStart успішно ініціалізовано. Поточний прогрес:", appState);
}

// Запускаємо ініціалізацію, коли HTML-документ повністю розібраний браузером
document.addEventListener("DOMContentLoaded", initApp);
