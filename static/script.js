// Находим все элементы
document.addEventListener('DOMContentLoaded', function() {
  const textToType = document.getElementById('text-to-type');
const userInput = document.getElementById('user-input');
  const generateBtn = document.getElementById('generate-btn');
  const startBtn = document.getElementById('start-btn');
  const resetBtn = document.getElementById('reset-btn');
  const textLengthSelect = document.getElementById('text-length');
const wpmSpan = document.getElementById('wpm');
  const accuracySpan = document.getElementById('accuracy');

  let currentText = '';
  let startTime = null;
  let timer = null;

  // Генерация текста заданной длины
  function generateText(length) {
    let result = [];
    let currentLength = 0;

    while (currentLength < length) {
      const randomWord = words[Math.floor(Math.random() * words.length)];
      
      // Делаем первую букву первого слова заглавной
      const wordToAdd = result.length === 0 
        ? randomWord.charAt(0).toUpperCase() + randomWord.slice(1) 
        : randomWord;

      // Учитываем длину слова и пробел
      const wordLength = wordToAdd.length + (result.length > 0 ? 1 : 0);
      
      if (currentLength + wordLength <= length) {
        result.push(wordToAdd);
        currentLength += wordLength;
      } else {
        break;
      }
    }

    return result.join(' ');
  }

  // Обновление текста для набора
  function updateText() {
    const length = parseInt(textLengthSelect.value);
    currentText = generateText(length);
    
    // Разбиваем текст на символы и создаем span для каждого
    const spans = [];
    for (let i = 0; i < currentText.length; i++) {
      const char = currentText[i];
      if (char === ' ') {
        spans.push(' ');
      } else {
        spans.push(`<span class="char">${char}</span>`);
      }
    }
    textToType.innerHTML = spans.join('');
    
    userInput.value = '';
    startTime = null;
    if (timer) clearInterval(timer);
    wpmSpan.textContent = '0';
    accuracySpan.textContent = '100';
  }

  // Обновление статистики
  function updateStats() {
    if (!startTime) {
      startTime = Date.now();
      timer = setInterval(updateStats, 100);
    }
    
    const typedText = userInput.value;
    const elapsedMinutes = (Date.now() - startTime) / 60000;
    const wpm = Math.round(typedText.length / elapsedMinutes);
    
    let correctChars = 0;
    const chars = textToType.getElementsByClassName('char');
    let charIndex = 0;
    
    // Проверяем каждый символ
    for (let i = 0; i < typedText.length && i < currentText.length; i++) {
      if (currentText[i] === ' ') {
        if (typedText[i] === ' ') correctChars++;
        continue;
      }
      
      if (charIndex < chars.length) {
        if (typedText[i] === currentText[i]) {
            correctChars++;
          chars[charIndex].className = 'char correct';
        } else {
          chars[charIndex].className = 'char incorrect';
        }
        charIndex++;
      }
    }

    // Подсветка текущего символа
    let nextCharIndex = 0;
    for (let i = 0; i < currentText.length && i < typedText.length; i++) {
      if (currentText[i] !== ' ') nextCharIndex++;
    }
    
    if (nextCharIndex < chars.length) {
      chars[nextCharIndex].className = 'char active';
    }

    // Сброс классов для оставшихся символов
    for (let i = nextCharIndex + 1; i < chars.length; i++) {
      chars[i].className = 'char';
    }
    
    // Вычисляем точность
    const accuracy = typedText.length > 0 
      ? Math.round((correctChars / typedText.length) * 100) 
      : 100;
    
    wpmSpan.textContent = wpm;
    accuracySpan.textContent = accuracy;

    // Проверка завершения текста
    if (typedText.length === currentText.length) {
      clearInterval(timer);
      
      // Кодируем результаты для URL
      const results = {
        wpm: wpm,
        accuracy: accuracy,
        difficulty: document.title.includes('Начальный') ? 'Легкий' : 
                   document.title.includes('Нормальный') ? 'Нормальный' : 
                   document.title.includes('Продвинутый') ? 'Продвинутый' : 
                   document.title.includes('Сложный') ? 'Сложный' : 'Легкий',
        dateTime: new Date().toISOString()
      };
      const jsonString = JSON.stringify(results);
      const encodedData = encodeURIComponent(jsonString);
      
      // Перенаправляем на страницу результатов через небольшую задержку
      setTimeout(() => {
        window.location.href = `/results?data=${encodedData}`;
      }, 1500);
    }
  }

  // Обработчики событий
  generateBtn.addEventListener('click', () => {
    updateText();
    userInput.focus();
  });

  startBtn.addEventListener('click', () => {
    updateStats();
    userInput.focus();
  });

  resetBtn.addEventListener('click', () => {
    updateText();
    userInput.focus();
  });

  // Предотвращение удаления символов
  userInput.addEventListener('keydown', (event) => {
    // Если нажата клавиша Backspace или Delete
    if (event.key === 'Backspace' || event.key === 'Delete') {
      // Получаем текущую длину введенного текста
      const currentLength = userInput.value.length;
      
      // Если пытаемся удалить символ, который уже был введен
      if (currentLength > 0) {
        // Предотвращаем удаление
        event.preventDefault();
      }
    }
  });

  userInput.addEventListener('input', updateStats);

  textToType.addEventListener('click', () => {
    userInput.focus();
  });

  // Предотвращение потери фокуса
  userInput.addEventListener('blur', (event) => {
    // Проверяем, не кликнули ли мы на select или его опции
    const relatedTarget = event.relatedTarget;
    if (relatedTarget && (relatedTarget.tagName === 'SELECT' || relatedTarget.tagName === 'OPTION')) {
      return;
    }
    setTimeout(() => userInput.focus(), 0);
  });

  // Инициализация при загрузке
  userInput.placeholder = "Здесь будет отображаться текст для ввода...";
  userInput.focus();
});

// Защита от инструментов разработчика
/*
document.addEventListener('keydown', function (event) {
  if (event.key === 'F12' || (event.ctrlKey && event.shiftKey && event.key === 'I')) {
    event.preventDefault();
    document.getElementById('devtools-banner').style.display = 'block';
  }
});
*/

// Запрет выделения текста
document.ondragstart = noselect;
document.onselectstart = noselect;
document.oncontextmenu = noselect;
function noselect() {
  return false;
}
