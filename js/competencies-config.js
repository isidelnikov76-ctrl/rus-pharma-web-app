/**
 * ═══════════════════════════════════════════════════════════════════════════
 * КОНФИГУРАЦИЯ КОМПЕТЕНЦИЙ И ТИПОВ ТЕСТОВ
 * Курс: "Фармакология и обработка ран в боевых условиях"
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// КОМПЕТЕНЦИИ КУРСА
// ============================================================================

const COMPETENCIES = {
    'HEMOSTASIS': {
        id: 'HEMOSTASIS',
        name: 'Остановка кровотечений',
        shortName: 'Гемостаз',
        icon: '🩸',
        color: '#dc3545',
        sections: [1, 2],
        description: 'Турникеты, тампонада, гемостатические средства',
        keywords: ['турникет', 'жгут', 'кровотечение', 'гемостаз', 'тампонада']
    },
    'AIRWAY': {
        id: 'AIRWAY',
        name: 'Обеспечение проходимости ДП',
        shortName: 'Дых. пути',
        icon: '💨',
        color: '#17a2b8',
        sections: [1, 3],
        description: 'Назофарингеальный воздуховод, положение тела, аспирация',
        keywords: ['воздуховод', 'дыхание', 'асфиксия', 'интубация']
    },
    'ANALGESIA': {
        id: 'ANALGESIA',
        name: 'Обезболивание',
        shortName: 'Анальгезия',
        icon: '💊',
        color: '#6f42c1',
        sections: [2, 4],
        description: 'Наркотические и ненаркотические анальгетики, дозировки',
        keywords: ['обезболивание', 'морфин', 'кетамин', 'анальгетик', 'боль']
    },
    'SHOCK': {
        id: 'SHOCK',
        name: 'Противошоковая терапия',
        shortName: 'Шок',
        icon: '⚡',
        color: '#fd7e14',
        sections: [2, 3],
        description: 'Инфузионная терапия, вазопрессоры, транексамовая кислота',
        keywords: ['шок', 'инфузия', 'адреналин', 'вазопрессор', 'гиповолемия']
    },
    'WOUND_CARE': {
        id: 'WOUND_CARE',
        name: 'Обработка ран',
        shortName: 'Раны',
        icon: '🩹',
        color: '#28a745',
        sections: [3, 4],
        description: 'Первичная обработка, дебридмент, перевязки',
        keywords: ['рана', 'перевязка', 'антисептик', 'дебридмент', 'шов']
    },
    'ANTIBIOTICS': {
        id: 'ANTIBIOTICS',
        name: 'Антибиотикотерапия',
        shortName: 'Антибиотики',
        icon: '🧬',
        color: '#20c997',
        sections: [4],
        description: 'Профилактика инфекций, выбор антибиотика, дозировки',
        keywords: ['антибиотик', 'инфекция', 'моксифлоксацин', 'сепсис']
    },
    'EVACUATION': {
        id: 'EVACUATION',
        name: 'Эвакуация пострадавших',
        shortName: 'Эвакуация',
        icon: '🚁',
        color: '#007bff',
        sections: [1, 4],
        description: 'Приоритизация, транспортировка, документирование',
        keywords: ['эвакуация', 'сортировка', 'транспортировка', 'MEDEVAC']
    },
    'HYPOTHERMIA': {
        id: 'HYPOTHERMIA',
        name: 'Профилактика гипотермии',
        shortName: 'Гипотермия',
        icon: '🌡️',
        color: '#6610f2',
        sections: [2, 3],
        description: 'Термоизоляция, согревание, "смертельная триада"',
        keywords: ['гипотермия', 'переохлаждение', 'термоодеяло', 'согревание']
    }
};

// ============================================================================
// ТИПЫ ТЕСТОВ
// ============================================================================

const TEST_TYPES = {
    'DIAGNOSTIC': {
        type: 'DIAGNOSTIC',
        name: 'Вводный тест',
        fullName: 'Диагностическое тестирование',
        icon: '🎯',
        color: '#e83e8c',
        description: 'Определение базового уровня знаний перед началом обучения',
        questionsCount: 30,
        timeLimit: 45, // минут
        passingScore: 0, // нет порога - только диагностика
        competencies: Object.keys(COMPETENCIES), // все компетенции
        canRetake: false, // нельзя пересдать
        unlockCondition: null // доступен сразу
    },
    'SECTION_1': {
        type: 'SECTION',
        sectionId: 1,
        name: 'Тест раздела 1',
        fullName: 'Неотложная помощь при травмах',
        icon: '📕',
        color: '#dc3545',
        description: 'Проверка знаний по разделу 1: MARCH-протокол, первичный осмотр',
        questionsCount: 15,
        timeLimit: 20,
        passingScore: 60,
        competencies: ['HEMOSTASIS', 'AIRWAY', 'EVACUATION'],
        canRetake: true,
        unlockCondition: 'DIAGNOSTIC'
    },
    'SECTION_2': {
        type: 'SECTION',
        sectionId: 2,
        name: 'Тест раздела 2',
        fullName: 'Фармакология полевой медицины',
        icon: '📗',
        color: '#28a745',
        description: 'Проверка знаний по разделу 2: препараты, дозировки, введение',
        questionsCount: 15,
        timeLimit: 20,
        passingScore: 60,
        competencies: ['ANALGESIA', 'SHOCK', 'HYPOTHERMIA', 'HEMOSTASIS'],
        canRetake: true,
        unlockCondition: 'SECTION_1'
    },
    'SECTION_3': {
        type: 'SECTION',
        sectionId: 3,
        name: 'Тест раздела 3',
        fullName: 'Обработка ран и дыхательных путей',
        icon: '📘',
        color: '#17a2b8',
        description: 'Проверка знаний по разделу 3: раневая хирургия, ДП',
        questionsCount: 15,
        timeLimit: 20,
        passingScore: 60,
        competencies: ['WOUND_CARE', 'AIRWAY', 'SHOCK', 'HYPOTHERMIA'],
        canRetake: true,
        unlockCondition: 'SECTION_2'
    },
    'SECTION_4': {
        type: 'SECTION',
        sectionId: 4,
        name: 'Тест раздела 4',
        fullName: 'Инфекционный контроль и эвакуация',
        icon: '📙',
        color: '#fd7e14',
        description: 'Проверка знаний по разделу 4: антибиотики, документация',
        questionsCount: 15,
        timeLimit: 20,
        passingScore: 60,
        competencies: ['ANTIBIOTICS', 'WOUND_CARE', 'ANALGESIA', 'EVACUATION'],
        canRetake: true,
        unlockCondition: 'SECTION_3'
    },
    'FINAL': {
        type: 'FINAL',
        name: 'Финальный тест',
        fullName: 'Итоговая аттестация',
        icon: '🏆',
        color: '#ffc107',
        description: 'Комплексная проверка всех компетенций курса',
        questionsCount: 50,
        timeLimit: 60,
        passingScore: 70,
        competencies: Object.keys(COMPETENCIES),
        canRetake: true,
        unlockCondition: 'SECTION_4'
    }
};

// ============================================================================
// РАЗДЕЛЫ КУРСА
// ============================================================================

const COURSE_SECTIONS = {
    1: {
        id: 1,
        name: 'Неотложная помощь при травмах',
        shortName: 'Неотложка',
        icon: '🚨',
        description: 'MARCH-протокол, первичный осмотр, приоритизация',
        competencies: ['HEMOSTASIS', 'AIRWAY', 'EVACUATION'],
        testType: 'SECTION_1'
    },
    2: {
        id: 2,
        name: 'Фармакология полевой медицины',
        shortName: 'Фармакология',
        icon: '💉',
        description: 'Препараты экстренной помощи, дозировки, пути введения',
        competencies: ['ANALGESIA', 'SHOCK', 'HYPOTHERMIA', 'HEMOSTASIS'],
        testType: 'SECTION_2'
    },
    3: {
        id: 3,
        name: 'Обработка ран и дыхательных путей',
        shortName: 'Раны и ДП',
        icon: '🩹',
        description: 'Первичная хирургическая обработка, обеспечение проходимости ДП',
        competencies: ['WOUND_CARE', 'AIRWAY', 'SHOCK', 'HYPOTHERMIA'],
        testType: 'SECTION_3'
    },
    4: {
        id: 4,
        name: 'Инфекционный контроль и эвакуация',
        shortName: 'Инфекции',
        icon: '🧬',
        description: 'Профилактика инфекций, антибиотики, документирование, эвакуация',
        competencies: ['ANTIBIOTICS', 'WOUND_CARE', 'ANALGESIA', 'EVACUATION'],
        testType: 'SECTION_4'
    }
};

// ============================================================================
// ПОРОГИ ПРОГРЕССА
// ============================================================================

const PROGRESS_THRESHOLDS = {
    SIGNIFICANT_PROGRESS: 15,   // Δ ≥ 15% = значительный прогресс
    MINIMAL_PROGRESS: 5,        // 5% ≤ Δ < 15% = минимальный прогресс
    NO_PROGRESS: 5,             // Δ < 5% = нет прогресса / регресс
    
    MASTERY_LEVEL: 85,          // ≥ 85% = мастерство
    PROFICIENT_LEVEL: 70,       // 70-84% = уверенное владение
    DEVELOPING_LEVEL: 50,       // 50-69% = развивающийся уровень
    BEGINNER_LEVEL: 50          // < 50% = начальный уровень
};

// ============================================================================
// ПРИОРИТЕТЫ РЕКОМЕНДАЦИЙ
// ============================================================================

const RECOMMENDATION_PRIORITY = {
    CRITICAL: { level: 1, name: 'Критический', icon: '🔴', color: '#dc3545' },
    HIGH: { level: 2, name: 'Высокий', icon: '🟠', color: '#fd7e14' },
    MEDIUM: { level: 3, name: 'Средний', icon: '🟡', color: '#ffc107' },
    LOW: { level: 4, name: 'Низкий', icon: '🟢', color: '#28a745' }
};

// ============================================================================
// ТИПЫ РЕКОМЕНДАЦИЙ
// ============================================================================

const RECOMMENDATION_TYPES = {
    RESTUDY: {
        type: 'RESTUDY',
        name: 'Повторное изучение',
        icon: '📖',
        actionText: 'Перейти к разделу'
    },
    PRACTICE: {
        type: 'PRACTICE',
        name: 'Практика',
        icon: '🎯',
        actionText: 'Начать упражнения'
    },
    FLASHCARDS: {
        type: 'FLASHCARDS',
        name: 'Флэш-карты',
        icon: '🎴',
        actionText: 'Открыть карточки'
    },
    CASES: {
        type: 'CASES',
        name: 'Клинические кейсы',
        icon: '🎮',
        actionText: 'Пройти кейс'
    },
    ADVANCED: {
        type: 'ADVANCED',
        name: 'Продвинутые материалы',
        icon: '🚀',
        actionText: 'Изучить'
    },
    SPACED_REPETITION: {
        type: 'SPACED_REPETITION',
        name: 'Интервальное повторение',
        icon: '🔄',
        actionText: 'Начать повторение'
    }
};

// ============================================================================
// ИНТЕРВАЛЫ ПОВТОРЕНИЯ (Spaced Repetition)
// ============================================================================

const SPACED_REPETITION_SCHEDULE = [
    { day: 1, activity: 'flashcards', name: 'Флэш-карты' },
    { day: 3, activity: 'flashcards', name: 'Флэш-карты' },
    { day: 7, activity: 'mini_test', name: 'Мини-тест' },
    { day: 14, activity: 'case', name: 'Клинический кейс' },
    { day: 30, activity: 'review_test', name: 'Ревью-тест' },
    { day: 90, activity: 'full_review', name: 'Полное повторение' }
];

// ============================================================================
// ДОСТИЖЕНИЯ
// ============================================================================

const ACHIEVEMENTS = {
    // Тестирование
    'FIRST_TEST': {
        id: 'FIRST_TEST',
        name: 'Первый шаг',
        description: 'Пройти вводный тест',
        icon: '🎯',
        condition: (profile) => profile.tests?.diagnostic != null
    },
    'ALL_SECTIONS': {
        id: 'ALL_SECTIONS',
        name: 'Путь пройден',
        description: 'Пройти все промежуточные тесты',
        icon: '📚',
        condition: (profile) => {
            const sections = profile.tests?.sections || {};
            return [1, 2, 3, 4].every(s => sections[s] != null);
        }
    },
    'FINAL_PASSED': {
        id: 'FINAL_PASSED',
        name: 'Сертифицирован',
        description: 'Успешно пройти финальный тест',
        icon: '🏆',
        condition: (profile) => {
            const final = profile.tests?.final;
            return final && final.overallScore >= 70;
        }
    },
    'PERFECT_SECTION': {
        id: 'PERFECT_SECTION',
        name: 'Отличник',
        description: 'Получить 100% за любой тест раздела',
        icon: '💯',
        condition: (profile) => {
            const sections = profile.tests?.sections || {};
            return Object.values(sections).some(s => s.overallScore === 100);
        }
    },
    
    // Прогресс
    'BIG_PROGRESS': {
        id: 'BIG_PROGRESS',
        name: 'Рывок вперёд',
        description: 'Улучшить результат на 30%+ в любой компетенции',
        icon: '📈',
        condition: (profile) => {
            const matrix = profile.progressMatrix || {};
            return Object.values(matrix).some(c => c.delta >= 30);
        }
    },
    'MASTERY': {
        id: 'MASTERY',
        name: 'Мастер',
        description: 'Достичь 90%+ в любой компетенции',
        icon: '⭐',
        condition: (profile) => {
            const matrix = profile.progressMatrix || {};
            return Object.values(matrix).some(c => (c.final || c.latest) >= 90);
        }
    },
    'ALL_MASTERY': {
        id: 'ALL_MASTERY',
        name: 'Полевой хирург',
        description: 'Достичь 85%+ во всех компетенциях',
        icon: '🎖️',
        condition: (profile) => {
            const matrix = profile.progressMatrix || {};
            const competencyIds = Object.keys(COMPETENCIES);
            return competencyIds.every(id => {
                const c = matrix[id];
                return c && (c.final || c.latest) >= 85;
            });
        }
    },
    
    // Флэш-карты и кейсы
    'CARD_MASTER': {
        id: 'CARD_MASTER',
        name: 'Знаток препаратов',
        description: 'Пометить "Знаю" 50 флэш-карт',
        icon: '🎴',
        condition: (profile) => (profile.cardsKnown || 0) >= 50
    },
    'CASE_HERO': {
        id: 'CASE_HERO',
        name: 'Герой кейсов',
        description: 'Успешно завершить 10 клинических кейсов',
        icon: '🎮',
        condition: (profile) => (profile.casesCompleted || 0) >= 10
    },
    
    // Постоянство
    'STREAK_7': {
        id: 'STREAK_7',
        name: 'Неделя практики',
        description: 'Заниматься 7 дней подряд',
        icon: '🔥',
        condition: (profile) => (profile.currentStreak || 0) >= 7
    },
    'STREAK_30': {
        id: 'STREAK_30',
        name: 'Месяц дисциплины',
        description: 'Заниматься 30 дней подряд',
        icon: '💪',
        condition: (profile) => (profile.currentStreak || 0) >= 30
    }
};

// ============================================================================
// ЭКСПОРТ
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        COMPETENCIES,
        TEST_TYPES,
        COURSE_SECTIONS,
        PROGRESS_THRESHOLDS,
        RECOMMENDATION_PRIORITY,
        RECOMMENDATION_TYPES,
        SPACED_REPETITION_SCHEDULE,
        ACHIEVEMENTS
    };
}

// Для браузера
if (typeof window !== 'undefined') {
    window.COMPETENCIES = COMPETENCIES;
    window.TEST_TYPES = TEST_TYPES;
    window.COURSE_SECTIONS = COURSE_SECTIONS;
    window.PROGRESS_THRESHOLDS = PROGRESS_THRESHOLDS;
    window.RECOMMENDATION_PRIORITY = RECOMMENDATION_PRIORITY;
    window.RECOMMENDATION_TYPES = RECOMMENDATION_TYPES;
    window.SPACED_REPETITION_SCHEDULE = SPACED_REPETITION_SCHEDULE;
    window.ACHIEVEMENTS = ACHIEVEMENTS;
}
