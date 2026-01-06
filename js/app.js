// ============================================
// APP.JS - Главный файл приложения
// Версия 2.1 - С матрицей прогресса
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Инициализация при загрузке страницы
    loadData(); 
    
    // Инициализация навигации (показываем меню)
    showSection('menu');
});

// ============================================
// ПЕРЕКЛЮЧЕНИЕ РАЗДЕЛОВ МЕНЮ
// ============================================

function showSection(sectionId) {
    // Скрываем все секции
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
        // Если уходим из сценария - сбрасываем его
        if (section.id === 'activeScenario') {
            section.style.display = 'none';
        }
    });

    // Скрываем модальные окна
    const modal = document.getElementById('imageModal');
    if (modal) modal.classList.remove('active');

    // Показываем нужную секцию
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.add('active');
    }

    // Обновляем кнопки навигации
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.section === sectionId) {
            btn.classList.add('active');
        }
    });

    // ============================================
    // СПЕЦИАЛЬНАЯ ЛОГИКА ДЛЯ РАЗДЕЛОВ
    // ============================================
    
    // Меню - сбрасываем состояние кейсов
    if (sectionId === 'menu') {
        const scenarioList = document.getElementById('scenarioList');
        const activeScenario = document.getElementById('activeScenario');
        const scenarioResult = document.getElementById('scenarioResult');
        
        if (scenarioList) scenarioList.style.display = 'block';
        if (activeScenario) activeScenario.style.display = 'none';
        if (scenarioResult) scenarioResult.style.display = 'none';
    }
    
    // Прогресс - рендерим матрицу компетенций
    if (sectionId === 'progress') {
        renderProgressSection();
    }
}

// ============================================
// РЕНДЕР СЕКЦИИ ПРОГРЕССА
// ============================================

function renderProgressSection() {
    const matrixContainer = document.getElementById('competency-matrix-container');
    
    if (matrixContainer && typeof ProgressMatrix !== 'undefined') {
        // Проверяем есть ли реальные данные
        const hasRealData = checkForRealProgressData();
        
        if (hasRealData) {
            // Рендер с реальными данными
            ProgressMatrix.render(matrixContainer);
        } else {
            // Рендер с демо-данными для демонстрации
            ProgressMatrix.renderDemo(matrixContainer);
        }
    }
    
    // Обновляем остальную статистику
    updateProgressStats();
}

/**
 * Проверка наличия реальных данных прогресса
 */
function checkForRealProgressData() {
    // Проверяем progressMatrix в localStorage (новый формат)
    const matrixStr = localStorage.getItem('progressMatrix');
    if (matrixStr) {
        try {
            const matrix = JSON.parse(matrixStr);
            const hasData = Object.values(matrix).some(
                data => data && (data.diagnostic !== null || data.final !== null)
            );
            if (hasData) {
                console.log('✅ Найдены реальные данные в progressMatrix');
                return true;
            }
        } catch (e) {
            console.error('Ошибка чтения progressMatrix:', e);
        }
    }
    
    // Проверяем CadetProgress
    if (typeof CadetProgress !== 'undefined') {
        const profile = CadetProgress.getProfile();
        if (profile && profile.progressMatrix) {
            const hasData = Object.values(profile.progressMatrix).some(
                data => data && (data.diagnostic !== null || data.final !== null)
            );
            if (hasData) return true;
        }
    }
    
    console.log('ℹ️ Реальных данных нет, используем демо');
    return false;
}

/**
 * Обновление статистики прогресса
 */
function updateProgressStats() {
    // Получаем историю тестов
    const testHistory = JSON.parse(localStorage.getItem('testResults') || '[]');
    
    // Статистика тестов
    const testsComplete = document.getElementById('testsComplete');
    const avgScore = document.getElementById('avgScore');
    const bestScore = document.getElementById('bestScore');
    
    if (testHistory.length > 0) {
        // Пройдено тестов
        if (testsComplete) {
            testsComplete.textContent = `${testHistory.length}`;
        }
        
        // Средний балл
        if (avgScore) {
            const avg = testHistory.reduce((sum, t) => sum + t.score, 0) / testHistory.length;
            avgScore.textContent = `${Math.round(avg)}%`;
        }
        
        // Лучший балл
        if (bestScore) {
            const best = Math.max(...testHistory.map(t => t.score));
            bestScore.textContent = `${best}%`;
        }
    }
    
    // Дней в строю
    const studyDays = document.getElementById('studyDays');
    if (studyDays) {
        const firstVisit = localStorage.getItem('firstVisitDate');
        if (firstVisit) {
            const days = Math.floor((Date.now() - parseInt(firstVisit)) / (1000 * 60 * 60 * 24)) + 1;
            studyDays.textContent = days;
        } else {
            localStorage.setItem('firstVisitDate', Date.now().toString());
            studyDays.textContent = '1';
        }
    }
    
    // Достижения
    renderAchievements(testHistory);
}

