# Модуль: Навчальна вікторина тренажера "PythonStart" для 8-11 класів
# Дисципліна: Командна розробка програмних проєктів

def check_answer(user_answer, correct_answer):
    """Функція перевіряє правильність відповіді учня."""
    return user_answer.strip().lower() == correct_answer.strip().lower()

def run_quiz():
    """Функція запускає базове опитування з основ Python."""
    print("=== Вітаємо у тренажері PythonStart! ===")
    score = 0

    # Питання 1
    ans1 = input("1. Яка функція в Python виводить текст на екран? (введіть назву без дужок): ")
    if check_answer(ans1, "print"):
        print("Правильно! Молодець!\n")
        score += 1
    else:
        print("Помилка. Правильна відповідь: print\n")

    # Питання 2
    ans2 = input("2. Який символ використовується для присвоєння значення змінній у Python?: ")
    if check_answer(ans2, "="):
        print("Правильно! Чудова робота!\n")
        score += 1
    else:
        print("Помилка. Правильна відповідь: =\n")

    print(f"Вікторину завершено! Ваш результат: {score} з 2 балів.")

if __name__ == "__main__":
    run_quiz()