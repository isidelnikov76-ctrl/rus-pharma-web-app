// ============================================
// КОМПОНЕНТ: МАТРИЦА ПРОГРЕССА КОМПЕТЕНЦИЙ
// Версия 2.0 - Дизайн как на скриншоте
// ============================================

const ProgressMatrix = (function() {
    'use strict';

    /**
     * Конфигурация компетенций курса
     */
    const COMPETENCIES_CONFIG = {
        HEMOSTASIS: { 
            id: 'HEMOSTASIS',
            name: 'Остановка кровотечений', 
            shortName: 'Гемостаз', 
            icon: '🩸', 
            color: '#dc3545' 
        },
        AIRWAY: { 
            id: 'AIRWAY',
            name: 'Проходимость дыхательных путей', 
            shortName: 'Дых. пути', 
            icon: '🫁', 
            color: '#17a2b8' 
        },
        ANALGESIA: { 
            id: 'ANALGESIA',
            name: 'Обезболивание', 
            shortName: 'Анальгезия', 
            icon: '💊', 
            color: '#6f42c1' 
        },
        SHOCK: { 
            id: 'SHOCK',
            name: 'Противошоковая терапия', 
            shortName: 'Шок', 
            icon: '⚡', 
            color: '#fd7e14' 
        },
        WOUND_CARE: { 
            id: 'WOUND_CARE',
            name: 'Обработка ран', 
            shortName: 'Раны', 
            icon: '🩹', 
            color: '#20c997' 
        },
        ANTIBIOTICS: { 
            id: 'ANTIBIOTICS',
            name: 'Антибиотикотерапия', 
            shortName: 'Антибиотики', 
            icon: '💉', 
            color: '#e83e8c' 
        },
        EVACUATION: { 
            id: 'EVACUATION',
            name: 'Эвакуация', 
            shortName: 'Эвакуация', 
            icon: '🚑', 
            color: '#6c757d' 
        },
        HYPOTHERMIA: { 
            id: 'HYPOTHERMIA',
            name: 'Профилактика гипотермии', 
            shortName: 'Гипотермия', 
            icon: '🌡️', 
            color: '#007bff' 
        }
    };

    /**
     * Получение данных прогресса из localStorage
     */
    function getProgressData() {
        // 1. Пробуем получить из localStorage.progressMatrix (новый формат)
        const matrixStr = localStorage.getItem('progressMatrix');
        if (matrixStr) {
            try {
                const matrix = JSON.parse(matrixStr);
                // Дополняем данные для всех компетенций
                Object.keys(COMPETENCIES_CONFIG).forEach(id => {
                    if (!matrix[id]) {
                        matrix[id] = {
                            diagnostic: null,
                            sections: { 1: null, 2: null, 3: null, 4: null },
                            final: null
                        };
                    }
                });
                console.log('📊 Загружены данные матрицы:', matrix);
                return matrix;
            } catch (e) {
                console.error('Ошибка парсинга progressMatrix:', e);
            }
        }
        
        // 2. Пробуем получить из CadetProgress
        if (typeof CadetProgress !== 'undefined') {
            const profile = CadetProgress.getProfile();
            if (profile && profile.progressMatrix) {
                return profile.progressMatrix;
            }
        }
        
        // 3. Fallback: пустые данные
        const emptyData = {};
        Object.keys(COMPETENCIES_CONFIG).forEach(id => {
            emptyData[id] = {
                diagnostic: null,
                sections: { 1: null, 2: null, 3: null, 4: null },
                final: null,
                delta: 0,
                trend: 'STABLE'
            };
        });
        return emptyData;
    }

    /**
     * Расчёт дельты прогресса
     */
    function calculateDelta(diagnostic, final) {
        if (diagnostic === null || final === null) return 0;
        return final - diagnostic;
    }

    /**
     * Получение индикатора дельты
     */
    function getDeltaIndicator(delta) {
        if (delta >= 15) {
            return { class: 'positive', icon: '✅', text: `+${delta}%` };
        } else if (delta >= 5) {
            return { class: 'neutral', icon: '⚠️', text: `+${delta}%` };
        } else if (delta > 0) {
            return { class: 'neutral', icon: '⚠️', text: `+${delta}%` };
        } else if (delta === 0) {
            return { class: 'neutral', icon: '➡️', text: '0%' };
        } else {
            return { class: 'negative', icon: '🔴', text: `${delta}%` };
        }
    }

    /**
     * Форматирование значения оценки
     */
    function formatScore(value) {
        if (value === null || value === undefined) {
            return '<span class="score-cell not-passed" title="Ещё не пройден">⏳</span>';
        }
        return `<span class="score-cell has-value">${Math.round(value)}%</span>`;
    }

    /**
     * Рендер заголовка матрицы
     */
    function renderHeader() {
        return `
            <div class="matrix-header">
                <span class="matrix-header-icon">📊</span>
                <h3>Матрица прогресса компетенций</h3>
            </div>
        `;
    }

    /**
     * Рендер таблицы с данными
     */
    function renderTable(progressData) {
        const competencies = Object.keys(COMPETENCIES_CONFIG);
        
        return `
            <div class="scroll-hint">Прокрутите для просмотра всех колонок</div>
            <div class="matrix-table-container">
                <table class="progress-matrix-table">
                    <thead>
                        <tr>
                            <th>Компетенция</th>
                            <th>Вводный</th>
                            <th>Разд. 1</th>
                            <th>Разд. 2</th>
                            <th>Разд. 3</th>
                            <th>Разд. 4</th>
                            <th>Финал</th>
                            <th>Δ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${competencies.map(id => renderRow(id, progressData[id])).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Рендер строки компетенции
     */
    function renderRow(competencyId, data) {
        const competency = COMPETENCIES_CONFIG[competencyId];
        const progressData = data || {
            diagnostic: null,
            sections: { 1: null, 2: null, 3: null, 4: null },
            final: null,
            delta: 0
        };
        
        const sections = progressData.sections || { 1: null, 2: null, 3: null, 4: null };
        const delta = calculateDelta(progressData.diagnostic, progressData.final);
        const deltaInfo = getDeltaIndicator(delta);
        
        return `
            <tr data-competency="${competencyId}">
                <td>
                    <div class="competency-name-cell">
                        <span class="competency-icon">${competency.icon}</span>
                        <span class="competency-name">${competency.shortName}</span>
                    </div>
                </td>
                <td>${formatScore(progressData.diagnostic)}</td>
                <td>${formatScore(sections[1])}</td>
                <td>${formatScore(sections[2])}</td>
                <td>${formatScore(sections[3])}</td>
                <td>${formatScore(sections[4])}</td>
                <td>${formatScore(progressData.final)}</td>
                <td>
                    <div class="delta-cell ${progressData.diagnostic !== null && progressData.final !== null ? deltaInfo.class : 'not-available'}">
                        <span>${progressData.diagnostic !== null && progressData.final !== null ? deltaInfo.text : '⏳'}</span>
                        <span class="delta-indicator">${progressData.diagnostic !== null && progressData.final !== null ? deltaInfo.icon : ''}</span>
                    </div>
                </td>
            </tr>
        `;
    }

    /**
     * Рендер подвала с легендой
     */
    function renderFooter() {
        return `
            <div class="matrix-footer">
                <div class="legend-item">
                    <span class="legend-icon">⏳</span>
                    <span>Ещё не пройден</span>
                </div>
                <div class="legend-item">
                    <span class="legend-dot green"></span>
                    <span>Δ ≥ 15%</span>
                </div>
                <div class="legend-item">
                    <span class="legend-dot yellow"></span>
                    <span>Δ 5-14%</span>
                </div>
                <div class="legend-item">
                    <span class="legend-dot red"></span>
                    <span>Δ < 5%</span>
                </div>
            </div>
        `;
    }

    /**
     * Рендер пустого состояния
     */
    function renderEmptyState() {
        return `
            <div class="competency-matrix-card">
                ${renderHeader()}
                <div class="matrix-empty-state">
                    <div class="matrix-empty-icon">📊</div>
                    <div class="matrix-empty-text">
                        Пройдите вводный тест для формирования матрицы прогресса
                    </div>
                    <button class="matrix-empty-btn" onclick="ProgressMatrix.goToTest('DIAGNOSTIC')">
                        🎯 Пройти вводный тест
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Проверка наличия данных
     */
    function hasAnyData(progressData) {
        return Object.values(progressData).some(data => 
            data && (data.diagnostic !== null || data.final !== null)
        );
    }

    /**
     * Главный метод рендера матрицы
     */
    function render(container) {
        if (!container) {
            console.error('ProgressMatrix: контейнер не найден');
            return;
        }

        const progressData = getProgressData();
        
        if (!hasAnyData(progressData)) {
            container.innerHTML = renderEmptyState();
            return;
        }

        container.innerHTML = `
            <div class="competency-matrix-card">
                ${renderHeader()}
                ${renderTable(progressData)}
                ${renderFooter()}
            </div>
        `;
    }

    /**
     * Переход к тесту
     */
    function goToTest(testType) {
        if (typeof TestSelector !== 'undefined' && typeof TestSelector.startTest === 'function') {
            TestSelector.startTest(testType);
        } else if (typeof showSection === 'function') {
            showSection('test');
        } else {
            console.log('Переход к тесту:', testType);
            alert('Перейдите в раздел "Тесты" для прохождения вводного теста');
        }
    }

    /**
     * Обновление одной компетенции (для анимации)
     */
    function updateCompetency(competencyId, newData) {
        const row = document.querySelector(`tr[data-competency="${competencyId}"]`);
        if (row) {
            row.classList.add('updating');
            setTimeout(() => {
                row.outerHTML = renderRow(competencyId, newData);
            }, 300);
        }
    }

    /**
     * Демо-данные для тестирования
     */
    function loadDemoData() {
        return {
            HEMOSTASIS: { diagnostic: 40, sections: { 1: 55, 2: 70, 3: null, 4: null }, final: 85, delta: 45 },
            AIRWAY: { diagnostic: 60, sections: { 1: 65, 2: 63, 3: 62, 4: null }, final: 65, delta: 5 },
            ANALGESIA: { diagnostic: 30, sections: { 1: 45, 2: 70, 3: 80, 4: null }, final: 90, delta: 60 },
            SHOCK: { diagnostic: 50, sections: { 1: 48, 2: 45, 3: 50, 4: null }, final: 52, delta: 2 },
            WOUND_CARE: { diagnostic: 55, sections: { 1: null, 2: null, 3: 65, 4: 75 }, final: 80, delta: 25 },
            ANTIBIOTICS: { diagnostic: 35, sections: { 1: null, 2: null, 3: null, 4: 50 }, final: 60, delta: 25 },
            EVACUATION: { diagnostic: 45, sections: { 1: 55, 2: null, 3: null, 4: 60 }, final: 70, delta: 25 },
            HYPOTHERMIA: { diagnostic: 25, sections: { 1: null, 2: 40, 3: 55, 4: null }, final: 65, delta: 40 }
        };
    }

    /**
     * Рендер с демо-данными (для тестирования)
     */
    function renderDemo(container) {
        if (!container) return;
        
        const demoData = loadDemoData();
        
        container.innerHTML = `
            <div class="competency-matrix-card">
                ${renderHeader()}
                <div class="scroll-hint">Прокрутите для просмотра всех колонок</div>
                <div class="matrix-table-container">
                    <table class="progress-matrix-table">
                        <thead>
                            <tr>
                                <th>Компетенция</th>
                                <th>Вводный</th>
                                <th>Разд. 1</th>
                                <th>Разд. 2</th>
                                <th>Разд. 3</th>
                                <th>Разд. 4</th>
                                <th>Финал</th>
                                <th>Δ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.keys(demoData).map(id => renderRow(id, demoData[id])).join('')}
                        </tbody>
                    </table>
                </div>
                ${renderFooter()}
            </div>
        `;
    }

    // Публичный API
    return {
        render: render,
        renderDemo: renderDemo,
        goToTest: goToTest,
        updateCompetency: updateCompetency,
        getProgressData: getProgressData,
        COMPETENCIES: COMPETENCIES_CONFIG
    };

})();

// Экспорт для глобального доступа
if (typeof window !== 'undefined') {
    window.ProgressMatrix = ProgressMatrix;
}
