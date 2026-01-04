// ============================================
// КОНФИГУРАЦИЯ КОМПЕТЕНЦИЙ v2.0
// Расширенная система для Рабочей тетради
// ============================================

const COMPETENCIES_CONFIG = {
    
    // ========== БЛОК: ШОКИ (5 типов) ==========
    HEMORRHAGIC_SHOCK: {
        id: 'HEMORRHAGIC_SHOCK',
        name: 'Геморрагический шок',
        shortName: 'Гемор. шок',
        icon: '🩸',
        color: '#dc3545',
        block: 'SHOCK',
        description: 'Шок вследствие кровопотери'
    },
    ANAPHYLACTIC_SHOCK: {
        id: 'ANAPHYLACTIC_SHOCK',
        name: 'Анафилактический шок',
        shortName: 'Анафилакс.',
        icon: '⚡',
        color: '#ff6b6b',
        block: 'SHOCK',
        description: 'Острая аллергическая реакция'
    },
    CARDIOGENIC_SHOCK: {
        id: 'CARDIOGENIC_SHOCK',
        name: 'Кардиогенный шок',
        shortName: 'Кардиоген.',
        icon: '💔',
        color: '#e74c3c',
        block: 'SHOCK',
        description: 'Шок вследствие сердечной недостаточности'
    },
    OBSTRUCTIVE_SHOCK: {
        id: 'OBSTRUCTIVE_SHOCK',
        name: 'Обструктивный шок',
        shortName: 'Обструктив.',
        icon: '🫁',
        color: '#c0392b',
        block: 'SHOCK',
        description: 'Шок вследствие механической обструкции'
    },
    SEPTIC_SHOCK: {
        id: 'SEPTIC_SHOCK',
        name: 'Септический шок',
        shortName: 'Сепсис',
        icon: '🦠',
        color: '#9b59b6',
        block: 'SHOCK',
        description: 'Шок вследствие инфекции'
    },
    
    // ========== БЛОК: ФАРМАКОЛОГИЯ ==========
    ANTIBIOTICS: {
        id: 'ANTIBIOTICS',
        name: 'Антибактериальная терапия',
        shortName: 'Антибиотики',
        icon: '💊',
        color: '#3498db',
        block: 'PHARMACOLOGY',
        description: 'Выбор и применение антибиотиков'
    },
    ANTIHISTAMINES: {
        id: 'ANTIHISTAMINES',
        name: 'Антигистаминные препараты',
        shortName: 'Антигистам.',
        icon: '🛡️',
        color: '#9b59b6',
        block: 'PHARMACOLOGY',
        description: 'Противоаллергические препараты'
    },
    NSAID: {
        id: 'NSAID',
        name: 'НПВС',
        shortName: 'НПВС',
        icon: '💉',
        color: '#e67e22',
        block: 'PHARMACOLOGY',
        description: 'Нестероидные противовоспалительные'
    },
    GLUCOCORTICOIDS: {
        id: 'GLUCOCORTICOIDS',
        name: 'Глюкокортикостероиды',
        shortName: 'ГКС',
        icon: '💎',
        color: '#1abc9c',
        block: 'PHARMACOLOGY',
        description: 'Гормональные противовоспалительные'
    },
    ANTIDOTES: {
        id: 'ANTIDOTES',
        name: 'Антидоты',
        shortName: 'Антидоты',
        icon: '🧪',
        color: '#2ecc71',
        block: 'PHARMACOLOGY',
        description: 'Специфическая терапия отравлений'
    },
    ANALGESIA: {
        id: 'ANALGESIA',
        name: 'Анальгезия',
        shortName: 'Анальгезия',
        icon: '💊',
        color: '#6f42c1',
        block: 'PHARMACOLOGY',
        description: 'Управление болью'
    },
    INFUSION_THERAPY: {
        id: 'INFUSION_THERAPY',
        name: 'Инфузионная терапия',
        shortName: 'Инфузия',
        icon: '💧',
        color: '#00bcd4',
        block: 'PHARMACOLOGY',
        description: 'Управление объёмом жидкости'
    },
    ADRENALINE: {
        id: 'ADRENALINE',
        name: 'Адреналин',
        shortName: 'Адреналин',
        icon: '⚡',
        color: '#ff5722',
        block: 'PHARMACOLOGY',
        description: 'Препарат №1 в экстренной медицине'
    },
    SPASMOLYTICS: {
        id: 'SPASMOLYTICS',
        name: 'Спазмолитики',
        shortName: 'Спазмолит.',
        icon: '🔄',
        color: '#795548',
        block: 'PHARMACOLOGY',
        description: 'Острый живот и колики'
    },
    
    // ========== БЛОК: ИНФЕКЦИИ ==========
    VIRAL_INFECTIONS: {
        id: 'VIRAL_INFECTIONS',
        name: 'Вирусные инфекции (ОРВИ)',
        shortName: 'ОРВИ',
        icon: '🤧',
        color: '#ff9800',
        block: 'INFECTIONS',
        description: 'Диагностика и терапия ОРВИ'
    },
    EYE_EAR_INFECTIONS: {
        id: 'EYE_EAR_INFECTIONS',
        name: 'Глазные и ушные инфекции',
        shortName: 'Глаза/Уши',
        icon: '👁️',
        color: '#00bcd4',
        block: 'INFECTIONS',
        description: 'Протоколы лечения'
    },
    TICK_INFECTIONS: {
        id: 'TICK_INFECTIONS',
        name: 'Клещевые инфекции',
        shortName: 'Клещи',
        icon: '🕷️',
        color: '#4caf50',
        block: 'INFECTIONS',
        description: 'Профилактика и лечение'
    },
    RABIES: {
        id: 'RABIES',
        name: 'Бешенство',
        shortName: 'Бешенство',
        icon: '🐕',
        color: '#f44336',
        block: 'INFECTIONS',
        description: 'Постэкспозиционная профилактика'
    },
    
    // ========== БЛОК: ТРАВМА ==========
    HEMOSTASIS: {
        id: 'HEMOSTASIS',
        name: 'Остановка кровотечений',
        shortName: 'Гемостаз',
        icon: '🩸',
        color: '#dc3545',
        block: 'TRAUMA',
        description: 'Турникеты, гемостатики, тампонада'
    },
    WOUND_CARE: {
        id: 'WOUND_CARE',
        name: 'Обработка ран',
        shortName: 'Раны',
        icon: '🩹',
        color: '#20c997',
        block: 'TRAUMA',
        description: 'Огнестрельные раны, ожоги'
    },
    BURNS: {
        id: 'BURNS',
        name: 'Ожоги',
        shortName: 'Ожоги',
        icon: '🔥',
        color: '#ff5722',
        block: 'TRAUMA',
        description: 'Расчёт инфузии, местное лечение'
    },
    GUNSHOT_WOUNDS: {
        id: 'GUNSHOT_WOUNDS',
        name: 'Огнестрельные раны',
        shortName: 'Огнестрел.',
        icon: '🔫',
        color: '#607d8b',
        block: 'TRAUMA',
        description: 'Особенности фармакотерапии'
    },
    
    // ========== БЛОК: НЕОТЛОЖНЫЕ СОСТОЯНИЯ ==========
    CARDIAC_STROKE: {
        id: 'CARDIAC_STROKE',
        name: 'Инфаркт и инсульт',
        shortName: 'ИМ/Инсульт',
        icon: '❤️‍🩹',
        color: '#e91e63',
        block: 'EMERGENCY',
        description: 'FAST и первая помощь'
    },
    DETOX: {
        id: 'DETOX',
        name: 'Детоксикация',
        shortName: 'Детокс',
        icon: '🧹',
        color: '#8bc34a',
        block: 'EMERGENCY',
        description: 'Методы и препараты'
    },
    EVACUATION: {
        id: 'EVACUATION',
        name: 'Эвакуация',
        shortName: 'Эвакуация',
        icon: '🚑',
        color: '#6c757d',
        block: 'EMERGENCY',
        description: 'Транспортировка пострадавших'
    },
    
    // ========== БЛОК: ОСНОВЫ ==========
    PHARMACOLOGY_BASICS: {
        id: 'PHARMACOLOGY_BASICS',
        name: 'Фармакологические основы',
        shortName: 'Основы',
        icon: '📚',
        color: '#607d8b',
        block: 'BASICS',
        description: 'ADME, дозировки, базовые понятия'
    }
};

