// ============================================
// МОДУЛЬ КЛИНИЧЕСКИХ КЕЙСОВ (FINAL: RESTART FIXED. STABLE )
// ============================================

let currentScenario = null;
let currentNode = null;
let patientHealth = 100;
let actionHistory = [];
let scenarioTimer = null;
let nodeStartTime = null;
let totalTimeSpent = 0;
let hintsUsed = 0;

let scenarioStats = {
    correctChoices: 0,
    wrongChoices: 0,
    criticalErrors: 0,
    timeBonus: 0,
    totalScore: 0
};

let patientVitals = {
    bp: '120/80',
    hr: 75,
    rr: 16,
    spo2: 98,
    consciousness: 'ясное',
    symptoms: []
};

function initCasesModule() {
    renderScenarioList();
}

function renderScenarioList() {
    const container = document.getElementById('scenariosGrid');
    if (!container) return;
    
    if (!appData.scenarios || appData.scenarios.length === 0) {
        container.innerHTML = `<div class="no-data"><p>Сценарии загружаются или список пуст...</p></div>`;
        return;
    }
    
    container.innerHTML = '';
    
    appData.scenarios.forEach(scenario => {
        const startNode = scenario.nodes['START'];
        if (!startNode) return;
        
        const completed = isScenarioCompleted(scenario.id);
        
        let imgHtml = '<div class="scenario-placeholder">??</div>';
        if (startNode.imageUrl) {
            const url = (typeof convertGoogleDriveUrl === 'function') 
                ? convertGoogleDriveUrl(startNode.imageUrl) 
                : startNode.imageUrl;
            imgHtml = `<img src="${url}" alt="${startNode.title}" referrerpolicy="no-referrer">`;
        }
        
        const card = document.createElement('div');
        card.className = `scenario-card ${completed ? 'completed' : ''}`;
        card.onclick = () => startScenario(scenario.id);
        
        card.innerHTML = `
            <div class="scenario-image">
                ${imgHtml}
                ${completed ? '<div class="completed-badge">?</div>' : ''}
            </div>
            <div class="scenario-info">
                <h3>${startNode.title}</h3>
                <p>${truncateText(startNode.description, 80)}</p>
            </div>
        `;
        container.appendChild(card);
    });

    // Кнопка выхода в меню (защита от дублирования)
    if (!document.getElementById('btnBackMenuCases')) {
        const exitMenuBtn = document.createElement('button');
        exitMenuBtn.id = 'btnBackMenuCases';
        exitMenuBtn.className = 'btn';
        exitMenuBtn.innerText = '?? В главное меню';
        exitMenuBtn.onclick = () => showSection('menu');
        exitMenuBtn.style.marginTop = '20px';
        exitMenuBtn.style.width = '100%';
        exitMenuBtn.style.background = '#6c757d';
        container.parentElement.appendChild(exitMenuBtn);
    }
}

function startScenario(scenarioId) {
    currentScenario = appData.scenarios.find(s => s.id === scenarioId);
    if (!currentScenario) {
        console.error("Сценарий не найден в appData");
        return;
    }
    
    // Сброс всех параметров
    patientHealth = 100;
    actionHistory = [];
    hintsUsed = 0;
    totalTimeSpent = 0;
    currentNode = null; 
    
    scenarioStats = { correctChoices: 0, wrongChoices: 0, criticalErrors: 0, timeBonus: 0, totalScore: 0 };
    patientVitals = { bp: '120/80', hr: 75, rr: 16, spo2: 98, consciousness: 'ясное', symptoms: [] };
    
    document.getElementById('scenarioList').style.display = 'none';
    document.getElementById('activeScenario').style.display = 'block';
    document.getElementById('scenarioResult').style.display = 'none';
    
    // Очистка журнала визуально
    const log = document.getElementById('actionLog');
    if (log) log.innerHTML = '';
    
    navigateToNode('START');
}

function navigateToNode(nodeId) {
    if (scenarioTimer) {
        clearInterval(scenarioTimer);
        scenarioTimer = null;
    }
    const timerDiv = document.getElementById('nodeTimer');
    if (timerDiv) timerDiv.style.display = 'none';
    
    // .trim() - страховка
    const cleanId = String(nodeId).trim();
    currentNode = currentScenario.nodes[cleanId];
    
    if (!currentNode) {
        console.error(`CRITICAL: Узел "${cleanId}" не найден в сценарии ${currentScenario.id}`);
        alert(`Ошибка: Узел "${cleanId}" отсутствует в таблице. Проверьте переходы.`);
        return;
    }
    
    nodeStartTime = Date.now();
    
    const type = currentNode.type ? currentNode.type.toLowerCase() : '';
    if (['win', 'победа', 'success'].includes(type)) {
        showResult(true);
        return;
    }
    if (['fail', 'поражение', 'death'].includes(type)) {
        showResult(false);
        return;
    }
    
    updateVitals(currentNode);
    updatePatientStatus();
    renderScene();
    
    if (currentNode.timeLimit > 0) startNodeTimer(currentNode.timeLimit);
    
    checkRandomEvent();
}

