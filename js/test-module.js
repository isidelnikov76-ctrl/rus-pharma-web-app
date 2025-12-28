// ============================================
// МОДУЛЬ ТЕСТОВ (FINAL UX VERSION + RESET)
// ============================================

let currentTestQuestion = 0;
let testScore = 0;
let testResults = [];

function initTestModule() {
    console.log("Модуль тестов загружен");
    resetTestState();
    renderTestQuestion();
}

// Новая функция для полного сброса состояния
function resetTestState() {
    currentTestQuestion = 0;
    testScore = 0;
    testResults = [];
}

// Функция для кнопки "В меню" (Сброс + Выход)
function quitTest() {
    resetTestState();     // 1. Обнуляем счетчики
    renderTestQuestion(); // 2. Рисуем первый вопрос (чтобы он ждал нас при возвращении)
    showSection('menu');  // 3. Уходим в меню
}

function renderTestQuestion() {
    const questions = appData.questions;
    const container = document.getElementById('test') || document.querySelector('.test-container');
    if (!container) return;

    container.innerHTML = '';

    // 1. Проверка наличия данных
    if (!questions || questions.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:20px;">Вопросы не загружены. Обновите данные.</div>';
        return;
    }
    
    // 2. Проверка окончания теста
    if (currentTestQuestion >= questions.length) {
        showTestResult(container);
        return;
    }

    const q = questions[currentTestQuestion];

    // === ИНТЕРФЕЙС ===

    // А. Шапка
    const header = document.createElement('div');
    header.style.marginBottom = '15px';
    header.style.color = '#666';
    header.innerHTML = `Вопрос <span id="questionNum">${currentTestQuestion + 1}</span> из <span id="totalQuestions">${questions.length}</span>`;
    container.appendChild(header);

    // Б. Текст вопроса
    const qText = document.createElement('h3');
    qText.style.marginBottom = '15px';
    qText.innerText = q.question;
    container.appendChild(qText);

    // В. Картинка
    const directUrl = (typeof convertGoogleDriveUrl === 'function') 
        ? convertGoogleDriveUrl(q.imageUrl) 
        : q.imageUrl;

    if (directUrl && directUrl.length > 5) {
        const img = document.createElement('img');
        img.referrerPolicy = "no-referrer";
        img.src = directUrl;
        img.alt = "Иллюстрация";
        
        img.style.display = 'block';
        img.style.maxWidth = '100%';
        img.style.maxHeight = '200px';
        img.style.objectFit = 'contain';
        img.style.borderRadius = '8px';
        img.style.margin = '0 auto 20px auto';
        
        img.onclick = () => {
            if (typeof openImageModal === 'function') openImageModal(directUrl);
        };
        
        container.appendChild(img);
    }

    // Г. Ответы
    const answersDiv = document.createElement('div');
    answersDiv.id = 'answersContainer';
    answersDiv.style.display = 'flex';
    answersDiv.style.flexDirection = 'column';
    answersDiv.style.gap = '12px';
    container.appendChild(answersDiv);

    q.answers.forEach((ans, index) => {
        const btn = document.createElement('button');
        btn.className = 'btn answer-btn';
        btn.innerText = ans;
        
        btn.style.width = '100%';
        btn.style.padding = '14px';
        btn.style.textAlign = 'left';
        btn.style.border = '2px solid #e0e0e0';
        btn.style.borderRadius = '10px';
        btn.style.background = 'white';
        btn.style.fontSize = '16px';
        btn.style.cursor = 'pointer';
        btn.style.transition = 'all 0.2s ease';
        
        btn.onclick = () => checkTestAnswer(index, q, container);
        answersDiv.appendChild(btn);
    });

    // Д. Объяснение
    const explanationDiv = document.createElement('div');
    explanationDiv.id = 'explanationBlock';
    explanationDiv.style.display = 'none';
    explanationDiv.style.marginTop = '20px';
    explanationDiv.style.padding = '15px';
    explanationDiv.style.background = '#e3f2fd';
    explanationDiv.style.borderRadius = '8px';
    explanationDiv.style.borderLeft = '5px solid #2196F3';
    explanationDiv.innerHTML = `<strong>💡 Пояснение:</strong><br>${q.explanation}`;
    container.appendChild(explanationDiv);

    // Е. Кнопка "Далее"
    const nextBtn = document.createElement('button');
    nextBtn.id = 'nextQuestionBtn';
    nextBtn.innerText = 'Далее →';
    nextBtn.onclick = nextTestQuestion;
    
    nextBtn.style.display = 'none';
    nextBtn.style.width = '100%';
    nextBtn.style.marginTop = '20px';
    nextBtn.style.padding = '15px';
    nextBtn.style.background = '#1a3a52';
    nextBtn.style.color = 'white';
    nextBtn.style.border = 'none';
    nextBtn.style.borderRadius = '10px';
    nextBtn.style.fontSize = '18px';
    nextBtn.style.fontWeight = 'bold';
    nextBtn.style.cursor = 'pointer';
    
    container.appendChild(nextBtn);
}

