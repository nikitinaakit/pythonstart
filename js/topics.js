
// ===========================================================
// js/topics.js – Модуль управління каталогом тем,
// пошуку та фільтрації із захистом від XSS
// ===========================================================

import { topics } from "../data/topics.js";
import { t } from "./i18n.js";

// Чиста функція пошуку та фільтрації навчальних тем
export function filterTopicsData(
  topics,
  { filter = "all", searchQuery = "", completedTopics = [] } = {}
) {
  if (!Array.isArray(topics)) {
    return [];
  }

  const cleanQuery =
    typeof searchQuery === "string"
      ? searchQuery.trim().toLowerCase()
      : "";

  return topics.filter((topic) => {
    const isCompleted = completedTopics.includes(topic.id);

    const matchesStatus =
      filter === "all" ||
      (filter === "completed" && isCompleted) ||
      (filter === "pending" && !isCompleted);

    const titleText = String(topic.title ?? "").toLowerCase();
    const descText = String(topic.description ?? "").toLowerCase();

    const matchesQuery =
      cleanQuery === "" ||
      titleText.includes(cleanQuery) ||
      descText.includes(cleanQuery);

    return matchesStatus && matchesQuery;
  });
}

let currentFilter = "all";
let currentSearchQuery = "";

/**
 * Повертає всі доступні навчальні теми
 */
export function getTopicsCatalog() {
  return Array.isArray(topics) ? topics : [];
}

/**
 * Знаходить тему за її унікальним ідентифікатором
 */
export function getTopicById(topicId) {
  return topics.find((item) => item.id === topicId) ?? topics[0] ?? null;
}

/**
 * Налаштування пошуку та кнопок фільтрації
 */
export function setupCatalogFilters(onFilterChange) {
  const searchInput = document.getElementById("topic-search-input");
  const filterButtons = document.querySelectorAll(".filter-btn");

  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      currentSearchQuery = event.target.value.trim().toLowerCase();

      if (typeof onFilterChange === "function") {
        onFilterChange();
      }
    });
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentFilter = btn.dataset.filter || "all";

      filterButtons.forEach((button) => {
        const isActive = button === btn;

        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });

      if (typeof onFilterChange === "function") {
        onFilterChange();
      }
    });
  });
}

/**
 * Безпечне відображення карток із пошуком та фільтрацією
 */
export function renderTopicsCatalog({
  activeTopicId,
  completedTopics = [],
  onSelectTopic
}) {
  const gridContainer = document.querySelector("#topics-grid");

  if (!gridContainer) return;

  // Безпечне очищення контейнера
  gridContainer.replaceChildren();

  const allTopics = getTopicsCatalog();

  if (allTopics.length === 0) {
    const emptyMsg = document.createElement("p");
    emptyMsg.className = "empty-catalog-msg";
    emptyMsg.textContent = "Навчальні теми тимчасово відсутні.";
    gridContainer.append(emptyMsg);
    return;
  }

  // Використання чистої функції фільтрації
  const filteredTopics = filterTopicsData(allTopics, {
    filter: currentFilter,
    searchQuery: currentSearchQuery,
    completedTopics
  });

  // Повідомлення, якщо нічого не знайдено
  if (filteredTopics.length === 0) {
    const noMatchMsg = document.createElement("p");
    noMatchMsg.className = "empty-catalog-msg";

    // textContent захищає від XSS-ін'єкцій
    noMatchMsg.textContent = currentSearchQuery
      ? `Нічого не знайдено для: «${currentSearchQuery}»`
      : "За вибраним фільтром тем не знайдено.";

    gridContainer.append(noMatchMsg);
    return;
  }

  // Створення карток знайдених тем
  filteredTopics.forEach((topic) => {
    const isCompleted = completedTopics.includes(topic.id);
    const isActive = topic.id === activeTopicId;

    const card = document.createElement("article");
    card.className = "topic-card";

    if (isActive) {
      card.classList.add("topic-card--active");
    }

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

    const titleEl = document.createElement("h3");
    titleEl.className = "topic-title";
    titleEl.textContent = topic.title;

    const summaryEl = document.createElement("p");
    summaryEl.className = "topic-summary";
    summaryEl.textContent = topic.description;

    const actionBtn = document.createElement("button");
    actionBtn.type = "button";
    actionBtn.className = isActive
      ? "btn btn-primary topic-btn"
      : "btn btn-outline topic-btn";

    actionBtn.textContent = isCompleted
      ? "Повторити урок →"
      : isActive
      ? "Поточний урок (відкрито)"
      : "Розпочати тренування →";

    actionBtn.addEventListener("click", () => {
      if (typeof onSelectTopic === "function") {
        onSelectTopic(topic.id);
      }

      const workspaceSection = document.querySelector("#workspace");
      workspaceSection?.scrollIntoView({ behavior: "smooth" });
    });

    card.append(topBar, titleEl, summaryEl, actionBtn);
    gridContainer.append(card);
  });
}