// Группировка по блокам для UI
const COMPETENCY_BLOCKS = {
    SHOCK: {
        name: 'Шоковые состояния',
        icon: '⚡',
        color: '#dc3545',
        competencies: ['HEMORRHAGIC_SHOCK', 'ANAPHYLACTIC_SHOCK', 'CARDIOGENIC_SHOCK', 'OBSTRUCTIVE_SHOCK', 'SEPTIC_SHOCK']
    },
    PHARMACOLOGY: {
        name: 'Фармакология',
        icon: '💊',
        color: '#3498db',
        competencies: ['ANTIBIOTICS', 'ANTIHISTAMINES', 'NSAID', 'GLUCOCORTICOIDS', 'ANTIDOTES', 'ANALGESIA', 'INFUSION_THERAPY', 'ADRENALINE', 'SPASMOLYTICS']
    },
    INFECTIONS: {
        name: 'Инфекции',
        icon: '🦠',
        color: '#4caf50',
        competencies: ['VIRAL_INFECTIONS', 'EYE_EAR_INFECTIONS', 'TICK_INFECTIONS', 'RABIES']
    },
    TRAUMA: {
        name: 'Травма',
        icon: '🩹',
        color: '#ff5722',
        competencies: ['HEMOSTASIS', 'WOUND_CARE', 'BURNS', 'GUNSHOT_WOUNDS']
    },
    EMERGENCY: {
        name: 'Неотложные состояния',
        icon: '🚨',
        color: '#e91e63',
        competencies: ['CARDIAC_STROKE', 'DETOX', 'EVACUATION']
    },
    BASICS: {
        name: 'Основы',
        icon: '📚',
        color: '#607d8b',
        competencies: ['PHARMACOLOGY_BASICS']
    }
};

