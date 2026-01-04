// ============================================
// МОДУЛЬ ТЕСТОВ  v3.0 (FINAL UX VERSION + RESET)
// С кнопкой "Показать пояснение"
// С интеграцией системы компетенций
// ============================================

let currentTestQuestion = 0;
let testScore = 0;
let testResults = [];
let currentTestType = 'DIAGNOSTIC'; // DIAGNOSTIC, SECTION_1, SECTION_2, SECTION_3, SECTION_4, FINAL

// Результаты по компетенциям
let competencyResults = {};

function initTestModule() {
    console.log("Модуль тестов v3.0 загружен");
    resetTestState();
    renderTestQuestion();
}

// Полный сброс состояния
function resetTestState() {
    currentTestQuestion = 0;
    testScore = 0;
    testResults = [];
    competencyResults = {};
}

// Кнопка "В меню" (Сброс + Выход)
function quitTest() {
    resetTestState();
    renderTestQuestion();
    showSection('menu');
}

// ============================================
// РЕНДЕР ВОПРОСА
// ============================================

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

    // А. Шапка с прогрессом
    const header = document.createElement('div');
    header.className = 'test-header-info';
    header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; color: #666;';
    header.innerHTML = `
        <span>Вопрос <strong>${currentTestQuestion + 1}</strong> из <strong>${questions.length}</strong></span>
        <span style="background: #e8f5e9; padding: 4px 10px; border-radius: 12px; font-size: 14px;">
            ✓ ${testScore} правильных
        </span>
    `;
    container.appendChild(header);

    // Прогресс-бар
    const progressBar = document.createElement('div');
    progressBar.style.cssText = 'width: 100%; height: 6px; background: #e0e0e0; border-radius: 3px; margin-bottom: 20px; overflow: hidden;';
    const progressFill = document.createElement('div');
    const progressPercent = ((currentTestQuestion) / questions.length) * 100;
    progressFill.style.cssText = `width: ${progressPercent}%; height: 100%; background: linear-gradient(90deg, #4CAF50, #8BC34A); transition: width 0.3s ease;`;
    progressBar.appendChild(progressFill);
    container.appendChild(progressBar);

    // Б. Компетенция вопроса (если есть)
    if (q.competency) {
        const competencyBadge = document.createElement('div');
        competencyBadge.style.cssText = 'margin-bottom: 12px;';
        const compInfo = getCompetencyInfo(q.competency);
        competencyBadge.innerHTML = `
            <span style="background: ${compInfo.color}20; color: ${compInfo.color}; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500;">
                ${compInfo.icon} ${compInfo.name}
            </span>
        `;
        container.appendChild(competencyBadge);
    }

    // В. Текст вопроса
    const qText = document.createElement('h3');
    qText.style.cssText = 'margin-bottom: 15px; font-size: 18px; line-height: 1.4; color: #1a3a52;';
    qText.innerText = q.question;
    container.appendChild(qText);

    // Г. Картинка
    const directUrl = (typeof convertGoogleDriveUrl === 'function') 
        ? convertGoogleDriveUrl(q.imageUrl) 
        : q.imageUrl;

    if (directUrl && directUrl.length > 5) {
        const img = document.createElement('img');
        img.referrerPolicy = "no-referrer";
        img.src = directUrl;
        img.alt = "Иллюстрация";
        
        img.style.cssText = 'display: block; max-width: 100%; max-height: 200px; object-fit: contain; border-radius: 8px; margin: 0 auto 20px auto; cursor: pointer;';
        
        img.onclick = () => {
            if (typeof openImageModal === 'function') openImageModal(directUrl);
        };
        
        container.appendChild(img);
    }

    // Д. Ответы
    const answersDiv = document.createElement('div');
    answersDiv.id = 'answersContainer';
    answersDiv.style.cssText = 'display: flex; flex-direction: column; gap: 12px;';
    container.appendChild(answersDiv);

    q.answers.forEach((ans, index) => {
        const btn = document.createElement('button');
        btn.className = 'btn answer-btn';
        btn.innerText = ans;
        
        btn.style.cssText = `
            width: 100%;
            padding: 14px 16px;
            text-align: left;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            background: white;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.2s ease;
        `;
        
        btn.onmouseover = () => {
            if (!btn.disabled) {
                btn.style.borderColor = '#1a3a52';
                btn.style.background = '#f8f9fa';
            }
        };
        btn.onmouseout = () => {
            if (!btn.disabled) {
                btn.style.borderColor = '#e0e0e0';
                btn.style.background = 'white';
            }
        };
        
        btn.onclick = () => checkTestAnswer(index, q, container);
        answersDiv.appendChild(btn);
    });

    // Е. Кнопка "Показать пояснение" (скрыта до ответа)
    const hasExplanation = q.explanation && q.explanation.trim() !== '';
    
    const showExplanationBtn = document.createElement('button');
    showExplanationBtn.id = 'showExplanationBtn';
    showExplanationBtn.innerHTML = '💡 Показать пояснение';
    showExplanationBtn.style.cssText = `
        display: none;
        width: 100%;
        margin-top: 15px;
        padding: 12px;
        background: transparent;
        color: #2196F3;
        border: 2px solid #2196F3;
        border-radius: 10px;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.2s ease;
    `;
    showExplanationBtn.dataset.hasExplanation = hasExplanation ? 'true' : 'false';
    showExplanationBtn.onclick = () => toggleExplanation();
    container.appendChild(showExplanationBtn);

    // Ж. Блок пояснения (скрыт)
    const explanationDiv = document.createElement('div');
    explanationDiv.id = 'explanationBlock';
    explanationDiv.style.cssText = `
        display: none;
        margin-top: 15px;
        padding: 15px;
        background: #e3f2fd;
        border-radius: 8px;
        border-left: 5px solid #2196F3;
        transition: all 0.3s ease;
    `;
    
    if (hasExplanation) {
        explanationDiv.innerHTML = `<strong>💡 Пояснение:</strong><br>${q.explanation}`;
    } else {
        explanationDiv.innerHTML = `<strong>💡 Пояснение:</strong><br><em style="color:#999;">Пояснение для этого вопроса пока не добавлено.</em>`;
    }
    container.appendChild(explanationDiv);

    // З. Кнопка "Далее"
    const nextBtn = document.createElement('button');
    nextBtn.id = 'nextQuestionBtn';
    nextBtn.innerText = 'Далее →';
    nextBtn.onclick = nextTestQuestion;
    
    nextBtn.style.cssText = `
        display: none;
        width: 100%;
        margin-top: 15px;
        padding: 15px;
        background: #1a3a52;
        color: white;
        border: none;
        border-radius: 10px;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
    `;
    
    container.appendChild(nextBtn);
}