function checkTestAnswer(selectedIndex, question, container) {
    const btns = container.querySelectorAll('.answer-btn');
    const isCorrect = (selectedIndex === question.correct);

    btns.forEach((btn, index) => {
        btn.disabled = true;
        btn.style.cursor = 'default';
        
        if (index === question.correct) {
            btn.style.background = '#d4edda';
            btn.style.borderColor = '#28a745';
            btn.innerHTML += ' ✅';
        } else if (index === selectedIndex && !isCorrect) {
            btn.style.background = '#f8d7da';
            btn.style.borderColor = '#dc3545';
            btn.innerHTML += ' ❌';
        } else {
            btn.style.opacity = '0.6';
        }
    });

    if (isCorrect) testScore++;

    testResults.push({
        questionId: question.id,
        isCorrect: isCorrect
    });

    const explanation = document.getElementById('explanationBlock');
    if (explanation) {
        explanation.style.display = 'block';
        explanation.style.opacity = '0';
        setTimeout(() => explanation.style.opacity = '1', 50);
    }

    const nextBtn = document.getElementById('nextQuestionBtn');
    if (nextBtn) {
        nextBtn.style.display = 'block';
    }
}

function nextTestQuestion() {
    currentTestQuestion++;
    renderTestQuestion();
}

function showTestResult(container) {
    const history = JSON.parse(localStorage.getItem('testResults') || '[]');
    const finalScorePercent = Math.round((testScore / appData.questions.length) * 100);
    
    history.push({
        date: new Date().toISOString(),
        score: finalScorePercent,
        total: appData.questions.length,
        correct: testScore
    });
    localStorage.setItem('testResults', JSON.stringify(history));

    if (typeof updateProgress === 'function') updateProgress();

    container.innerHTML = `
        <div style="text-align: center; padding: 30px 10px;">
            <div style="font-size: 60px; margin-bottom: 20px;">
                ${finalScorePercent >= 80 ? '🏆' : (finalScorePercent >= 50 ? '🙂' : '📚')}
            </div>
            
            <h2 style="color: #1a3a52; margin-bottom: 15px;">Тест завершен!</h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 15px; margin-bottom: 30px;">
                <p style="font-size: 16px; color: #666; margin-bottom: 10px;">Ваш результат:</p>
                <div style="font-size: 42px; font-weight: bold; color: ${finalScorePercent >= 70 ? '#28a745' : '#dc3545'};">
                    ${finalScorePercent}%
                </div>
                <p style="margin-top: 10px;">${testScore} из ${appData.questions.length} верных</p>
            </div>

            <button onclick="initTestModule()" 
                    style="padding: 15px 30px; background: #0056b3; color: white; border: none; border-radius: 10px; font-size: 18px; width: 100%; cursor: pointer;">
                Пройти заново ↻
            </button>
            
            <button onclick="quitTest()" 
                    style="margin-top: 15px; padding: 15px; background: transparent; color: #666; border: 2px solid #ddd; border-radius: 10px; font-size: 16px; width: 100%; cursor: pointer;">
                В меню
            </button>
        </div>
    `;
}