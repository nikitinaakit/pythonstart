
import { t } from "./i18n.js";

// Нормалізація відповіді
export function normalizeAnswer(value) {
  return String(value ?? "").trim();
}

// Діагностика типових помилок учня
export function diagnoseStudentMistake(rawUserInput, rawCorrectAnswer) {
  const userStr = normalizeAnswer(rawUserInput);
  const expectedStr = normalizeAnswer(rawCorrectAnswer);

  if (!userStr || !expectedStr) {
    return "exercise.incorrect";
  }

  // Учень ввів print(...) замість результату
  if (
    /^print\s*\(.*\)$/i.test(userStr) &&
    !/^print\s*\(/i.test(expectedStr)
  ) {
    return "mistakeUsedPrint";
  }

  // Зайві лапки навколо відповіді
  const withoutQuotes = userStr.replace(/^['"]|['"]$/g, "");

  if (
    withoutQuotes.toLowerCase() === expectedStr.toLowerCase() &&
    withoutQuotes !== userStr
  ) {
    return "mistakeExtraQuotes";
  }

  // Числова різниця на одиницю
  const userNum = Number(userStr);
  const expectedNum = Number(expectedStr);

  if (
    userStr !== "" &&
    expectedStr !== "" &&
    !Number.isNaN(userNum) &&
    !Number.isNaN(expectedNum) &&
    Math.abs(userNum - expectedNum) === 1
  ) {
    return "mistakeOffByOne";
  }

  // Відмінність рівно в одному символі
  if (userStr.length === expectedStr.length) {
    let differences = 0;

    for (let i = 0; i < userStr.length; i++) {
      if (userStr[i] !== expectedStr[i]) {
        differences++;
      }
    }

    if (differences === 1) {
      return "mistakeOffByOne";
    }
  }

  return "exercise.incorrect";
}

// Основна функція перевірки відповіді
export function validateExerciseAnswer(rawUserInput, rawCorrectAnswer) {
  const userClean = normalizeAnswer(rawUserInput);
  const correctClean = normalizeAnswer(rawCorrectAnswer);

  if (!userClean) {
    return {
      status: "empty",
      isCorrect: false,
      messageKey: "exercise.emptyWarning"
    };
  }

  const normalizeCode = (str) =>
    str.replace(/\s+/g, "").toLowerCase();

  const isMatch =
    normalizeCode(userClean) === normalizeCode(correctClean);

  if (isMatch) {
    return {
      status: "success",
      isCorrect: true,
      messageKey: "exercise.correct"
    };
  }

  return {
    status: "error",
    isCorrect: false,
    messageKey: diagnoseStudentMistake(userClean, correctClean)
  };
}