// ============================================
// ИНФОРМАЦИЯ О КОМПЕТЕНЦИИ
// ============================================

function getCompetencyInfo(competencyId) {
    const competencies = {
        HEMOSTASIS: { name: 'Гемостаз', icon: '🩸', color: '#dc3545' },
        AIRWAY: { name: 'Дых. пути', icon: '🫁', color: '#17a2b8' },
        ANALGESIA: { name: 'Анальгезия', icon: '💊', color: '#6f42c1' },
        SHOCK: { name: 'Шок', icon: '⚡', color: '#fd7e14' },
        WOUND_CARE: { name: 'Раны', icon: '🩹', color: '#20c997' },
        ANTIBIOTICS: { name: 'Антибиотики', icon: '💉', color: '#e83e8c' },
        EVACUATION: { name: 'Эвакуация', icon: '🚑', color: '#6c757d' },
        HYPOTHERMIA: { name: 'Гипотермия', icon: '🌡️', color: '#007bff' }
    };
    
    return competencies[competencyId] || { name: competencyId, icon: '📌', color: '#666666' };
}

// ============================================
// ПЕРЕКЛЮЧЕНИЕ ПОЯСНЕНИЯ
// ============================================

function toggleExplanation() {
    const explanationBlock = document.getElementById('explanationBlock');
    const showBtn = document.getElementById('showExplanationBtn');
    
    if (!explanationBlock || !showBtn) return;
    
    if (explanationBlock.style.display === 'none') {
        explanationBlock.style.display = 'block';
        explanationBlock.style.opacity = '0';
        setTimeout(() => explanationBlock.style.opacity = '1', 50);
        showBtn.innerHTML = '💡 Скрыть пояснение';
        showBtn.style.background = '#e3f2fd';
    } else {
        explanationBlock.style.display = 'none';
        showBtn.innerHTML = '💡 Показать пояснение';
        showBtn.style.background = 'transparent';
    }
}

