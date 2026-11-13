
// ===========================================================
// js/api.js – Модуль асинхронної роботи з REST API та обробки помилок (fetch)
// ===========================================================

// Локальна адреса JSON-файлу з щоденними порадами
const TIPS_API_URL = "./data/daily-tips.json";

// Адреса офіційного GitHub REST API репозиторію Python
const GITHUB_PYTHON_REPO_URL =
  "https://api.github.com/repos/python/cpython";

// Резервні дані на випадок відсутності Інтернету або помилки сервера
const FALLBACK_TIPS = [
  {
    id: "fallback-pep8",
    category: "Автономна порада • Стандарт PEP 8",
    title: "Чому в Python важливі відступи у 4 пробіли?",
    explanation:
      "Навіть без підключення до сервера пам'ятайте: у Python відступи на початку рядка після двокрапки (:) визначають межі блоку коду в умовах if та циклах for.",
    codeSnippet:
      'for step in range(3):\n    print("Крок виконано:", step)'
  },
  {
    id: "fallback-type",
    category: "Автономна порада • Типи даних",
    title: "Як дізнатися тип будь-якої змінної за допомогою type()?",
    explanation:
      "Якщо ви не впевнені, що саме зберігається у змінній – число (int) чи текстовий рядок (str), передайте змінну у вбудовану функцію type().",
    codeSnippet: 'age = "14"\nprint(type(age))  # <class \'str\'>'
  }
];

// Резервна статистика репозиторію Python
const FALLBACK_REPO_STATS = {
  fullName: "python/cpython",
  stars: 65000,
  openIssues: 7200,
  language: "Python / C",
  htmlUrl: "https://github.com/python/cpython"
};

/**
 * Асинхронно завантажує список порад із JSON-ресурсу через Fetch API.
 * @param {string} customUrl - Необов'язковий URL для перевірки помилки 404.
 */
export async function fetchDailyTips(customUrl = TIPS_API_URL) {
  const response = await fetch(customUrl, {
    method: "GET",
    headers: {
      Accept: "application/json"
    }
  });

  // Перевіряємо HTTP-статус, оскільки fetch не відхиляє Promise
  // автоматично при отриманні статусів 404 або 500.
  if (!response.ok) {
    throw new Error(
      `Помилка завантаження порад: HTTP статус ${response.status}`
    );
  }

  const data = await response.json();

  // Перевіряємо наявність коректного масиву порад.
  if (!data || !Array.isArray(data.tips) || data.tips.length === 0) {
    throw new Error(
      "Отриманий JSON не містить коректного масиву порад (tips)."
    );
  }

  return data.tips;
}

/**
 * Асинхронно завантажує статистику офіційного репозиторію Python
 * із відкритого GitHub REST API.
 */
export async function fetchPythonRepoInfo() {
  try {
    const response = await fetch(GITHUB_PYTHON_REPO_URL, {
      method: "GET",
      headers: {
        Accept: "application/vnd.github+json"
      }
    });

    // Перевірка HTTP-статусу відповіді GitHub API.
    if (!response.ok) {
      throw new Error(
        `GitHub API повернув статус ${response.status}`
      );
    }

    const repoData = await response.json();

    return {
      fullName: repoData.full_name || "python/cpython",
      stars:
        Number(repoData.stargazers_count) ||
        FALLBACK_REPO_STATS.stars,
      openIssues:
        Number(repoData.open_issues_count) ||
        FALLBACK_REPO_STATS.openIssues,
      language: repoData.language || "Python",
      htmlUrl: repoData.html_url || FALLBACK_REPO_STATS.htmlUrl,
      isLive: true
    };
  } catch (error) {
    console.warn(
      "Не вдалося отримати дані з GitHub REST API, використано резервні дані:",
      error.message
    );

    return {
      ...FALLBACK_REPO_STATS,
      isLive: false
    };
  }
}

/**
 * Комплексна функція завантаження даних для віджета API
 * з гарантованим поверненням результату (Fallback).
 *
 * @param {Object} options - Налаштування запиту.
 * @param {boolean} options.simulateError - Імітація помилки 404.
 */
export async function loadPythonTipData({ simulateError = false } = {}) {
  // Якщо simulateError = true, звертаємося до неіснуючого файлу.
  const targetUrl = simulateError
    ? "./data/non-existent-404.json"
    : TIPS_API_URL;

  try {
    // Паралельно завантажуємо поради та статистику GitHub API.
    const [tips, repoStats] = await Promise.all([
      fetchDailyTips(targetUrl),
      fetchPythonRepoInfo()
    ]);

    return {
      ok: true,
      sourceLabel: repoStats.isLive
        ? "Онлайн: JSON API + GitHub REST API"
        : "Локальний JSON API (GitHub API офлайн)",
      tips,
      repoStats,
      errorMessage: null
    };
  } catch (error) {
    console.error(
      "Перехоплено помилку API у модулі js/api.js:",
      error
    );

    // Повертаємо резервні дані, якщо основний запит завершився помилкою.
    return {
      ok: false,
      sourceLabel: "Автономний режим (Fallback-дані)",
      tips: FALLBACK_TIPS,
      repoStats: {
        ...FALLBACK_REPO_STATS,
        isLive: false
      },
      errorMessage:
        error.message || "Помилка мережевого з'єднання з API"
    };
  }
}
// Файл: js/app.js – Головна точка входу застосунку PythonStart (оновлено в ЛР № 10)
import { topicsData } from '../data/topics.js';
import { loadProgress, saveProgress, markTopicCompleted, resetProgress } from './storage.js';
import { renderTopicsCatalog, setupCatalogFilters } from './topics.js';
import { renderActiveWorkspace, bindWorkspaceEvents } from './workspace.js';
import { initApiWidget } from './apiWidget.js';
import { t } from './i18n.js';

let currentState = loadProgress();

function updateHeaderProgress() {
  const counterEl = document.getElementById('progress-counter');
  if (!counterEl) return;
  const completedCount = currentState.completedTopics.length;
  const totalCount = topicsData.length;
  const score = currentState.totalScore || 0;
  counterEl.textContent = `${completedCount} / ${totalCount} (${score} балів)`;
}

function handleSelectTopic(topicId) {
  currentState.activeTopicId = topicId;
  saveProgress(currentState);
  refreshUI();
}

function handleTopicSuccess(topicId) {
  currentState = markTopicCompleted(currentState, topicId, 10);
  updateHeaderProgress();
  refreshCatalogOnly();
}

function refreshCatalogOnly() {
  renderTopicsCatalog(
    topicsData,
    currentState.completedTopics,
    currentState.activeTopicId,
    handleSelectTopic
  );
}

function refreshUI() {
  updateHeaderProgress();
  refreshCatalogOnly();
  const activeTopic = topicsData.find((item) => item.id === currentState.activeTopicId) || topicsData[0];
  renderActiveWorkspace(
    activeTopic,
    currentState.completedTopics.includes(activeTopic.id)
  );
}

function bindResetProgressButton() {
  const resetBtn = document.getElementById('reset-progress-btn');
  if (!resetBtn) return;

  resetBtn.addEventListener('click', () => {
    const confirmed = window.confirm(t('confirmResetProgress'));
    if (!confirmed) return;

    currentState = resetProgress();
    refreshUI();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  refreshUI();
  bindWorkspaceEvents(
    () => topicsData.find((item) => item.id === currentState.activeTopicId) || topicsData[0],
    handleTopicSuccess
  );
  setupCatalogFilters(() => {
    refreshCatalogOnly();
  });
  bindResetProgressButton();
  initApiWidget();
});
