// ============================================
// APP.JS - Главный файл приложения
// Версия 2.1 - С матрицей прогресса
// ============================================
// ============================================
// APP.JS (FIXED SYNC & INIT)
// ============================================

// 1. Глобальные переменные (доступны везде)
window.appData = {};
window.currentUser = null;

// 2. Функция обновления (ОБЪЯВЛЕНА ГЛОБАЛЬНО)
window.syncData = function() {
    console.log("🔄 Принудительное обновление...");
    const btn = document.querySelector('.update-btn');
    if (btn) btn.innerText = "⏳...";
    localStorage.removeItem('appData_cache'); // Если был кэш
    location.reload();
};

document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 [App] DOM загружен.");
    
    // Восстановление пользователя
    const savedUser = localStorage.getItem('activeUser');
    if (savedUser) {
        try { window.currentUser = JSON.parse(savedUser); } 
        catch (e) { console.error("Ошибка чтения юзера", e); }
    }
    
    // Запуск приложения
    initApp();
});

function initApp() {
    // Проверка наличия загрузчика
    if (typeof loadData !== 'function') {
        alert("Ошибка: Файл data-loader.js не подключен!");
        return;
    }
    
    // Показываем загрузку
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'flex';

    // ЗАГРУЗКА ДАННЫХ
    loadData().then(data => {
        // 1. Сохраняем данные
        window.appData = data;
        console.log("✅ [App] Данные сохранены глобально:", Object.keys(window.appData));
        
        // 2. Скрываем экран загрузки
        if (loading) loading.style.display = 'none';

        // 3. Запускаем модули (ТОЛЬКО СЕЙЧАС)
        safeInit('initTestModule');
        safeInit('initCardsModule');
        safeInit('initCasesModule');
        
        // 4. Обновляем интерфейс пользователя
        updateUserHeader();

    }).catch(error => {
        console.error("🔥 [App] Критическая ошибка:", error);
        if (loading) loading.innerHTML = '<p style="color:white">Ошибка загрузки. Проверьте интернет.</p><button onclick="location.reload()">Повторить</button>';
    });

    // Навигация
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.onclick = () => showSection(btn.dataset.section);
    });
}

// Безопасный запуск модулей
function safeInit(functionName) {
    if (typeof window[functionName] === 'function') {
        try {
            console.log(`▶️ Запуск ${functionName}...`);
            window[functionName]();
        } catch (e) {
            console.error(`❌ Ошибка в ${functionName}:`, e);
        }
    } else {
        console.warn(`⚠️ Функция ${functionName} не найдена`);
    }
}

function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
    
    const btn = document.querySelector(`button[data-section="${id}"]`);
    if (btn) btn.classList.add('active');
}

function updateUserHeader() {
    const el = document.querySelector('.user-info');
    if (el && window.currentUser) {
        // Простая метка пользователя
        const nameSpan = document.getElementById('userName');
        if(nameSpan) nameSpan.innerText = window.currentUser.displayName || window.currentUser.id;
    }
}

// Хак для картинок (оставляем, он рабочий)
function convertGoogleDriveUrl(url) {
    if (!url || typeof url !== 'string') return '';
    if (url.includes('googleusercontent.com')) return url;
    const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) return `https://googleusercontent.com/profile/picture/0${idMatch[1]}`;
    return url;
}
