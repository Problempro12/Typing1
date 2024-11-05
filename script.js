// Находим элементы
const textToTypeElement = document.getElementById('text-to-type');
const userInput = document.getElementById('user-input');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const startButton = document.getElementById('start-btn');

// Переменные для отслеживания состояния
let startTime, interval;
let isTestStarted = false; // Добавляем флаг для автостарта

// Функция для начала теста
function startTypingTest() {
    userInput.value = '';          // Очищаем поле ввода
    wpmDisplay.textContent = '0';   // Обнуляем WPM
    accuracyDisplay.textContent = '100'; // Обнуляем точность

    startTime = new Date();
    clearInterval(interval);
    interval = setInterval(updateStats, 1000);

    animateText(); // Анимация текста при запуске
}

// Функция для обновления статистики
function updateStats() {
    const timeElapsed = (new Date() - startTime) / 60000; // время в минутах
    const charsTyped = userInput.value.length;
    const cpm = Math.round(charsTyped / timeElapsed);

    const accuracy = calculateAccuracy(userInput.value, textToTypeElement.innerText);

    wpmDisplay.textContent = cpm; // Отображаем CPM
    accuracyDisplay.textContent = accuracy;
}

// Функция для расчета точности
function calculateAccuracy(inputText, originalText) {
    let correctChars = 0;
    const inputChars = inputText.split('');
    const originalChars = originalText.split('');

    for (let i = 0; i < inputChars.length; i++) {
        if (inputChars[i] === originalChars[i]) {
            correctChars++;
        }
    }
    
    return Math.round((correctChars / originalChars.length) * 100);
}

// Генерация текста из осмысленных слов
function generateTextFromWords(maxLength) {
    let randomText = "";
    while (randomText.length < maxLength) {
        const randomWord = words[Math.floor(Math.random() * words.length)];
        if (randomText.length + randomWord.length + 1 <= maxLength) {
            randomText += (randomText ? " " : "") + randomWord;
        } else {
            break;
        }
    }
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
function endTypingTest() {
    clearInterval(interval);
    const finalCpm = wpmDisplay.textContent;
    const finalAccuracy = accuracyDisplay.textContent;

    alert(`Тест завершен!\nСкорость: ${finalCpm} CPM\nТочность: ${finalAccuracy}%`);
}

// Проверка завершения теста
userInput.addEventListener('input', () => {
    if (!isTestStarted) { // Автозапуск при первом вводе текста
        isTestStarted = true;
        startTypingTest();
    }

    if (userInput.value.length >= textToTypeElement.innerText.length) {
        endTypingTest();
    }
});

// Привязываем обработчики
startButton.addEventListener('click', startTypingTest);
document.getElementById('generate-btn').addEventListener('click', setRandomText);

// Анимации для элементов интерфейса
window.onload = () => {
    gsap.from(".typing-game", { opacity: 0, duration: 1, y: -50 });
    gsap.from("header h1", { opacity: 0, duration: 1, x: -30, delay: 0.5 });
    gsap.from("#text-to-type", { opacity: 0, duration: 1, y: 30, delay: 1 });
    gsap.from("#start-btn", { opacity: 0, duration: 1, scale: 0.8, delay: 1.5 });
}

// Завершение теста
function endTypingTest() {
    clearInterval(interval);
    const finalCpm = wpmDisplay.textContent;
    const finalAccuracy = accuracyDisplay.textContent;

    // Плавное перемещение и затемнение предыдущих результатов
    const prevResultsElement = document.getElementById('prev-results');
    prevResultsElement.textContent = `Скорость: ${finalCpm} CPM, Точность: ${finalAccuracy}%`;

    // Анимация с помощью GSAP: перемещаем вниз и уменьшаем прозрачность
    gsap.to(prevResultsElement, {
        y: 30, // Смещение вниз
        opacity: 0.6, // Затемнение
        duration: 1,
        ease: "power1.out",
        onComplete: () => {
            prevResultsElement.style.color = "#999"; // Затемняем текст
            gsap.to(prevResultsElement, { y: 0, opacity: 1, duration: 0.5 }); // Возвращаем на место с новым результатом
        }
    });

    alert(`Тест завершен!\nСкорость: ${finalCpm} CPM\nТочность: ${finalAccuracy}%`);
}
