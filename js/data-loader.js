// ============================================
// ЗАГРУЗЧИК ДАННЫХ (CSV DIRECT)
// ============================================

async function loadData() {
    console.log("📥 [Loader] Начинаем загрузку CSV...");

    // ID вашей таблицы
    const SHEET_ID = '1ACWtqrwOjiPpWiMl-aGzcHAJTEHi4u1k2Py3kLs-u6g';
    
    // Ссылки на CSV
    const URL_SCENARIOS = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Сценарии`;
    const URL_TESTS = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Тесты`;
    const URL_CARDS = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Препараты`;

    try {
        // Параллельная загрузка
        const [scenariosRaw, testsRaw, cardsRaw] = await Promise.all([
            fetch(URL_SCENARIOS).then(r => r.text()),
            fetch(URL_TESTS).then(r => r.text()),
            fetch(URL_CARDS).then(r => r.text())
        ]);

        console.log("📥 [Loader] CSV скачаны. Парсим...");

        // Парсинг (превращаем текст в объекты)
        const scenariosData = processScenarios(scenariosRaw);
        const testsData = processTests(testsRaw);
        const cardsData = processCards(cardsRaw);

        console.log(`✅ [Loader] Успех: ${scenariosData.length} сцен, ${testsData.length} тестов, ${cardsData.length} карт`);

        // ВОЗВРАЩАЕМ ОБЪЕКТ С ДАННЫМИ (Это то, чего не хватает сейчас!)
        return {
            scenarios: scenariosData,
            questions: testsData, // Поддержка старого имени questions
            tests: testsData,     // Поддержка нового имени tests
            drugs: cardsData,     // Поддержка старого имени drugs
            cards: cardsData      // Поддержка нового имени cards
        };

    } catch (error) {
        console.error("🔥 [Loader] Ошибка загрузки:", error);
        // Возвращаем пустые массивы, чтобы не было undefined
        return { scenarios: [], tests: [], cards: [], questions: [], drugs: [] };
    }
}

// === ПАРСЕРЫ ===

function processTests(csvText) {
    const rows = parseCSV(csvText);
    const tests = [];
    // Пропускаем заголовок
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[0]) continue;

        // Определение правильного ответа (буква -> индекс)
        let correctIndex = 0;
        const letter = (row[9] || 'A').toUpperCase().trim();
        if (letter.includes('B') || letter.includes('Б')) correctIndex = 1;
        else if (letter.includes('C') || letter.includes('В')) correctIndex = 2;
        else if (letter.includes('D') || letter.includes('Г')) correctIndex = 3;

        tests.push({
            id: row[0],
            category: row[1],
            question: row[3], // Столбец D
            image: row[4],    // Столбец E
            answers: [row[5], row[6], row[7], row[8]].filter(a => a),
            correct: correctIndex,
            explanation: row[10]
        });
    }
    return tests;
}

function processCards(csvText) {
    const rows = parseCSV(csvText);
    const cards = [];
    // Пропускаем заголовок
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[0]) continue;
        cards.push({
            id: row[0],
            title: row[1],    // Название
            name: row[1],     // Дублируем для совместимости
            category: row[2], // Категория
            subtitle: row[3], // МНН
            image: row[4],    // Фото URL
            imageUrl: row[4], // Дублируем
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

function processScenarios(csvText) {
    const rows = parseCSV(csvText);
    const scenariosMap = {};
    rows.forEach(row => {
        if (!row[0] || row[0].startsWith('CASE_ID') || row[0].startsWith('Сценарий_ID')) return;
        const id = row[0].trim();
        const nodeId = row[1].trim();

        if (!scenariosMap[id]) scenariosMap[id] = { id: id, nodes: {} };
        
        // Варианты начинаются с колонки 10 (K)
        const choices = [];
        for (let i = 10; i < row.length; i += 3) {
            if (row[i] && row[i+1]) choices.push({ text: row[i], nextNode: row[i+1], effect: parseInt(row[i+2]) || 0 });
        }

        // События (Event)
        let eventId = null;
        for(let j = 13; j < row.length; j++) {
            if(row[j] && typeof row[j] === 'string' && row[j].startsWith('EVENT_')) {
                eventId = row[j]; break;
            }
        }

        scenariosMap[id].nodes[nodeId] = {
            id: nodeId,
            title: row[3],
            description: row[4],
            imageUrl: row[5],
            choices: choices,
            randomEvent: eventId,
            timeLimit: parseInt(row[21]) || 0
        };
    });
    return Object.values(scenariosMap);
}

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
