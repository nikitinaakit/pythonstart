
// js/topics.js – модуль каталогу, пошуку та фільтрації навчальних тем

import { topics } from "../data/topics.js";
import { t } from "./i18n.js";

let currentFilter = "all";
let currentSearchQuery = "";

/**
 * Пошук та фільтрація навчальних тем.
 * Використовується також у модульних тестах Vitest.
 *
 * @param {Array} topicsData - масив навчальних тем
 * @param {Object} options - параметри пошуку та фільтрації
 * @returns {Array} відфільтрований масив тем
 */
export function filterTopicsData(
  topicsData,
  {
    searchQuery = "",
    filter = "all",
    completedTopics = []
  } = {}
) {
  if (!Array.isArray(topicsData)) return [];

  const query = String(searchQuery).trim().toLowerCase();

  return topicsData.filter((topic) => {
    const isCompleted = completedTopics.includes(topic.id);

    const matchesStatus =
      filter === "all" ||
      (filter === "completed" && isCompleted) ||
      (filter === "pending" && !isCompleted);

    const title = String(topic.title ?? "").toLowerCase();
    const description = String(topic.description ?? "").toLowerCase();

    const matchesQuery =
      query === "" ||
      title.includes(query) ||
      description.includes(query);

    return matchesStatus && matchesQuery;
  });
}

/**
 * Повертає масив усіх навчальних тем.
 */
export function getTopicsCatalog() {
  return Array.isArray(topics) ? topics : [];
}

/**
 * Знаходить навчальну тему за її ID.
 *
 * @param {string} topicId - ідентифікатор теми
 * @returns {Object|null} знайдена тема
 */
export function getTopicById(topicId) {
  return topics.find((item) => item.id === topicId) ?? topics[0] ?? null;
}

/**
 * Налаштовує пошук та кнопки фільтрації каталогу.
 *
 * @param {Function} onFilterChange - функція оновлення каталогу
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
 * Відображає картки навчальних тем у каталозі.
 *
 * @param {Object} options - параметри відображення
 */
export function renderTopicsCatalog({
  activeTopicId,
  completedTopics = [],
  onSelectTopic
}) {
  const gridContainer = document.querySelector("#topics-grid");

  if (!gridContainer) return;

  gridContainer.replaceChildren();

  const allTopics = getTopicsCatalog();

  if (allTopics.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = t("catalog.empty");
    gridContainer.appendChild(emptyMessage);
    return;
  }

  const filteredTopics = filterTopicsData(allTopics, {
    searchQuery: currentSearchQuery,
    filter: currentFilter,
    completedTopics
  });

  if (filteredTopics.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = t("catalog.noResults");
    gridContainer.appendChild(emptyMessage);
    return;
  }

  filteredTopics.forEach((topic) => {
    const isCompleted = completedTopics.includes(topic.id);

    const card = document.createElement("article");
    card.className = "topic-card";

    if (topic.id === activeTopicId) {
      card.classList.add("active");
    }

    const title = document.createElement("h3");
    title.textContent = topic.title ?? "";

    const description = document.createElement("p");
    description.textContent = topic.description ?? "";

    const status = document.createElement("span");
    status.className = isCompleted ? "topic-status completed" : "topic-status pending";
    status.textContent = isCompleted
      ? t("catalog.completed")
      : t("catalog.pending");

    card.append(title, description, status);

    card.addEventListener("click", () => {
      if (typeof onSelectTopic === "function") {
        onSelectTopic(topic.id);
      }
    });

    gridContainer.appendChild(card);
  });
}
