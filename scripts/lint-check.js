/**
 * scripts/lint-check.js
 * Скрипт статичного аналізу (лінтингу) структури, безпеки та чистоти коду
 * для навчального тренажера «PythonStart» (Лабораторна робота № 13)
 */
import fs from "node:fs";
import path from "node:path";

const REQUIRED_FILES = [
  "index.html",
  "package.json",
  "README.md",
  "data/topics.js",
  "js/messages.uk.js",
  "js/validation.js",
  "js/topics.js",
  "js/storage.js",
  "docs/architecture.md",
  "docs/code-review-and-qa.md"
  "js/non-existent-file.js"
];

const JS_DIRS_TO_SCAN = ["data", "js", "tests"];
let hasErrors = false;

console.log("=== [PythonStart Linter] Початок статичної перевірки проєкту ===");

// 1. Перевірка наявності обов'язкових файлів архітектури
for (const relPath of REQUIRED_FILES) {
  const fullPath = path.resolve(process.cwd(), relPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`[ПОМИЛКА СТРУКТУРИ] Відсутній обов'язковий файл: ${relPath}`);
    hasErrors = true;
  } else {
    const content = fs.readFileSync(fullPath, "utf-8").trim();
    if (content.length === 0) {
      console.error(`[ПОМИЛКА ВМІСТУ] Файл порожній: ${relPath}`);
      hasErrors = true;
    }
  }
}

// 2. Перевірка JS-файлів на відсутність маркерів конфлікту Git та небезпечного eval()
for (const dir of JS_DIRS_TO_SCAN) {
  const dirPath = path.resolve(process.cwd(), dir);
  if (!fs.existsSync(dirPath)) continue;

  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".js"));
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const relativeName = `${dir}/${file}`;
    const source = fs.readFileSync(filePath, "utf-8");

    if (source.includes("<<<<<<<") || source.includes(">>>>>>>")) {
      console.error(`[ПОМИЛКА GIT] Знайдено нерозв'язані маркери конфлікту злиття у файлі: ${relativeName}`);
      hasErrors = true;
    }

    if (/\beval\s*\(/.test(source)) {
      console.error(`[ПОМИЛКА БЕЗПЕКИ] Використання небезпечної функції eval() заборонено у файлі: ${relativeName}`);
      hasErrors = true;
    }
  }
}

if (hasErrors) {
  console.error("=== [PythonStart Linter] Перевірку ПРОВАЛЕНО (FAIL)! Виправте помилки вище. ===");
  process.exit(1);
} else {
  console.log("=== [PythonStart Linter] Усі перевірки структури та безпеки пройдено успішно (PASS)! ===");
  process.exit(0);
}