/**
 * Рендер достижений
 */
function renderAchievements(testHistory) {
    const achievementsContainer = document.getElementById('achievements');
    if (!achievementsContainer) return;
    
    const achievements = [];
    
    // Первый тест
    if (testHistory.length >= 1) {
        achievements.push({ icon: '🎯', name: 'Первый шаг', desc: 'Пройден первый тест' });
    }
    
    // 5 тестов
    if (testHistory.length >= 5) {
        achievements.push({ icon: '📚', name: 'Прилежный ученик', desc: 'Пройдено 5 тестов' });
    }
    
    // 10 тестов
    if (testHistory.length >= 10) {
        achievements.push({ icon: '🏅', name: 'Опытный', desc: 'Пройдено 10 тестов' });
    }
    
    // Отличник (балл >= 90%)
    if (testHistory.some(t => t.score >= 90)) {
        achievements.push({ icon: '⭐', name: 'Отличник', desc: 'Получено 90%+ за тест' });
    }
    
    // Перфекционист (100%)
    if (testHistory.some(t => t.score === 100)) {
        achievements.push({ icon: '💯', name: 'Перфекционист', desc: '100% за тест' });
    }
    
    // Кейсы пройдены
    const caseResults = JSON.parse(localStorage.getItem('caseResults') || '[]');
    if (caseResults.some(c => c.success)) {
        achievements.push({ icon: '🎮', name: 'Спасатель', desc: 'Успешно пройден кейс' });
    }
    
    if (achievements.length === 0) {
        achievementsContainer.innerHTML = `
            <div style="text-align: center; color: #888; padding: 20px;">
                <div style="font-size: 32px; margin-bottom: 10px;">🎯</div>
                <p>Проходите тесты и кейсы для получения достижений!</p>
            </div>
        `;
        return;
    }
    
    achievementsContainer.innerHTML = achievements.map(a => `
        <div class="achievement-badge" title="${a.desc}">
            <span class="achievement-icon">${a.icon}</span>
            <span class="achievement-name">${a.name}</span>
        </div>
    `).join('');
}

// ============================================
// МОДАЛЬНОЕ ОКНО ДЛЯ ИЗОБРАЖЕНИЙ
// ============================================

function openImageModal(imageUrl) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    
    if (modal && modalImg) {
        modalImg.src = imageUrl;
        modal.style.display = 'flex';
        modal.classList.add('active');
        document.body.classList.add('modal-open');
    }
}

function closeModal() {
    const modal = document.getElementById('imageModal');
    
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
        
        // Очищаем src чтобы не грузилось в фоне
        const modalImg = document.getElementById('modalImage');
        if (modalImg) modalImg.src = '';
    }
}

// Закрытие по клику на фон
document.addEventListener('click', function(e) {
    if (e.target.id === 'imageModal' || e.target.classList.contains('modal')) {
        closeModal();
    }
});

// Закрытие по Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Зум изображений в тестах
function zoomImage() {
    const img = document.getElementById('questionImage');
    if (img && img.src) {
        openImageModal(img.src);
    }
}

// ============================================
// УТИЛИТЫ ДЛЯ GOOGLE DRIVE
// ============================================

// ============================================
// ГЛОБАЛЬНЫЕ УТИЛИТЫ (app.js)
// ============================================

/**
 * Превращает любую ссылку Google Drive в прямую ссылку для картинки
 * Использует домен lh3.googleusercontent.com для обхода защиты от хотлинкинга
 */
function convertGoogleDriveUrl(url) {
    // 1. Защита от пустых значений
    if (!url || typeof url !== 'string') return '';

    // 2. Если это заглушка - возвращаем как есть
    if (url.includes('placehold.co')) return url;

    // 3. Если это уже "волшебная" ссылка lh3 - возвращаем
    if (url.includes('lh3.googleusercontent.com')) return url;

    // 4. Ищем ID файла
    const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || 
                    url.match(/id=([a-zA-Z0-9_-]+)/) ||
                    url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                    url.match(/id=([a-zA-Z0-9_-]+)/); // Повтор для надежности

    if (idMatch && idMatch[1]) {
        // !!! ВОТ ГЛАВНОЕ ИЗМЕНЕНИЕ !!!
        // Вместо drive.google.com используем lh3.googleusercontent.com/d/
        return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
    }

    return url;
}

// ============================================
// ГЛОБАЛЬНАЯ ФУНКЦИЯ ОБНОВЛЕНИЯ ПРОГРЕССА
// ============================================

function updateProgress() {
    // Вызывается из test-module.js после завершения теста
    // Обновляем статистику если мы на экране прогресса
    const progressSection = document.getElementById('progress');
    if (progressSection && progressSection.classList.contains('active')) {
        renderProgressSection();
    }
}
