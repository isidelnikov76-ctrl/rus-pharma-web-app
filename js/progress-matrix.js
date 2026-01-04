// ============================================
// МАТРИЦА ПРОГРЕССА КОМПЕТЕНЦИЙ v3.0
// С расширенной системой компетенций
// ============================================

const ProgressMatrix = (function() {
    'use strict';

    // ========================================
    // КОНФИГУРАЦИЯ КОМПЕТЕНЦИЙ (Расширенная)
    // ========================================
    
    const COMPETENCIES_CONFIG = {
        // ШОКИ (5 типов)
        HEMORRHAGIC_SHOCK: { name: 'Геморрагический шок', shortName: 'Гемор.шок', icon: '🩸', color: '#dc3545', block: 'SHOCK' },
        ANAPHYLACTIC_SHOCK: { name: 'Анафилактический шок', shortName: 'Анафилакс.', icon: '⚡', color: '#ff6b6b', block: 'SHOCK' },
        CARDIOGENIC_SHOCK: { name: 'Кардиогенный шок', shortName: 'Кардиоген.', icon: '💔', color: '#e74c3c', block: 'SHOCK' },
        OBSTRUCTIVE_SHOCK: { name: 'Обструктивный шок', shortName: 'Обструкт.', icon: '🫁', color: '#c0392b', block: 'SHOCK' },
        SEPTIC_SHOCK: { name: 'Септический шок', shortName: 'Сепсис', icon: '🦠', color: '#9b59b6', block: 'SHOCK' },
        
        // ФАРМАКОЛОГИЯ
        ANTIBIOTICS: { name: 'Антибиотики', shortName: 'Антибиот.', icon: '💊', color: '#3498db', block: 'PHARMACOLOGY' },
        ANTIHISTAMINES: { name: 'Антигистаминные', shortName: 'Антигист.', icon: '🛡️', color: '#9b59b6', block: 'PHARMACOLOGY' },
        NSAID: { name: 'НПВС', shortName: 'НПВС', icon: '💉', color: '#e67e22', block: 'PHARMACOLOGY' },
        GLUCOCORTICOIDS: { name: 'ГКС', shortName: 'ГКС', icon: '💎', color: '#1abc9c', block: 'PHARMACOLOGY' },
        ANTIDOTES: { name: 'Антидоты', shortName: 'Антидоты', icon: '🧪', color: '#2ecc71', block: 'PHARMACOLOGY' },
        ANALGESIA: { name: 'Анальгезия', shortName: 'Анальгез.', icon: '💊', color: '#6f42c1', block: 'PHARMACOLOGY' },
        INFUSION_THERAPY: { name: 'Инфузия', shortName: 'Инфузия', icon: '💧', color: '#00bcd4', block: 'PHARMACOLOGY' },
        ADRENALINE: { name: 'Адреналин', shortName: 'Адренал.', icon: '⚡', color: '#ff5722', block: 'PHARMACOLOGY' },
        SPASMOLYTICS: { name: 'Спазмолитики', shortName: 'Спазмол.', icon: '🔄', color: '#795548', block: 'PHARMACOLOGY' },
        
        // ИНФЕКЦИИ
        VIRAL_INFECTIONS: { name: 'ОРВИ', shortName: 'ОРВИ', icon: '🤧', color: '#ff9800', block: 'INFECTIONS' },
        EYE_EAR_INFECTIONS: { name: 'Глаза/Уши', shortName: 'Глаза/Уши', icon: '👁️', color: '#00bcd4', block: 'INFECTIONS' },
        TICK_INFECTIONS: { name: 'Клещи', shortName: 'Клещи', icon: '🕷️', color: '#4caf50', block: 'INFECTIONS' },
        RABIES: { name: 'Бешенство', shortName: 'Бешенств.', icon: '🐕', color: '#f44336', block: 'INFECTIONS' },
        
        // ТРАВМА
        HEMOSTASIS: { name: 'Гемостаз', shortName: 'Гемостаз', icon: '🩸', color: '#dc3545', block: 'TRAUMA' },
        WOUND_CARE: { name: 'Раны', shortName: 'Раны', icon: '🩹', color: '#20c997', block: 'TRAUMA' },
        BURNS: { name: 'Ожоги', shortName: 'Ожоги', icon: '🔥', color: '#ff5722', block: 'TRAUMA' },
        GUNSHOT_WOUNDS: { name: 'Огнестрел.', shortName: 'Огнестр.', icon: '🔫', color: '#607d8b', block: 'TRAUMA' },
        
        // НЕОТЛОЖНЫЕ
        CARDIAC_STROKE: { name: 'ИМ/Инсульт', shortName: 'ИМ/Инс.', icon: '❤️‍🩹', color: '#e91e63', block: 'EMERGENCY' },
        DETOX: { name: 'Детокс', shortName: 'Детокс', icon: '🧹', color: '#8bc34a', block: 'EMERGENCY' },
        EVACUATION: { name: 'Эвакуация', shortName: 'Эвакуац.', icon: '🚑', color: '#6c757d', block: 'EMERGENCY' },
        
        // ОСНОВЫ
        PHARMACOLOGY_BASICS: { name: 'Основы', shortName: 'Основы', icon: '📚', color: '#607d8b', block: 'BASICS' }
    };

    // Блоки компетенций для группировки в UI
    const BLOCKS_CONFIG = {
        SHOCK: { name: 'Шоки', icon: '⚡', color: '#dc3545' },
        PHARMACOLOGY: { name: 'Фармакология', icon: '💊', color: '#3498db' },
        INFECTIONS: { name: 'Инфекции', icon: '🦠', color: '#4caf50' },
        TRAUMA: { name: 'Травма', icon: '🩹', color: '#ff5722' },
        EMERGENCY: { name: 'Неотложные', icon: '🚨', color: '#e91e63' },
        BASICS: { name: 'Основы', icon: '📚', color: '#607d8b' }
    };

    // ========================================
    // ОСНОВНЫЕ ФУНКЦИИ
    // ========================================

    function render(container) {
        if (!container) return;
        
        const progressData = getProgressData();
        const hasData = Object.values(progressData).some(d => d && d.diagnostic !== null);
        
        if (!hasData) {
            renderEmptyState(container);
            return;
        }
        
        container.innerHTML = `
            <div class="competency-matrix-card">
                ${renderHeader()}
                ${renderBlockTabs()}
                <div id="matrix-content">
                    ${renderTable(progressData)}
                </div>
                ${renderFooter()}
            </div>
        `;
        
        // Инициализация табов
        initBlockTabs();
    }

    function renderHeader() {
        return `
            <div class="matrix-header">
                <span class="matrix-header-icon">📊</span>
                <h3>Матрица прогресса компетенций</h3>
            </div>
        `;
    }

    function renderBlockTabs() {
        const blocks = Object.entries(BLOCKS_CONFIG);
        return `
            <div class="block-tabs">
                <button class="block-tab active" data-block="ALL">Все</button>
                ${blocks.map(([id, block]) => `
                    <button class="block-tab" data-block="${id}" title="${block.name}">
                        ${block.icon}
                    </button>
                `).join('')}
            </div>
        `;
    }

    function renderTable(progressData, filterBlock = 'ALL') {
        let competencies = Object.keys(COMPETENCIES_CONFIG);
        
        // Фильтруем по блоку
        if (filterBlock !== 'ALL') {
            competencies = competencies.filter(id => 
                COMPETENCIES_CONFIG[id].block === filterBlock
            );
        }
        
        // Фильтруем только те, у которых есть данные
        competencies = competencies.filter(id => {
            const data = progressData[id];
            return data && (data.diagnostic !== null || data.final !== null);
        });
        
        if (competencies.length === 0) {
            return `
                <div class="matrix-no-data">
                    <p>⏳ Нет данных по этому блоку</p>
                    <p>Пройдите тесты для заполнения матрицы</p>
                </div>
            `;
        }
        
        return `
            <div class="scroll-hint">← Прокрутите для просмотра →</div>
            <div class="matrix-table-container">
                <table class="progress-matrix-table">
                    <thead>
                        <tr>
                            <th>Компетенция</th>
                            <th>Вводный</th>
                            <th>Р.1</th>
                            <th>Р.2</th>
                            <th>Р.3</th>
                            <th>Р.4</th>
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

    function renderRow(competencyId, progressData) {
        const competency = COMPETENCIES_CONFIG[competencyId];
        if (!competency) return '';
        
        progressData = progressData || {
            diagnostic: null,
            sections: { 1: null, 2: null, 3: null, 4: null },
            final: null
        };
        
        const sections = progressData.sections || { 1: null, 2: null, 3: null, 4: null };
        const delta = calculateDelta(progressData.diagnostic, progressData.final);
        const deltaInfo = getDeltaIndicator(delta);
        const hasDelta = progressData.diagnostic !== null && progressData.final !== null;
        
        return `
            <tr data-competency="${competencyId}" data-block="${competency.block}">
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
                    <div class="delta-cell ${hasDelta ? deltaInfo.class : 'not-available'}">
                        <span>${hasDelta ? deltaInfo.text : '⏳'}</span>
                        <span class="delta-indicator">${hasDelta ? deltaInfo.icon : ''}</span>
                    </div>
                </td>
            </tr>
        `;
    }

    function formatScore(value) {
        if (value === null || value === undefined) {
            return '<span class="score-cell not-passed" title="Ещё не пройден">⏳</span>';
        }
        return `<span class="score-cell has-value">${Math.round(value)}%</span>`;
    }

    function calculateDelta(diagnostic, final) {
        if (diagnostic === null || final === null) return null;
        return final - diagnostic;
    }

    function getDeltaIndicator(delta) {
        if (delta === null) return { text: '—', icon: '', class: 'not-available' };
        
        const sign = delta >= 0 ? '+' : '';
        if (delta >= 15) return { text: `${sign}${delta}%`, icon: '✅', class: 'positive' };
        if (delta >= 5) return { text: `${sign}${delta}%`, icon: '⚠️', class: 'neutral' };
        return { text: `${sign}${delta}%`, icon: '🔴', class: 'negative' };
    }

    function renderFooter() {
        return `
            <div class="matrix-footer">
                <div class="legend-item">
                    <span class="legend-icon">⏳</span>
                    <span>Не пройден</span>
                </div>
                <div class="legend-item">
                    <span class="legend-dot green"></span>
                    <span>Δ≥15%</span>
                </div>
                <div class="legend-item">
                    <span class="legend-dot yellow"></span>
                    <span>Δ 5-14%</span>
                </div>
                <div class="legend-item">
                    <span class="legend-dot red"></span>
                    <span>Δ<5%</span>
                </div>
            </div>
        `;
    }

    function renderEmptyState(container) {
        container.innerHTML = `
            <div class="competency-matrix-card">
                ${renderHeader()}
                <div class="matrix-empty-state">
                    <div class="matrix-empty-icon">📝</div>
                    <p class="matrix-empty-text">
                        Пройдите вводный тест для заполнения матрицы прогресса
                    </p>
                    <button class="matrix-empty-btn" onclick="ProgressMatrix.goToTest('DIAGNOSTIC')">
                        🎯 Начать вводный тест
                    </button>
                </div>
            </div>
        `;
    }

    // ========================================
    // ТАБЫ БЛОКОВ
    // ========================================

    function initBlockTabs() {
        document.querySelectorAll('.block-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                document.querySelectorAll('.block-tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                const block = this.dataset.block;
                const progressData = getProgressData();
                const contentDiv = document.getElementById('matrix-content');
                if (contentDiv) {
                    contentDiv.innerHTML = renderTable(progressData, block);
                }
            });
        });
    }

    // ========================================
    // ДАННЫЕ
    // ========================================

    function getProgressData() {
        const matrixStr = localStorage.getItem('progressMatrix');
        if (matrixStr) {
            try {
                const matrix = JSON.parse(matrixStr);
                Object.keys(COMPETENCIES_CONFIG).forEach(id => {
                    if (!matrix[id]) {
                        matrix[id] = {
                            diagnostic: null,
                            sections: { 1: null, 2: null, 3: null, 4: null },
                            final: null
                        };
                    }
                });
                return matrix;
            } catch (e) {
                console.error('Ошибка парсинга progressMatrix:', e);
            }
        }
        
        // Пустые данные
        const emptyData = {};
        Object.keys(COMPETENCIES_CONFIG).forEach(id => {
            emptyData[id] = {
                diagnostic: null,
                sections: { 1: null, 2: null, 3: null, 4: null },
                final: null
            };
        });
        return emptyData;
    }

    function goToTest(testType) {
        if (typeof startTest === 'function') {
            startTest(testType);
        } else if (typeof showSection === 'function') {
            showSection('test');
        }
    }

    // ========================================
    // ДЕМО
    // ========================================

    function renderDemo(container) {
        if (!container) return;
        
        const demoData = {
            HEMORRHAGIC_SHOCK: { diagnostic: 75, sections: { 1: 80, 2: null, 3: null, 4: null }, final: null },
            ANTIBIOTICS: { diagnostic: 60, sections: { 1: 70, 2: 75, 3: null, 4: null }, final: 85, delta: 25 },
            ANTIHISTAMINES: { diagnostic: 50, sections: { 1: 65, 2: null, 3: null, 4: null }, final: null },
            ANALGESIA: { diagnostic: 80, sections: { 1: 85, 2: 90, 3: null, 4: null }, final: 95, delta: 15 },
            BURNS: { diagnostic: 45, sections: { 1: 55, 2: null, 3: null, 4: null }, final: null }
        };
        
        container.innerHTML = `
            <div class="competency-matrix-card">
                ${renderHeader()}
                ${renderBlockTabs()}
                <div id="matrix-content">
                    <div class="scroll-hint">← Прокрутите для просмотра →</div>
                    <div class="matrix-table-container">
                        <table class="progress-matrix-table">
                            <thead>
                                <tr>
                                    <th>Компетенция</th>
                                    <th>Вводный</th>
                                    <th>Р.1</th>
                                    <th>Р.2</th>
                                    <th>Р.3</th>
                                    <th>Р.4</th>
                                    <th>Финал</th>
                                    <th>Δ</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.keys(demoData).map(id => renderRow(id, demoData[id])).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                ${renderFooter()}
            </div>
        `;
        
        initBlockTabs();
    }

    // ========================================
    // PUBLIC API
    // ========================================

    return {
        render: render,
        renderDemo: renderDemo,
        goToTest: goToTest,
        getProgressData: getProgressData,
        COMPETENCIES: COMPETENCIES_CONFIG,
        BLOCKS: BLOCKS_CONFIG
    };

})();

// Экспорт
if (typeof window !== 'undefined') {
    window.ProgressMatrix = ProgressMatrix;
}
