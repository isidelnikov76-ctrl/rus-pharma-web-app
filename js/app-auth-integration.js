// ============================================
// ИНТЕГРАЦИЯ АВТОРИЗАЦИИ С ПРИЛОЖЕНИЕМ
// app-auth-integration.js
// 
// Добавьте этот файл в проект и подключите
// после всех модулей авторизации
// ============================================

(function() {
    'use strict';

    // ========================================
    // КОНФИГУРАЦИЯ
    // ========================================
    
    const CONFIG = {
        // URL вашего Apps Script Web App
        API_URL: 'https://script.google.com/macros/s/AKfycbwB0oYN70vH9sMnQItBL1rSVuVxF2t90Fx5A_9wWZjR3lrfSNPcmDVZuqOC7mfsO87x/exec',
        
        // Показывать ли авторизацию при старте
        REQUIRE_AUTH: true,
        
        // Автоматическая синхронизация
        AUTO_SYNC: true
    };

    // ========================================
    // ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ
    // ========================================

    document.addEventListener('DOMContentLoaded', async function() {
        console.log('🚀 Инициализация приложения с авторизацией...');
        
        // Устанавливаем URL API
        if (typeof AuthModule !== 'undefined') {
            AuthModule.setApiUrl(CONFIG.API_URL);
        }
        
        // Проверяем, требуется ли авторизация
        if (!CONFIG.REQUIRE_AUTH) {
            console.log('⚠️ Авторизация отключена в конфигурации');
            initApp(null);
            return;
        }
        
        // Скрываем основной контент до авторизации
        const mainContent = document.querySelector('.container') || document.querySelector('main');
        if (mainContent) {
            mainContent.style.display = 'none';
        }
        
        // Колбэк успешной авторизации
        window.onAuthSuccess = function(cadet) {
            console.log('✅ Авторизация успешна:', cadet.fullName);
            
            // Показываем основной контент
            if (mainContent) {
                mainContent.style.display = '';
            }
            
            // Обновляем UI с данными курсанта
            updateUIWithCadetData(cadet);
            
            // Инициализируем синхронизацию
            if (CONFIG.AUTO_SYNC && typeof SyncModule !== 'undefined') {
                initSyncModule(cadet);
            }
            
            // Инициализируем основное приложение
            initApp(cadet);
        };
        
        // Инициализируем модуль авторизации
        const authResult = await AuthModule.init({
            onLogin: (cadet, isOffline) => {
                console.log(`👤 Вход: ${cadet.fullName} ${isOffline ? '(офлайн)' : ''}`);
            },
            onLogout: () => {
                console.log('👋 Выход');
                // Показываем экран авторизации
                AuthUI.show();
            },
            onError: (error) => {
                console.error('❌ Ошибка авторизации:', error);
            }
        });
        
        if (authResult.success) {
            // Автоматический вход успешен
            window.onAuthSuccess(authResult.cadet);
        } else {
            // Показываем экран авторизации
            console.log('🔐 Требуется авторизация');
            AuthUI.show();
        }
    });

    // ========================================
    // ОБНОВЛЕНИЕ UI
    // ========================================

    function updateUIWithCadetData(cadet) {
        // Обновляем имя пользователя в header
        const userNameEl = document.getElementById('userName');
        if (userNameEl) {
            userNameEl.textContent = formatName(cadet.fullName);
        }
        
        // Обновляем подсказку
        const userNameFull = document.getElementById('userNameFull');
        if (userNameFull) {
            userNameFull.textContent = cadet.fullName;
            userNameFull.title = `${cadet.groupName} (${cadet.groupCode})`;
        }
        
        // Добавляем информацию о группе
        const headerInfo = document.querySelector('.user-info');
        if (headerInfo && !document.getElementById('group-badge')) {
            const groupBadge = document.createElement('span');
            groupBadge.id = 'group-badge';
            groupBadge.style.cssText = 'font-size: 10px; opacity: 0.8; margin-left: 4px;';
            groupBadge.textContent = `[${cadet.groupCode}]`;
            groupBadge.title = cadet.groupName;
            headerInfo.appendChild(groupBadge);
        }
        
        // Добавляем кнопку выхода если её нет
        addLogoutButton();
    }

    /**
     * Форматирование имени (Иванов И.И.)
     */
    function formatName(fullName) {
        if (!fullName) return 'Курсант';
        
        const parts = fullName.trim().split(/\s+/);
        if (parts.length === 1) return parts[0];
        
        // Фамилия + инициалы
        const surname = parts[0];
        const initials = parts.slice(1).map(p => p[0] + '.').join('');
        
        return `${surname} ${initials}`;
    }

    /**
     * Добавление кнопки выхода
     */
    function addLogoutButton() {
        if (document.getElementById('logout-button')) return;
        
        const headerInfo = document.querySelector('.user-info');
        if (!headerInfo) return;
        
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'logout-button';
        logoutBtn.innerHTML = '🚪';
        logoutBtn.title = 'Выйти из аккаунта';
        logoutBtn.style.cssText = `
            background: transparent;
            border: none;
            font-size: 16px;
            cursor: pointer;
            padding: 4px 8px;
            margin-left: 8px;
            opacity: 0.7;
            transition: opacity 0.2s;
        `;
        
        logoutBtn.addEventListener('mouseenter', () => logoutBtn.style.opacity = '1');
        logoutBtn.addEventListener('mouseleave', () => logoutBtn.style.opacity = '0.7');
        
        logoutBtn.addEventListener('click', () => {
            if (confirm('Выйти из аккаунта?')) {
                AuthModule.logout(false); // false = сохранить ID для быстрого входа
            }
        });
        
        headerInfo.appendChild(logoutBtn);
    }

    // ========================================
    // ИНИЦИАЛИЗАЦИЯ СИНХРОНИЗАЦИИ
    // ========================================

    function initSyncModule(cadet) {
        if (typeof SyncModule === 'undefined') {
            console.warn('⚠️ SyncModule не найден');
            return;
        }
        
        SyncModule.init({
            onSyncStart: () => {
                updateSyncStatus('syncing');
            },
            onSyncComplete: (result) => {
                updateSyncStatus('synced');
                console.log(`✅ Синхронизация: отправлено ${result.sent}, получено ${result.received}`);
            },
            onSyncError: (error) => {
                updateSyncStatus('error');
                console.error('❌ Ошибка синхронизации:', error);
            },
            onDataReceived: (data) => {
                // Обновляем UI после получения данных с сервера
                if (typeof updateProgress === 'function') {
                    updateProgress();
                }
                if (typeof ProgressMatrix !== 'undefined') {
                    const container = document.getElementById('competency-matrix-container');
                    if (container) ProgressMatrix.render(container);
                }
            }
        });
        
        // Начальная синхронизация
        setTimeout(() => {
            SyncModule.syncNow().catch(console.error);
        }, 2000);
    }

    /**
     * Обновление статуса синхронизации в UI
     */
    function updateSyncStatus(status) {
        const syncStatusEl = document.querySelector('.sync-status');
        if (!syncStatusEl) return;
        
        switch (status) {
            case 'syncing':
                syncStatusEl.innerHTML = '🔄';
                syncStatusEl.title = 'Синхронизация...';
                syncStatusEl.classList.add('syncing');
                break;
            case 'synced':
                syncStatusEl.innerHTML = '✓';
                syncStatusEl.title = 'Синхронизировано';
                syncStatusEl.classList.remove('syncing');
                syncStatusEl.classList.add('synced');
                break;
            case 'error':
                syncStatusEl.innerHTML = '⚠️';
                syncStatusEl.title = 'Ошибка синхронизации';
                syncStatusEl.classList.remove('syncing', 'synced');
                break;
        }
    }

    // ========================================
    // ИНТЕГРАЦИЯ С СОХРАНЕНИЕМ РЕЗУЛЬТАТОВ
    // ========================================

    // Переопределяем функции сохранения результатов для синхронизации
    
    // Оригинальные функции сохраняем
    const originalSaveTestResult = window.saveTestResult;
    const originalSaveCardResult = window.saveCardResult;

    /**
     * Обёртка для сохранения результата теста
     */
    window.saveTestResultWithSync = function(testType, competencyId, score, details) {
        // Сохраняем локально (оригинальная логика)
        if (originalSaveTestResult) {
            originalSaveTestResult(testType, competencyId, score, details);
        }
        
        // Добавляем в очередь синхронизации
        if (typeof SyncModule !== 'undefined' && AuthModule.isLoggedIn()) {
            SyncModule.saveTestResult(testType, competencyId, score, details);
        }
    };

    /**
     * Обёртка для сохранения результата карточки
     */
    window.saveCardResultWithSync = function(drugId, status) {
        // Сохраняем локально (оригинальная логика)
        if (originalSaveCardResult) {
            originalSaveCardResult(drugId, status);
        }
        
        // Добавляем в очередь синхронизации
        if (typeof SyncModule !== 'undefined' && AuthModule.isLoggedIn()) {
            SyncModule.saveCardResult(drugId, status);
        }
    };

    // ========================================
    // ИНИЦИАЛИЗАЦИЯ ОСНОВНОГО ПРИЛОЖЕНИЯ
    // ========================================

    function initApp(cadet) {
        console.log('📱 Инициализация основного приложения');
        
        // Здесь можно добавить дополнительную логику инициализации
        // которая зависит от авторизации
        
        // Обновляем прогресс если функция есть
        if (typeof updateProgress === 'function') {
            updateProgress();
        }
        
        // Обновляем время последнего обновления
        const lastUpdateEl = document.getElementById('lastUpdate');
        if (lastUpdateEl) {
            const now = new Date();
            lastUpdateEl.textContent = now.toLocaleString('ru-RU');
        }
    }

    // ========================================
    // ЭКСПОРТ ДЛЯ ОТЛАДКИ
    // ========================================

    window.AppAuth = {
        CONFIG,
        showAuthUI: () => AuthUI.show(),
        logout: () => AuthModule.logout(true),
        syncNow: () => SyncModule?.syncNow(),
        getStatus: () => ({
            isLoggedIn: AuthModule?.isLoggedIn(),
            cadet: AuthModule?.getCurrentCadet(),
            isOffline: AuthModule?.isOfflineMode(),
            sync: SyncModule?.getStatus()
        })
    };

})();