// ============================================
// ПРОВЕРКА ОТВЕТА
// ============================================

function checkTestAnswer(selectedIndex, question, container) {
    const btns = container.querySelectorAll('.answer-btn');
    const isCorrect = (selectedIndex === question.correct);

    // Подсветка ответов
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

    // Обновляем счётчик
    if (isCorrect) testScore++;

    // Сохраняем результат с компетенцией
    const competency = question.competency || 'UNKNOWN';
    
    testResults.push({
        questionId: question.id,
        competency: competency,
        isCorrect: isCorrect
    });

    // Обновляем статистику по компетенциям
    if (!competencyResults[competency]) {
        competencyResults[competency] = { correct: 0, total: 0 };
    }
    competencyResults[competency].total++;
    if (isCorrect) {
        competencyResults[competency].correct++;
    }

    // Показываем кнопку пояснения
    const showExplanationBtn = document.getElementById('showExplanationBtn');
    if (showExplanationBtn && showExplanationBtn.dataset.hasExplanation === 'true') {
        showExplanationBtn.style.display = 'block';
    }

    // Показываем кнопку "Далее"
    const nextBtn = document.getElementById('nextQuestionBtn');
    if (nextBtn) {
        nextBtn.style.display = 'block';
    }
}

// ============================================
// СЛЕДУЮЩИЙ ВОПРОС
// ============================================

function nextTestQuestion() {
    currentTestQuestion++;
    renderTestQuestion();
}

// ============================================
// РЕЗУЛЬТАТЫ ТЕСТА
// ============================================

function showTestResult(container) {
    const questions = appData.questions;
    const finalScorePercent = Math.round((testScore / questions.length) * 100);
    
    // Рассчитываем проценты по компетенциям
    const competencyScores = {};
    for (const [compId, data] of Object.entries(competencyResults)) {
        competencyScores[compId] = Math.round((data.correct / data.total) * 100);
    }

    // === СОХРАНЕНИЕ РЕЗУЛЬТАТОВ ===
    
    // 1. Общая история тестов (старый формат для совместимости)
    const history = JSON.parse(localStorage.getItem('testResults') || '[]');
    history.push({
        date: new Date().toISOString(),
        score: finalScorePercent,
        total: questions.length,
        correct: testScore,
        type: currentTestType,
        competencyScores: competencyScores
    });
    localStorage.setItem('testResults', JSON.stringify(history));

    // 2. Матрица прогресса компетенций (новый формат)
    saveToProgressMatrix(competencyScores, currentTestType);

    // Обновляем прогресс
    if (typeof updateProgress === 'function') updateProgress();

    // === ОТОБРАЖЕНИЕ РЕЗУЛЬТАТОВ ===
    
    const emoji = finalScorePercent >= 80 ? '🏆' : (finalScorePercent >= 50 ? '🙂' : '📚');
    const message = finalScorePercent >= 80 
        ? 'Отличный результат!' 
        : (finalScorePercent >= 50 ? 'Хороший результат!' : 'Нужно подтянуть знания');

    container.innerHTML = `
        <div style="text-align: center; padding: 20px 10px;">
            <div style="font-size: 60px; margin-bottom: 15px;">${emoji}</div>
            
            <h2 style="color: #1a3a52; margin-bottom: 10px;">Тест завершен!</h2>
            <p style="color: #666; margin-bottom: 20px;">${message}</p>
            
            <!-- Общий результат -->
            <div style="background: #f8f9fa; padding: 20px; border-radius: 15px; margin-bottom: 20px;">
                <div style="font-size: 42px; font-weight: bold; color: ${finalScorePercent >= 70 ? '#28a745' : '#dc3545'};">
                    ${finalScorePercent}%
                </div>
                <p style="margin-top: 10px; color: #666;">${testScore} из ${questions.length} правильных ответов</p>
            </div>
            
            <!-- Результаты по компетенциям -->
            <div style="background: #1e2a38; border-radius: 12px; padding: 15px; margin-bottom: 20px; text-align: left;">
                <h4 style="color: #fff; margin-bottom: 15px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                    📊 Результаты по компетенциям
                </h4>
                ${renderCompetencyResults(competencyScores)}
            </div>
            
            <!-- Кнопки -->
            <button onclick="initTestModule()" 
                    style="padding: 15px 30px; background: #0056b3; color: white; border: none; border-radius: 10px; font-size: 18px; width: 100%; cursor: pointer; margin-bottom: 10px;">
                Пройти заново ↻
            </button>
            
            <button onclick="showSection('progress')" 
                    style="padding: 15px; background: #28a745; color: white; border: none; border-radius: 10px; font-size: 16px; width: 100%; cursor: pointer; margin-bottom: 10px;">
                📊 Посмотреть матрицу прогресса
            </button>
            
            <button onclick="quitTest()" 
                    style="padding: 15px; background: transparent; color: #666; border: 2px solid #ddd; border-radius: 10px; font-size: 16px; width: 100%; cursor: pointer;">
                В меню
            </button>
        </div>
    `;
}

