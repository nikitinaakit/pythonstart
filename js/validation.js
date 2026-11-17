
import { messagesUk } from './messages.uk.js';

/**
 * Очищує рядок від HTML-тегів та небезпечних кутових дужок.
 */
export function sanitizeInput(rawInput) {
  if (typeof rawInput !== 'string') {
    return '';
  }

  return rawInput
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .trim();
}

/**
 * Нормалізує відповідь: прибирає кінцеву крапку з комою
 * та стискає зайві пробіли.
 */
export function normalizeAnswer(input) {
  if (typeof input !== 'string') {
    return '';
  }

  return sanitizeInput(input)
    .replace(/;+\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Діагностує типові помилки учня.
 */
export function diagnoseStudentMistake(userInput, expectedAnswer) {
  const raw = sanitizeInput(userInput);
  const expected = normalizeAnswer(expectedAnswer);

  if (!raw || !expected) return null;

  const lowerRaw = raw.toLowerCase();
  const lowerExpected = expected.toLowerCase();

  if (
    lowerRaw === `print(${lowerExpected})` ||
    lowerRaw === `print("${lowerExpected}")` ||
    lowerRaw === `print('${lowerExpected}')`
  ) {
    return messagesUk.mistakeUsedPrint;
  }

  if (
    lowerRaw === `"${lowerExpected}"` ||
    lowerRaw === `'${lowerExpected}'`
  ) {
    return messagesUk.mistakeExtraQuotes;
  }

  const userNum = Number(raw);
  const expectedNum = Number(expected);

  if (
    !Number.isNaN(userNum) &&
    !Number.isNaN(expectedNum) &&
    Math.abs(userNum - expectedNum) === 1
  ) {
    return messagesUk.mistakeOffByOne;
  }

  return null;
}

/**
 * Перевіряє відповідь учня.
 */
export function validateUserAnswer(userInput, expectedAnswer) {
  const sanitizedValue = sanitizeInput(userInput);
  const cleanUser = normalizeAnswer(sanitizedValue);
  const cleanExpected = normalizeAnswer(expectedAnswer);

  if (cleanUser.length === 0) {
    return {
      isValid: false,
      status: 'empty',
      message: messagesUk.emptyAnswer,
      sanitizedValue
    };
  }

  if (cleanUser.toLowerCase() === cleanExpected.toLowerCase()) {
    return {
      isValid: true,
      status: 'correct',
      message: messagesUk.answerCorrect,
      sanitizedValue
    };
  }

  const diagnosticHint = diagnoseStudentMistake(
    sanitizedValue,
    expectedAnswer
  );

  return {
    isValid: false,
    status: 'incorrect',
    message: diagnosticHint || messagesUk.answerIncorrect,
    sanitizedValue
  };
}
