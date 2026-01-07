// ============================================
// DATA-LOADER.JS (ADVANCED STRUCTURE)
// ============================================

async function loadData() {
    console.log("📥 [Loader] Загрузка...");

    // 🛑 ВСТАВЬ СЮДА ID НОВОЙ ТАБЛИЦЫ (rus_pharma_field_advanced)
    // Возьми его из адресной строки браузера, когда открыта таблица
    const SHEET_ID = '1ACWtqrwOjiPpWiMl-aGzcHAJTEHi4u1k2Py3kLs-u6g'; 

    // Ссылки (названия листов должны совпадать с Excel)
    const URL_SCENARIOS = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Сценарии`;
    const URL_TESTS = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Вопросы`;
    const URL_CARDS = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Препараты`;

    try {
        const [scenariosRaw, testsRaw, cardsRaw] = await Promise.all([
            fetch(URL_SCENARIOS).then(r => r.text()),
            fetch(URL_TESTS).then(r => r.text()),
            fetch(URL_CARDS).then(r => r.text())
        ]);

        const scenariosData = processScenarios(scenariosRaw);
        const testsData = processTests(testsRaw);
        const cardsData = processCards(cardsRaw);

        console.log(`✅ [Loader] Готово: Сцен: ${scenariosData.length}, Тестов: ${testsData.length}, Карт: ${cardsData.length}`);

        return {
            scenarios: scenariosData,
            tests: testsData,     // Новый стандарт
            questions: testsData, // Для совместимости
            cards: cardsData,     // Новый стандарт
            drugs: cardsData      // Для совместимости
        };

    } catch (error) {
        console.error("🔥 Ошибка загрузки:", error);
        return { scenarios: [], tests: [], cards: [] };
    }
}

// 1. ПРЕПАРАТЫ (Картинка в колонке E -> индекс 4)
function processCards(csvText) {
    const rows = parseCSV(csvText);
    const cards = [];
    // Структура: [0]ID, [1]Название, [2]Категория, [3]МНН, [4]Фото_URL
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[0]) continue;
        cards.push({
            id: row[0],
            title: row[1], name: row[1],
            category: row[2],
            subtitle: row[3],
            image: row[4], imageUrl: row[4], // Колонка E
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

// 2. ВОПРОСЫ (Картинка в колонке F -> индекс 5)
// Ответы теперь через точку с запятой!
function processTests(csvText) {
    const rows = parseCSV(csvText);
    const tests = [];
    // Структура: [0]ID, [1]Компетенция, [2]Вопрос, [3]Ответы(;), [4]Правильный(int), [5]Изображение
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[0]) continue;

        // Разбиваем ответы по ;
        const answersRaw = row[3] || "";
        const answersList = answersRaw.split(';').map(a => a.trim()).filter(a => a);
        
        tests.push({
            id: row[0],
            category: row[1],
            question: row[2],
            answers: answersList,
            correct: parseInt(row[4]) || 0,
            image: row[5], imageUrl: row[5], // Колонка F
            explanation: row[6]
        });
    }
    return tests;
}

// 3. СЦЕНАРИИ (Картинка в колонке F -> индекс 5)
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
            if (row[i] && row[i+1]) choices.push({ text: row[i], nextNode: row[i+1], effect: parseInt(row[i+2]) || 0 });
        }

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
            imageUrl: row[5], // Колонка F
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
