// ===========================================================
// js/workspace.js – Модуль оновлення робочої зони уроку та обробки подій форми
// ===========================================================

/**
 * Заповнює ліву (теорія) та праву (вправа) панелі даними вибраної теми
 * @param {Object} topic - Об'єкт вибраної навчальної теми з data/topics.js
 */
export function renderLessonWorkspace(topic) {
  if (!topic) return;

  const badgeTopic = document.querySelector(".badge-topic");
  const lessonHeading = document.querySelector("#lesson-heading");
  const theoryParagraphs = document.querySelectorAll(".theory-content > p");
  const codeBlock = document.querySelector(".code-block code");
  const theoryTip = document.querySelector(".theory-tip");
  const exerciseBadge = document.querySelector(".badge-exercise");
  const exerciseQuestion = document.querySelector("#exercise-question");
  const answerInput = document.querySelector("#user-answer");

  if (badgeTopic) {
    badgeTopic.textContent = `${topic.stepLabel} • Теорія`;
  }
  if (lessonHeading) {
    lessonHeading.textContent = topic.title;
  }
  if (theoryParagraphs.length > 0) {
    theoryParagraphs[0].textContent = topic.theory;
  }
  if (codeBlock && topic.codeExample) {
    codeBlock.textContent = topic.codeExample;
  }
  if (theoryTip && topic.tip) {
    theoryTip.textContent = `💡 Зверніть увагу: ${topic.tip}`;
  }
  if (exerciseBadge) {
    exerciseBadge.textContent = `Практична вправа • ${topic.stepLabel}`;
  }
  if (exerciseQuestion) {
    exerciseQuestion.textContent = `Завдання: ${topic.task}`;
  }

  // Очищуємо поле вводу та встановлюємо підказку-плейсхолдер при перемиканні теми
  if (answerInput) {
    answerInput.value = "";
    answerInput.placeholder = "Введіть вашу відповідь тут...";
  }
}

/**
 * Підключає слухачі подій до форми перевірки відповіді та кнопки підказки
 * @param {Object} handlers - Об'єкт з функціями-обробниками { onSubmitAnswer, onShowHint }
 */
export function bindWorkspaceEvents({ onSubmitAnswer, onShowHint }) {
  const form = document.querySelector("#exercise-form");
  const answerInput = document.querySelector("#user-answer");
  const hintBtn = document.querySelector("#hint-btn");

  if (form && answerInput) {
    form.addEventListener("submit", (event) => {
      // Обов'язково зупиняємо перезавантаження сторінки браузером!
      event.preventDefault();

      const rawValue = answerInput.value;
      if (typeof onSubmitAnswer === "function") {
        onSubmitAnswer(rawValue);
      }
    });
  }

  if (hintBtn) {
    hintBtn.addEventListener("click", () => {
      if (typeof onShowHint === "function") {
        onShowHint();
      }
    });
  }
}