function makeChoice(choice) {
    if (!currentNode) return;

    const decisionTime = Math.round((Date.now() - nodeStartTime) / 1000);
    totalTimeSpent += decisionTime;
    
    actionHistory.push({
        nodeId: currentNode.id,
        nodeTitle: currentNode.title,
        choice: choice.text,
        effect: choice.effect || 0,
        timestamp: new Date()
    });
    
    updateActionLog();
    
    if (choice.effect) patientHealth += choice.effect;
    
    const btns = document.querySelectorAll('#choicesContainer button');
    btns.forEach(b => b.disabled = true);
    
    navigateToNode(choice.nextNode);
}

function updateActionLog() {
    const log = document.getElementById('actionLog');
    if (!log) return;
    
    log.innerHTML = actionHistory.map((item, index) => {
        const effectClass = item.effect > 0 ? 'text-success' : (item.effect < 0 ? 'text-danger' : '');
        const effectText = item.effect ? `(${item.effect > 0 ? '+' : ''}${item.effect})` : '';
        
        return `
            <div style="padding: 5px 0; border-bottom: 1px solid #eee; font-size: 0.9em;">
                <strong>${index + 1}.</strong> ${item.choice} 
                <span class="${effectClass}" style="font-weight:bold">${effectText}</span>
            </div>
        `;
    }).join('');
    
    log.scrollTop = log.scrollHeight;
}

function updateVitals(node) {
    if (!node.vitals) return;
    if (node.vitals.bp) patientVitals.bp = node.vitals.bp;
    if (node.vitals.hr) patientVitals.hr = node.vitals.hr;
    if (node.vitals.rr) patientVitals.rr = node.vitals.rr;
    
    if (node.vitals.symptoms) {
        let sym = node.vitals.symptoms;
        if (typeof sym === 'string') {
            patientVitals.symptoms = sym.split(',').map(s => s.trim()).filter(s => s !== '');
        } else if (Array.isArray(sym)) {
            patientVitals.symptoms = sym;
        } else {
            patientVitals.symptoms = [];
        }
    }
}

function updatePatientStatus() {
    const label = currentNode.patientState || 'stable';
    document.getElementById('vitalBP').textContent = `АД: ${patientVitals.bp}`;
    document.getElementById('vitalHR').textContent = `ЧСС: ${patientVitals.hr}`;
    document.getElementById('vitalState').textContent = `Состояние: ${label}`;
    
    const healthBar = document.getElementById('conditionFill');
    if (healthBar) {
        healthBar.style.width = `${patientHealth}%`;
        if (patientHealth > 70) healthBar.style.backgroundColor = '#28a745'; 
        else if (patientHealth > 30) healthBar.style.backgroundColor = '#ffc107'; 
        else healthBar.style.backgroundColor = '#dc3545'; 
    }
    
    if (patientHealth <= 0) setTimeout(() => showResult(false), 500);
}

function renderScene() {
    let img = document.getElementById('sceneImage');
    const imgContainer = img ? img.parentElement : null;

    if (imgContainer) {
        const directUrl = (typeof convertGoogleDriveUrl === 'function') 
            ? convertGoogleDriveUrl(currentNode.imageUrl) 
            : currentNode.imageUrl;

        if (directUrl && directUrl.length > 5) {
            img.remove();
            img = document.createElement('img');
            img.id = 'sceneImage';
            img.alt = 'Сцена';
            img.setAttribute('referrerpolicy', 'no-referrer');
            img.referrerPolicy = 'no-referrer';
            img.src = directUrl;
            Object.assign(img.style, { display: 'block', width: '100%', maxHeight: '250px', objectFit: 'contain', borderRadius: '8px', marginBottom: '15px' });
            img.onclick = () => { if (typeof openImageModal === 'function') openImageModal(directUrl); };
            imgContainer.prepend(img);
        } else if (img) {
            img.style.display = 'none';
        }
    }
    
    document.getElementById('sceneTitle').textContent = currentNode.title || 'Ситуация';
    document.getElementById('sceneDescription').innerHTML = currentNode.description;
    
    const safeSymptoms = Array.isArray(patientVitals.symptoms) ? patientVitals.symptoms : [];
    if (currentNode.additionalSymptoms || safeSymptoms.length > 0) {
        const txt = currentNode.additionalSymptoms || safeSymptoms.join(', ');
        document.getElementById('sceneDescription').innerHTML += `<div style="margin-top:10px; padding:10px; background:#fff3e0; border-left:4px solid #ff9800;"><strong>?? Симптомы:</strong> ${txt}</div>`;
    }
    
    if (currentNode.hint) {
        document.getElementById('sceneDescription').innerHTML += `
            <button class="hint-btn" onclick="showHint()" style="margin-top:10px; background:none; border:none; color:#2196F3; cursor:pointer; text-decoration:underline;">?? Нужна подсказка?</button>
        `;
    }
    
    renderChoices();
}

