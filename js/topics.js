// ===========================================================
// js/topics.js – Модуль управління каталогом тем та генерації карток у DOM
// ===========================================================

import { topics } from "../data/topics.js";

/**
 * Повертає всі доступні навчальні теми
 */
export function getTopicsCatalog() {
  return Array.isArray(topics) ? topics : [];
}

/**
 * Знаходить тему за її унікальним ідентифікатором (id)
 */
export function getTopicById(topicId) {
  return topics.find((item) => item.id === topicId) ?? topics[0] ?? null;
}

/**
 * Динамічно створює картки навчальних тем у контейнері #topics-grid
 * @param {Object} options - Параметри відображення
 * @param {string} options.activeTopicId - ID поточної відкритої теми
 * @param {string[]} options.completedTopics - Масив ID пройдених тем із localStorage
 * @param {Function} options.onSelectTopic - Функція, яка викликається при кліку на тему
 */
export function renderTopicsCatalog({ activeTopicId, completedTopics = [], onSelectTopic }) {
  const gridContainer = document.querySelector("#topics-grid");
  if (!gridContainer) return;

  // Очищуємо статичну розмітку перед малюванням актуальних карток
  gridContainer.replaceChildren();

  const allTopics = getTopicsCatalog();

  if (allTopics.length === 0) {
    const emptyMsg = document.createElement("p");
    emptyMsg.textContent = "Навчальні теми тимчасово відсутні.";
    gridContainer.append(emptyMsg);
    return;
  }

  allTopics.forEach((topic) => {
    const isCompleted = completedTopics.includes(topic.id);
    const isActive = topic.id === activeTopicId;

    // 1. Створюємо кореневий семантичний тег картки <article>
    const card = document.createElement("article");
    card.className = "topic-card";
    if (isActive) {
      card.classList.add("topic-card--active");
    }

    // 2. Верхній рядок картки (номер теми + бейдж статусу)
    const topBar = document.createElement("div");
    topBar.className = "topic-card-top";

    const stepSpan = document.createElement("span");
    stepSpan.className = "topic-step";
    stepSpan.textContent = topic.stepLabel || "Тема";

    const statusBadge = document.createElement("span");
    statusBadge.className = "topic-status";
    if (isCompleted) {
      statusBadge.classList.add("status-done");
      statusBadge.textContent = "✓ Опрацьовано";
    } else if (isActive) {
      statusBadge.classList.add("status-current");
      statusBadge.textContent = "У процесі";
    } else {
      statusBadge.classList.add("status-pending");
      statusBadge.textContent = "Попереду";
    }

    topBar.append(stepSpan, statusBadge);

    // 3. Заголовок та короткий опис теми (безпечно через textContent!)
    const titleEl = document.createElement("h3");
    titleEl.className = "topic-title";
    titleEl.textContent = topic.title;

    const summaryEl = document.createElement("p");
    summaryEl.className = "topic-summary";
    summaryEl.textContent = topic.description;

    // 4. Інтерактивна кнопка вибору уроку
    const actionBtn = document.createElement("button");
    actionBtn.type = "button";
    actionBtn.className = isActive ? "btn btn-primary topic-btn" : "btn btn-outline topic-btn";
    actionBtn.textContent = isCompleted
      ? "Повторити урок →"
      : isActive
      ? "Поточний урок (відкрито)"
      : "Розпочати тренування →";

    // Підключаємо слухач події кліку для перемикання теми
    actionBtn.addEventListener("click", () => {
      if (typeof onSelectTopic === "function") {
        onSelectTopic(topic.id);
      }
      // Плавно прокручуємо екран до робочої зони вправи
      const workspaceSection = document.querySelector("#workspace");
      workspaceSection?.scrollIntoView({ behavior: "smooth" });
    });

    card.append(topBar, titleEl, summaryEl, actionBtn);
    gridContainer.append(card);
  });
}
