// ============================================
// DATA-LOADER.JS (FOR ADVANCED TABLE)
// ============================================

async function loadData() {
    console.log("📥 [Loader] Загрузка данных (Advanced структура)...");

    // ⚠️ ВАЖНО: Вставьте сюда ID вашей НОВОЙ таблицы (rus_pharma_field_advanced)
    // Если вы загрузили новый файл в Google Drive, ID изменился!
    const SHEET_ID = '1ACWtqrwOjiPpWiMl-aGzcHAJTEHi4u1k2Py3kLs-u6g'; 
    
    // Имена листов должны совпадать с теми, что внизу вашей таблицы
    const URL_SCENARIOS = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Сценарии`;
    const URL_TESTS = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Вопросы`;
    const URL_CARDS = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Препараты`;
    const URL_SKILLS = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Компетенции`; // Если нужно

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
            questions: testsData, // Дубликат для совместимости
            cards: cardsData,
            drugs: cardsData      // Дубликат для совместимости
        };

    } catch (error) {
        console.error("🔥 [Loader] Ошибка загрузки:", error);
        return { scenarios: [], tests: [], cards: [] };
    }
}

// === 1. ПАРСЕР ПРЕПАРАТОВ (Column E = Index 4) ===
function processCards(csvText) {
    const rows = parseCSV(csvText);
    const cards = [];
    
    // Структура Advanced: 
    // [0]ID, [1]Название, [2]Категория, [3]МНН, [4]Фото_URL (Column E)
    
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[0]) continue;

        cards.push({
            id: row[0],
            title: row[1],
            name: row[1],
            category: row[2],
            subtitle: row[3],
            
            // ✅ Картинка в колонке E (индекс 4)
            image: row[4],    
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

// === 2. ПАРСЕР ВОПРОСОВ (Column F = Index 5) ===
function processTests(csvText) {
    const rows = parseCSV(csvText);
    const tests = [];
    
    // Структура Advanced:
    // [0]ID, [1]Компетенция, [2]Вопрос, [3]Ответы(через ;), [4]Правильный(цифра), [5]Изображение (Column F), [6]Пояснение
    
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[0]) continue;

        // Разбираем ответы, записанные через точку с запятой
        const answersRaw = row[3] || "";
        const answersList = answersRaw.split(';').map(a => a.trim()).filter(a => a);
        
        // Правильный ответ теперь цифра (индекс), а не буква
        const correctIndex = parseInt(row[4]) || 0;

        tests.push({
            id: row[0],
            category: row[1], // В Advanced это "Компетенция", но используем как категорию
            question: row[2],
            
            answers: answersList,
            correct: correctIndex,
            
            // ✅ Картинка в колонке F (индекс 5)
            image: row[5],
            imageUrl: row[5], 
            
            explanation: row[6]
        });
    }
    return tests;
}

// === 3. ПАРСЕР СЦЕНАРИЕВ (Column F = Index 5) ===
function processScenarios(csvText) {
    const rows = parseCSV(csvText);
    const scenariosMap = {};
    
    // Структура Advanced:
    // [0]ID, [1]Узел, [2]Тип, [3]Заголовок, [4]Описание, [5]Картинка_URL (Column F)
    
    rows.forEach(row => {
        if (!row[0] || row[0].startsWith('Сценарий_ID')) return;
        
        const id = row[0].trim();
        const nodeId = row[1].trim();

        if (!scenariosMap[id]) scenariosMap[id] = { id: id, nodes: {} };
        
        // Варианты начинаются с колонки 10 (K)
        const choices = [];
        for (let i = 10; i < row.length; i += 3) {
            if (row[i] && row[i+1]) {
                choices.push({ 
                    text: row[i], 
                    nextNode: row[i+1], 
                    effect: parseInt(row[i+2]) || 0 
                });
            }
        }

        // Поиск событий
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
            
            // ✅ Картинка в колонке F (индекс 5)
            imageUrl: row[5], 
            
            // Остальные поля (могут немного сместиться в Advanced, проверяем по заголовкам)
            // Обычно: [6]Состояние, [7]АД, [8]ЧСС, [9]Симптомы
            vitals: { 
                bp: row[7] || '--', 
                hr: row[8] || '--', 
                symptoms: row[9] || '' 
            },
            
            choices: choices,
            randomEvent: eventId,
            timeLimit: parseInt(row[21]) || 0
        };
    });
    return Object.values(scenariosMap);
}

// === CSV ПАРСЕР ===
function parseCSV(text) {
    const arr = []; 
    let quote = false; 
    let row = []; 
    let col = ''; 
    
    text = text.replace(/\r/g, '');
    
    for (let c = 0; c < text.length; c++) {
        let cc = text[c]; 
        let nc = text[c+1]; 
        
        if (cc === '"') { 
            if (quote && nc === '"') { col += '"'; c++; } 
            else { quote = !quote; } 
        }
        else if (cc === ',' && !quote) { 
            row.push(col); col = ''; 
        }
        else if (cc === '\n' && !quote) { 
            row.push(col); col = ''; 
            if (row.length > 0) arr.push(row); 
            row = []; 
        }
        else { col += cc; }
    }
    if (row.length > 0 || col.length > 0) { row.push(col); arr.push(row); }
    return arr;
}
