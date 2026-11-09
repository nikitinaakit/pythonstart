
// js/i18n.js – Модуль локалізації для отримання текстових повідомлень за ключем

import { messages } from "./messages.uk.js";

export function t(key) {
    // Повертає ключ, якщо переклад не знайдено у словнику
    return messages[key] ?? key;
}