function renderChoices() {
    const container = document.getElementById('choicesContainer');
    container.innerHTML = '';
    
    if (!currentNode.choices || currentNode.choices.length === 0) {
        const btn = document.createElement('button');
        btn.className = 'choice-btn continue-btn';
        btn.innerHTML = 'Продолжить >';
        Object.assign(btn.style, { width: '100%', padding: '15px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' });
        btn.onclick = () => { patientHealth > 0 ? showResult(true) : showResult(false); };
        container.appendChild(btn);
        return;
    }
    
    currentNode.choices.forEach((choice, index) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        Object.assign(btn.style, { width: '100%', padding: '12px', marginBottom: '10px', textAlign: 'left', background: 'white', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' });
        btn.innerHTML = `<span>${index + 1}. ${choice.text}</span>`;
        btn.onclick = () => makeChoice(choice);
        container.appendChild(btn);
    });
}

function checkRandomEvent() {
    if (currentNode.randomEvent && currentNode.eventProbability) {
        const roll = Math.random() * 100;
        if (roll < currentNode.eventProbability) {
            triggerScenarioEvent(currentNode.randomEvent);
        }
    }
}

function triggerScenarioEvent(eventId) {
    const eventRedirects = {
        'EVENT_ALLERGY': 'NODE_ALLERGY',
        'EVENT_SHOCK': 'NODE_SHOCK'
    };
    const target = eventRedirects[eventId];
    if (target) {
        setTimeout(() => {
            alert(`?? СОБЫТИЕ: ${eventId}\nСитуация изменилась!`);
            navigateToNode(target);
        }, 1500);
    }
}

function startNodeTimer(seconds) {
    let remaining = seconds;
    let timerDiv = document.getElementById('nodeTimer');
    if (!timerDiv) {
        timerDiv = document.createElement('div');
        timerDiv.id = 'nodeTimer';
        document.querySelector('.scene').prepend(timerDiv);
    }
    timerDiv.style.display = 'block';
    
    scenarioTimer = setInterval(() => {
        remaining--;
        timerDiv.textContent = `? ${remaining}`;
        if (remaining <= 0) {
            clearInterval(scenarioTimer);
            alert('Время вышло!');
            patientHealth -= 20;
            if (currentNode.choices?.[0]) navigateToNode(currentNode.choices[0].nextNode);
        }
    }, 1000);
}

function showResult(isSuccess) {
    if (scenarioTimer) clearInterval(scenarioTimer);
    document.getElementById('activeScenario').style.display = 'none';
    document.getElementById('scenarioResult').style.display = 'block';
    
    document.getElementById('resultTitle').textContent = isSuccess ? 'Миссия выполнена' : 'Миссия провалена';
    document.getElementById('resultTitle').style.color = isSuccess ? 'green' : 'red';
    document.getElementById('resultMessage').textContent = isSuccess ? 'Пациент стабилен.' : 'Пациент погиб.';
    
    saveCaseResult(currentScenario.id, isSuccess);
}

function showHint() {
    if (!currentNode.hint) return;
    hintsUsed++;
    alert(`?? ПОДСКАЗКА:\n\n${currentNode.hint}`);
}

// === ФУНКЦИИ УПРАВЛЕНИЯ (ДОБАВЛЕН RESTART) ===

function restartScenario() {
    if (currentScenario) {
        startScenario(currentScenario.id);
    } else {
        showSection('menu');
    }
}

function exitScenario() {
    if (scenarioTimer) clearInterval(scenarioTimer);
    document.getElementById('scenarioList').style.display = 'block';
    document.getElementById('activeScenario').style.display = 'none';
    document.getElementById('scenarioResult').style.display = 'none';
    
    // Обновляем список, чтобы показать прогресс
    renderScenarioList();
}

function isScenarioCompleted(id) {
    const res = JSON.parse(localStorage.getItem('caseResults') || '[]');
    return res.some(r => r.scenarioId === id && r.success);
}
function getBestScore(id) { return 0; }
function saveCaseResult(id, success) {
    const res = JSON.parse(localStorage.getItem('caseResults') || '[]');
    res.push({ scenarioId: id, success, date: new Date() });
    localStorage.setItem('caseResults', JSON.stringify(res));
}
function truncateText(text, len) { return text.length > len ? text.substring(0, len) + '...' : text; }