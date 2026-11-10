// js/validation.js – Модуль перевірки відповідей учня в інтерактивних вправах
export function validateExerciseAnswer(userInput, expectedAnswer) {
  // Очищуємо введення учня від випадкових пробілів на початку та в кінці (.trim())
  const cleanedInput = String(userInput ?? "").trim();
  const cleanedExpected = String(expectedAnswer ?? "").trim();

  // Захист від порожнього поля (AC-5 із вимог ЛР №4)
  if (cleanedInput.length === 0) {
    return {
      status: "empty",
      isCorrect: false,
      messageKey: "exercise.emptyWarning"
    };
  }

  // Порівняння нормалізованих відповідей (ігноруючи зайві пробіли навколо знака '=')
  const normalizeCode = (str) => str.replace(/\s+/g, "").toLowerCase();
  const isMatch = normalizeCode(cleanedInput) === normalizeCode(cleanedExpected);

  return {
    status: isMatch ? "success" : "error",
    isCorrect: isMatch,
    messageKey: isMatch ? "exercise.correct" : "exercise.incorrect"
  };
}