// ============================================
// РЕНДЕР РЕЗУЛЬТАТОВ ПО КОМПЕТЕНЦИЯМ
// ============================================

function renderCompetencyResults(competencyScores) {
    const entries = Object.entries(competencyScores);
    
    if (entries.length === 0) {
        return '<p style="color: #888; text-align: center;">Нет данных</p>';
    }
    
    return entries.map(([compId, score]) => {
        const info = getCompetencyInfo(compId);
        const barColor = score >= 70 ? '#4ade80' : (score >= 50 ? '#fbbf24' : '#f87171');
        
        return `
            <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="color: #e2e8f0; font-size: 14px;">
                        ${info.icon} ${info.name}
                    </span>
                    <span style="color: ${barColor}; font-weight: bold; font-size: 14px;">
                        ${score}%
                    </span>
                </div>
                <div style="height: 8px; background: #374151; border-radius: 4px; overflow: hidden;">
                    <div style="width: ${score}%; height: 100%; background: ${barColor}; border-radius: 4px; transition: width 0.5s ease;"></div>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// СОХРАНЕНИЕ В МАТРИЦУ ПРОГРЕССА
// ============================================

function saveToProgressMatrix(competencyScores, testType) {
    // Получаем текущую матрицу или создаём новую
    let matrix = JSON.parse(localStorage.getItem('progressMatrix') || '{}');
    
    // Инициализация структуры для каждой компетенции
    const competencyIds = ['HEMOSTASIS', 'AIRWAY', 'ANALGESIA', 'SHOCK', 'WOUND_CARE', 'ANTIBIOTICS', 'EVACUATION', 'HYPOTHERMIA'];
    
    competencyIds.forEach(id => {
        if (!matrix[id]) {
            matrix[id] = {
                diagnostic: null,
                sections: { 1: null, 2: null, 3: null, 4: null },
                final: null
            };
        }
    });
    
    // Записываем результаты в зависимости от типа теста
    for (const [compId, score] of Object.entries(competencyScores)) {
        if (!matrix[compId]) {
            matrix[compId] = {
                diagnostic: null,
                sections: { 1: null, 2: null, 3: null, 4: null },
                final: null
            };
        }
        
        switch (testType) {
            case 'DIAGNOSTIC':
                matrix[compId].diagnostic = score;
                break;
            case 'SECTION_1':
                matrix[compId].sections[1] = score;
                break;
            case 'SECTION_2':
                matrix[compId].sections[2] = score;
                break;
            case 'SECTION_3':
                matrix[compId].sections[3] = score;
                break;
            case 'SECTION_4':
                matrix[compId].sections[4] = score;
                break;
            case 'FINAL':
                matrix[compId].final = score;
                break;
        }
    }
    
    // Сохраняем обновлённую матрицу
    localStorage.setItem('progressMatrix', JSON.stringify(matrix));
    
    console.log('📊 Матрица прогресса обновлена:', matrix);
}

// ============================================
// ЗАПУСК ТЕСТА ОПРЕДЕЛЁННОГО ТИПА
// ============================================

function startTest(testType) {
    currentTestType = testType || 'DIAGNOSTIC';
    resetTestState();
    
    // В будущем здесь можно фильтровать вопросы по типу теста
    // Пока используем все вопросы
    
    console.log(`🎯 Запуск теста: ${currentTestType}`);
    
    showSection('test');
    renderTestQuestion();
}

// Экспорт для глобального доступа
if (typeof window !== 'undefined') {
    window.startTest = startTest;
}
