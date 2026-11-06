// js/app.js – Головний модуль ініціалізації застосунку PythonStart
export const APP_CONFIG = {
  appName: "PythonStart",
  version: "1.0.0-mvp",
  defaultLocale: "uk"
};

export function initApp() {
  console.log(`Навчальний тренажер ${APP_CONFIG.appName} (${APP_CONFIG.version}) успішно ініціалізовано.`);
}
