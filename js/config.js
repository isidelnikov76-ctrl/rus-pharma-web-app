// ============================================
// КОНФИГУРАЦИЯ ПРИЛОЖЕНИЯ
// ============================================

const CONFIG = {
    // URL API Google Sheets (замените на ваш после публикации скрипта)
    API_URL: 'https://script.google.com/macros/s/AKfycbxHZ_C_RpyxFnLxqJYyiMnzgPhrmdz3GXSRv1VRUodhYEfaEMWVU1Fmi_r4AvzCjLn2/exec',
    
    // Интервал автообновления (мс)
    SYNC_INTERVAL: 300000, // 5 минут
    
    // Локальное кэширование
    CACHE_KEY: 'pharmacology_data',
    CACHE_EXPIRY: 3600000, // 1 час
    
    // Настройки игры
    INITIAL_PATIENT_HEALTH: 100,
    CRITICAL_HEALTH: 30,
    
    // Версия приложения
    VERSION: '2.0.0'
};