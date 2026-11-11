// ===========================================================
// js/apiWidget.js – Модуль DOM-відображення станів та даних зовнішнього API
// ===========================================================

import { loadPythonTipData } from "./api.js";
import { t } from "./i18n.js";

let cachedTips = [];
let currentTipIndex = 0;

/**
 * Переводить інтерфейс віджета у стан очікування (Loading state)
 */
function setWidgetLoadingState() {
  const sourceBadge = document.querySelector("#api-source-badge");
  const errorBanner = document.querySelector("#api-error-banner");
  const nextBtn = document.querySelector("#next-tip-btn");

  if (sourceBadge) {
    sourceBadge.className = "api-badge api-badge--loading";
    sourceBadge.textContent = t("api.loading");
  }
  if (errorBanner) {
    errorBanner.classList.add("hidden");
    errorBanner.replaceChildren();
  }
  if (nextBtn) {
    nextBtn.disabled = true;
  }
}

/**
 * Безпечно відмальовує поточну пораду з масиву cachedTips у DOM через textContent
 */
function renderCurrentTip() {
  if (!Array.isArray(cachedTips) || cachedTips.length === 0) return;

  const tip = cachedTips[currentTipIndex % cachedTips.length];

  const categoryEl = document.querySelector("#api-tip-category");
  const titleEl = document.querySelector("#api-tip-title");
  const textEl = document.querySelector("#api-tip-text");
  const codeEl = document.querySelector("#api-tip-code");

  if (categoryEl) categoryEl.textContent = tip.category;
  if (titleEl) titleEl.textContent = tip.title;
  if (textEl) textEl.textContent = tip.explanation;
  if (codeEl) codeEl.textContent = tip.codeSnippet;
}

/**
 * Завантажує дані з модуля js/api.js та оновлює всі елементи віджета
 * @param {Object} options - Параметри ({ simulateError: boolean })
 */
export async function refreshApiWidget({ simulateError = false } = {}) {
  setWidgetLoadingState();

  const result = await loadPythonTipData({ simulateError });

  cachedTips = result.tips;
  currentTipIndex = 0;

  const sourceBadge = document.querySelector("#api-source-badge");
  const errorBanner = document.querySelector("#api-error-banner");
  const repoStatsEl = document.querySelector("#api-repo-stats");
  const repoLinkEl = document.querySelector("#api-repo-link");
  const nextBtn = document.querySelector("#next-tip-btn");

  // 1. Оновлюємо індикатор джерела даних (Online API або Fallback)
  if (sourceBadge) {
    sourceBadge.className = result.ok
      ? "api-badge api-badge--online"
      : "api-badge api-badge--fallback";
    sourceBadge.textContent = result.sourceLabel;
  }

  // 2. Якщо стався збій API (наприклад, 404 або обрив мережі), показуємо пояснювальний банер
  if (errorBanner) {
    if (!result.ok && result.errorMessage) {
      errorBanner.classList.remove("hidden");
      errorBanner.replaceChildren();

      const strongEl = document.createElement("strong");
      strongEl.textContent = t("api.errorTitle");

      const detailEl = document.createElement("p");
      detailEl.textContent = `Причина: ${result.errorMessage}. Тренажер автоматично перемкнувся на резервний набір порад (Fallback), щоб ви могли продовжити навчання!`;

      errorBanner.append(strongEl, detailEl);
    } else {
      errorBanner.classList.add("hidden");
    }
  }

  // 3. Виводимо першу пораду з отриманого масиву
  renderCurrentTip();

  // 4. Виводимо живу статистику репозиторію Python із GitHub REST API
  if (repoStatsEl && result.repoStats) {
    const { fullName, stars, openIssues, language } = result.repoStats;
    repoStatsEl.textContent = `Репозиторій ${fullName} • ⭐ Зірок: ${stars.toLocaleString("uk-UA")} • Відкритих Issues: ${openIssues.toLocaleString("uk-UA")} • Мова: ${language}`;
  }
  if (repoLinkEl && result.repoStats?.htmlUrl) {
    repoLinkEl.href = result.repoStats.htmlUrl;
  }

  if (nextBtn) {
    nextBtn.disabled = false;
  }
}

/**
 * Підключає слухачі подій до кнопок керування віджетом API
 */
export function initApiWidget() {
  const nextBtn = document.querySelector("#next-tip-btn");
  const simulateErrorBtn = document.querySelector("#simulate-error-btn");

  if (nextBtn) {
    nextBtn.addEventListener("click", async () => {
      // Якщо був увімкнений режим симуляції помилки – перезавантажуємо справжні дані з API
      const badge = document.querySelector("#api-source-badge");
      if (badge && badge.classList.contains("api-badge--fallback")) {
        await refreshApiWidget({ simulateError: false });
        return;
      }

      // Перемикаємо на наступну пораду по колу
      currentTipIndex = (currentTipIndex + 1) % Math.max(cachedTips.length, 1);
      renderCurrentTip();
    });
  }

  if (simulateErrorBtn) {
    simulateErrorBtn.addEventListener("click", () => {
      refreshApiWidget({ simulateError: true });
    });
  }

  // Виконуємо перше асинхронне завантаження одразу при старті сторінки
  refreshApiWidget({ simulateError: false });
}