// Маппинг модулей на компетенции (обновлённый)
const MODULE_TO_COMPETENCY = {
    1: 'PHARMACOLOGY_BASICS',
    2: 'ANTIBIOTICS',
    3: 'ANTIHISTAMINES',          // Было SHOCK
    4: 'EYE_EAR_INFECTIONS',      // Было WOUND_CARE
    5: 'VIRAL_INFECTIONS',        // Было ANTIBIOTICS
    6: 'NSAID',                   // Было ANALGESIA
    7: 'GLUCOCORTICOIDS',         // Было SHOCK
    9: 'ADRENALINE',              // Было SHOCK
    10: 'SPASMOLYTICS',           // Было ANALGESIA
    11: 'HEMORRHAGIC_SHOCK',      // Конкретный тип шока
    12: 'INFUSION_THERAPY',       // Было SHOCK
    13: 'ANTIDOTES',              // Было SHOCK
    14: 'SEPTIC_SHOCK',           // Конкретный тип шока
    15: 'TICK_INFECTIONS',        // Было ANTIBIOTICS
    16: 'RABIES',                 // Было ANTIBIOTICS
    17: 'CARDIAC_STROKE',         // Было EVACUATION
    18: 'DETOX',                  // Было SHOCK
    19: 'GUNSHOT_WOUNDS',         // Было HEMOSTASIS
    20: 'BURNS',                  // Было WOUND_CARE
    21: 'ANALGESIA'
};

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { COMPETENCIES_CONFIG, COMPETENCY_BLOCKS, MODULE_TO_COMPETENCY };
}
if (typeof window !== 'undefined') {
    window.COMPETENCIES_CONFIG = COMPETENCIES_CONFIG;
    window.COMPETENCY_BLOCKS = COMPETENCY_BLOCKS;
    window.MODULE_TO_COMPETENCY = MODULE_TO_COMPETENCY;
}
