// ============================================
// DATA-LOADER.JS (ADVANCED VERSION)
// ============================================

async function loadData() {
    console.log("📥 [Loader] Начинаем загрузку (Advanced)...");

    // ============================================================
    // 🛑 ВНИМАНИЕ! ВСТАВЬТЕ СЮДА ID ВАШЕЙ НОВОЙ ТАБЛИЦЫ
    // ID находится в ссылке: docs.google.com/spreadsheets/d/ВОТ_ТУТ/edit
    // ============================================================
    const SHEET_ID = '13gFfDfpXoJmM-_UYt6WlylZtI4drqzIfk1a9k9mPoL4'; 
    // Например: '1BxiMvs0XWi....'

    // Ссылки на листы (Имена должны совпадать с вкладками внизу таблицы!)
    const URL_SCENARIOS = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Сценарии`;
    const URL_TESTS = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Вопросы`;
    const URL_CARDS = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Препараты`;

    if (SHEET_ID.includes('ВСТАВЬТЕ')) {
        alert("ОШИБКА: Вы не указали ID таблицы в файле js/data-loader.js!");
        return { scenarios: [], tests: [], cards: [] };
    }

    try {
        const [scenariosRaw, testsRaw, cardsRaw] = await Promise.all([
            fetch(URL_SCENARIOS).then(r => r.text()),
            fetch(URL_TESTS).then(r => r.text()),
            fetch(URL_CARDS).then(r => r.text())
        ]);

        console.log("📥 [Loader] CSV получены. Парсим...");

        const scenariosData = processScenarios(scenariosRaw);
        const testsData = processTests(testsRaw);
        const cardsData = processCards(cardsRaw);

        console.log(`✅ [Loader] Загружено:
        - Сценариев: ${scenariosData.length}
        - Вопросов: ${testsData.length}
        - Препаратов: ${cardsData.length}`);

        return {
            scenarios: scenariosData,
            tests: testsData,
            questions: testsData, 
            cards: cardsData,
            drugs: cardsData      
        };

    } catch (error) {
        console.error("🔥 [Loader] Ошибка загрузки:", error);
        alert("Ошибка доступа к таблице. Проверьте ID и настройки доступа (Файл -> Поделиться -> Все, у кого есть ссылка).");
        return { scenarios: [], tests: [], cards: [] };
    }
}

// === 1. ПАРСЕР ПРЕПАРАТОВ (Advanced: Картинка в E / Index 4) ===
function processCards(csvText) {
    const rows = parseCSV(csvText);
    const cards = [];
    
    // Структура Advanced: [0]ID, [1]Название, [2]Категория, [3]МНН, [4]Фото_URL
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[0]) continue;

        cards.push({
            id: row[0],
            title: row[1],
            name: row[1],
            category: row[2],
            subtitle: row[3],
            image: row[4],    // Колонка E
            imageUrl: row[4], 
            form: row[5],
            dosage: row[6],
            indications: row[7],
            contraindications: row[8],
            sideEffects: row[9],
            fieldNote: row[10]
        });
    }
    return cards;
}

// === 2. ПАРСЕР ВОПРОСОВ (Advanced: Картинка в F / Index 5) ===
function processTests(csvText) {
    const rows = parseCSV(csvText);
    const tests = [];
    
    // Структура Advanced: [0]ID, [1]Компетенция, [2]Вопрос, [3]Ответы, [4]Правильный, [5]Картинка
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[0]) continue;

        const answersRaw = row[3] || "";
        const answersList = answersRaw.split(';').map(a => a.trim()).filter(a => a);
        const correctIndex = parseInt(row[4]) || 0;

        tests.push({
            id: row[0],
            category: row[1], 
            question: row[2],
            answers: answersList,
            correct: correctIndex,
            image: row[5],     // Колонка F
            imageUrl: row[5],
            explanation: row[6]
        });
    }
    return tests;
}

// === 3. ПАРСЕР СЦЕНАРИЕВ (Advanced: Картинка в F / Index 5) ===
function processScenarios(csvText) {
    const rows = parseCSV(csvText);
    const scenariosMap = {};
    
    rows.forEach(row => {
        if (!row[0] || row[0].startsWith('Сценарий_ID')) return;
        
        const id = row[0].trim();
        const nodeId = row[1].trim();

        if (!scenariosMap[id]) scenariosMap[id] = { id: id, nodes: {} };
        
        const choices = [];
        for (let i = 10; i < row.length; i += 3) {
            if (row[i] && row[i+1]) {
                choices.push({ text: row[i], nextNode: row[i+1], effect: parseInt(row[i+2]) || 0 });
            }
        }

        let eventId = null;
        for(let j = 13; j < row.length; j++) {
            if(row[j] && typeof row[j] === 'string' && row[j].startsWith('EVENT_')) {
                eventId = row[j]; break;
            }
        }

        scenariosMap[id].nodes[nodeId] = {
            id: nodeId,
            type: row[2],
            title: row[3],
            description: row[4],
            imageUrl: row[5], // Колонка F
            vitals: { bp: row[7] || '--', hr: row[8] || '--', symptoms: row[9] || '' },
            choices: choices,
            randomEvent: eventId,
            timeLimit: parseInt(row[21]) || 0
        };
    });
    return Object.values(scenariosMap);
}

// === CSV ПАРСЕР ===
function parseCSV(text) {
    const arr = []; let quote = false, row = [], col = '', c = 0;
    text = text.replace(/\r/g, '');
    for (; c < text.length; c++) {
        let cc = text[c], nc = text[c+1];
        if (cc === '"') { if (quote && nc === '"') { col += '"'; c++; } else { quote = !quote; } }
        else if (cc === ',' && !quote) { row.push(col); col = ''; }
        else if (cc === '\n' && !quote) { row.push(col); col = ''; arr.push(row); row = []; }
        else { col += cc; }
    }
    if (row.length > 0 || col.length > 0) { row.push(col); arr.push(row); }
    return arr;
}
