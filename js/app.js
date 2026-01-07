// ============================================
// APP.JS (ВЕРСИЯ С РАБОЧИМИ КАРТИНКАМИ)
// ============================================

window.appData = {};
window.currentUser = null;

// Глобальная функция для кнопки "Обновить"
window.syncData = function() {
    console.log("🔄 Обновление...");
    const btn = document.querySelector('.update-btn'); // Если есть класс
    if (btn) btn.innerText = "⏳...";
    localStorage.removeItem('appData_cache');
    location.reload();
};

document.addEventListener('DOMContentLoaded', () => {
    // Восстанавливаем пользователя
    const savedUser = localStorage.getItem('activeUser');
    if (savedUser) {
        try { window.currentUser = JSON.parse(savedUser); } catch (e) {}
    }
    
    initApp();
});

function initApp() {
    console.log("🚀 [App] Старт...");
    
    if (typeof loadData !== 'function') {
        alert("Ошибка: data-loader.js не найден!");
        return;
    }
    
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'flex';

    loadData().then(data => {
        window.appData = data;
        console.log("✅ [App] Данные загружены:", Object.keys(data));
        
        if (loading) loading.style.display = 'none';

        // Запуск модулей
        if (typeof initTestModule === 'function') initTestModule();
        if (typeof initCardsModule === 'function') initCardsModule();
        if (typeof initCasesModule === 'function') initCasesModule();
        
        updateUserHeader();

    }).catch(console.error);

    // Навигация
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.onclick = () => showSection(btn.dataset.section);
    });
}

function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    const t = document.getElementById(id);
    if (t) t.classList.add('active');
    
    const b = document.querySelector(`button[data-section="${id}"]`);
    if (b) b.classList.add('active');
}

function updateUserHeader() {
    if (window.currentUser) {
        const el = document.getElementById('userName'); // Убедись, что такой ID есть в HTML
        if (el) el.innerText = window.currentUser.displayName || window.currentUser.id;
    }
}

/**
 * ГЛАВНОЕ ИСПРАВЛЕНИЕ: Конвертер ссылок
 * Превращает ссылку "view?usp=sharing" в ссылку "thumbnail", которую Google разрешает показывать.
 */
function convertGoogleDriveUrl(url) {
    if (!url || typeof url !== 'string') return '';
    
    // Если это заглушка
    if (url.includes('placehold.co')) return url;

    // Ищем ID файла (набор букв и цифр)
    // Поддерживает форматы: /d/ID, id=ID, file/d/ID
    const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || 
                    url.match(/id=([a-zA-Z0-9_-]+)/) ||
                    url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);

    if (idMatch && idMatch[1]) {
        // МЕТОД THUMBNAIL (Самый надежный в 2025 году)
        // sz=w1000 означает "ширина 1000px" (хорошее качество)
        return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1000`;
    }

    return url;
}
