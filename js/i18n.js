
// js/i18n.js – Модуль локалізації для отримання текстових повідомлень за ключем

import { messages } from "./messages.uk.js";

// Експорт словника для модульного тестування
export const messagesUk = messages;

/**
 * Повертає переклад за ключем.
 * Якщо переклад відсутній, повертає сам ключ.
 */
export function t(key) {
  return messagesUk[key] ?? key;
}
