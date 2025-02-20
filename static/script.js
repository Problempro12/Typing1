// Запрет F12, выделения и копирования
document.addEventListener("keydown", function (event) {
    if (
      event.key === "F12" ||
      (event.ctrlKey && event.shiftKey && event.key === "I")
    ) {
      event.preventDefault();
      document.getElementById("devtools-banner").style.display = "block";
    }
  });

  document.addEventListener("contextmenu", (event) =>
    event.preventDefault()
  );
  document.addEventListener("selectstart", (event) =>
    event.preventDefault()
  );
  document.addEventListener("dragstart", (event) => event.preventDefault());

// Находим элементы
const textToTypeElement = document.getElementById('text-to-type');
const userInput = document.getElementById('user-input');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const startButton = document.getElementById('start-btn');
const accuracySpan = document.getElementById('accuracy'); // Инициализация accuracySpan
const wpmSpan = document.getElementById('wpm');


// Переменные для отслеживания состояния
let startTime, interval;
let isTestStarted = false;
let originalText = "";

// Функция для начала теста
function startTypingTest() {
    wpmDisplay.textContent = '0';
    accuracyDisplay.textContent = '100';
        originalText = generateTextFromWords(); // Generate text without length

    textToTypeElement.innerText = originalText; // Устанавливаем текст для набора

    startTime = new Date();
    clearInterval(interval);
    interval = setInterval(updateStats, 1000);
}

// Функция для обновления статистики
function updateStats() {
    const typedText = userInput.value;
    const totalTyped = typedText.length;

    // Проверяем, что тест уже начался
    if (!startTime) {
        return; // Если тест не начался, ничего не делаем
    }

    const elapsedTime = (new Date() - startTime) / 60000; // в минутах

    // Проверяем, что elapsedTime больше 0, чтобы избежать деления на ноль
    if (elapsedTime > 0) {
        const wpm = Math.round(totalTyped / elapsedTime);
        wpmSpan.textContent = wpm;
    } else {
        wpmSpan.textContent = '0'; // Если время не прошло, показываем 0
    }

    let correctChars = 0;
    for (let i = 0; i < totalTyped; i++) {
        if (typedText[i] === originalText[i]) {
            correctChars++;
        }
    }
    const accuracy = Math.round((correctChars / totalTyped) * 100) || 0;
    accuracyDisplay.textContent = accuracy; // Используем accuracyDisplay

    // Проверка на завершение теста
    if (typedText.length === originalText.length) {
        endGame(); // Завершение теста, если длина совпадает
    }
}

// Обработчик событий для поля ввода
userInput.addEventListener('input', function() {
    const typedText = userInput.value;

    // Ваша существующая логика обновления статистики
    updateStats();
});

// Привязываем обработчики
startButton.addEventListener('click', startTypingTest);

// Функция для расчета точности
function calculateAccuracy(inputText, originalText) {
    let correctChars = 0;
    const inputChars = inputText.split('');
    const originalChars = originalText.split('');

    // Сравниваем только введенные символы с оригинальными
    for (let i = 0; i < inputChars.length; i++) {
        if (inputChars[i] === originalChars[i]) {
            correctChars++;
        }
    }

    // Учитываем только те символы, которые были введены
    return Math.round((correctChars / inputChars.length) * 100) || 0; // Избегаем деления на ноль
}

// Генерация текста из осмысленных слов
function generateTextFromWords() {
    let randomText = "";
    const randomWord = words[Math.floor(Math.random() * words.length)];
    randomText += randomWord; // Generate a single random word
    // Делаем первую букву заглавной
    return randomText.charAt(0).toUpperCase() + randomText.slice(1);
}

// Установка случайного текста в бокс
function setRandomText() {
    const length = parseInt(document.getElementById('text-length').value); // Длина текста в символах
    const randomText = generateTextFromWords(length); // Генерируем текст из осмысленных слов
    textToTypeElement.innerText = randomText; // Устанавливаем текст
}

// Завершение теста
// Завершение теста
function endTypingTest() {
    clearInterval(interval);
    const finalCpm = wpmDisplay.textContent;
    const finalAccuracy = accuracyDisplay.textContent;

    // Получаем текущий уровень сложности
    const difficulty = getDifficultyLevel();  // Получаем уровень сложности, можно передать как параметр

    // Кодируем результаты
    const encodedData = encodeResults(finalCpm, finalAccuracy, getCurrentDateTime());

    // Перенаправляем на страницу результатов, передавая данные и уровень сложности
    window.location.href = `/results?data=${encodedData}&difficulty=${difficulty}`;
    
    // Дополнительно можно сбросить поле ввода и другие элементы, если это необходимо
    resetTypingTest(); // Вызываем функцию сброса, если нужно
}


// Функция для получения текущего уровня сложности
function getDifficultyLevel() {
    // Замените это на логику, которая определяет текущий уровень сложности
    // Например, можно получить его из URL или из какой-то переменной
    return "Легкий"; // Это временно для примера
}


// Функция для кодирования результатов
function encodeResults(wpm, accuracy, dateTime) {
    const dataString = `${wpm}:${accuracy}:${dateTime}`;
    const encodedString = encodeURIComponent(btoa(dataString));
    return encodedString;
}

// Функция для получения текущей даты и времени
function getCurrentDateTime() {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${day}/${month} ${hours}:${minutes}`;
}

// Проверка завершения теста
userInput.addEventListener('input', () => {
    const inputText = userInput.value;
    const originalText = textToTypeElement.innerText;

    // Автозапуск при первом вводе текста
    if (!isTestStarted) {
        isTestStarted = true;
        startTypingTest();
    }

    const resultHTML = [];

    // Проверяем каждый символ оригинального текста
    for (let i = 0; i < originalText.length; i++) {
        if (i < inputText.length) {
            // Если символ введен, проверяем его
            if (inputText[i] === originalText[i]) {
                resultHTML.push(`<span class="correct">${originalText[i]}</span>`); // Правильный символ
            } else {
                resultHTML.push(`<span class="incorrect">${originalText[i]}</span>`); // Неправильный символ
            }
        } else {
            // Если символ не введен, показываем оригинальный символ серым
            resultHTML.push(`<span class="gray">${originalText[i]}</span>`); 
        }
    }

    // Обновляем отображение текста
    textToTypeElement.innerHTML = resultHTML.join('');

    // Проверка на завершение ввода
    if (inputText.length >= originalText.length) {
        setTimeout(endTypingTest, 200); // Задержка перед завершением теста
    }

    // Обновляем статистику
    updateStats();
});

// Привязываем обработчики
startButton.addEventListener('click', startTypingTest);
document.getElementById('generate-btn').addEventListener('click', () => {
    const randomText = generateTextFromWords(); // Generate random text
    textToTypeElement.innerText = randomText; // Set the generated text
});

// Анимации для элементов интерфейса
window.onload = () => {
    gsap.from(".typing-game", { opacity: 0, duration: 1.5, y: -100 });
}

// Функция для сброса теста
function resetTypingTest() {
    userInput.value = ''; // Очищаем поле ввода
    textToTypeElement.innerText = 'Здесь будет текст для набора'; // Восстанавливаем текст по умолчанию
    wpmDisplay.textContent = '0'; // Обнуляем WPM
    accuracyDisplay.textContent = '100'; // Обнуляем точность
    clearInterval(interval); // Очищаем интервал
    isTestStarted = false; // Сбрасываем флаг теста
}

// Привязываем обработчик к кнопке сброса
document.getElementById('reset-btn').addEventListener('click', resetTypingTest);

document.addEventListener("keydown", (event) => {
    if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault(); // Блокируем удаление
    }
});

