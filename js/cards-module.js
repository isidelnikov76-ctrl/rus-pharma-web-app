// ============================================
// МОДУЛЬ КАРТ (VISUAL FIX)
// ============================================

let currentCards = [];
let currentCardIndex = 0;
let isCardFlipped = false;
let cardView = 'single'; 

function initCardsModule() {
    console.log("💊 [Cards] Старт модуля...");
    
    // Пробуем найти данные
    const sourceData = window.appData.drugs || window.appData.cards;
    
    if (!sourceData || sourceData.length === 0) {
        console.warn("⚠️ [Cards] Данные не найдены!");
        const el = document.getElementById('flashcard');
        if (el) el.innerHTML = '<div style="padding:20px;text-align:center">Нет данных. Нажмите "Обновить".</div>';
        return;
    }
    
    console.log(`✅ [Cards] Найдено ${sourceData.length} препаратов`);
    
    populateCategories();
    resetCardsState();
    loadCards('all');
}

function resetCardsState() {
    currentCardIndex = 0;
    isCardFlipped = false;
    cardView = 'single';
    const cardEl = document.getElementById('flashcard');
    if (cardEl) cardEl.classList.remove('flipped');
}

function populateCategories() {
    const sourceData = window.appData.drugs || window.appData.cards;
    const categories = [...new Set(sourceData.map(d => d.category))];
    const select = document.getElementById('categoryFilter');
    if (!select) return;

    while (select.options.length > 1) select.remove(1);
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat; option.textContent = cat;
        select.appendChild(option);
    });
}

function loadCards(category = 'all') {
    const sourceData = window.appData.drugs || window.appData.cards;
    if (category === 'all') currentCards = [...sourceData];
    else currentCards = sourceData.filter(d => d.category === category);
    
    currentCardIndex = 0;
    isCardFlipped = false;
    updateCardsUI();
}

function updateCardsUI() {
    document.getElementById('totalCards').innerText = currentCards.length;
    
    const singleView = document.getElementById('singleCardView');
    const gridView = document.getElementById('gridCardView');
    
    if (cardView === 'single') {
        if (singleView) singleView.style.display = 'block';
        if (gridView) gridView.style.display = 'none';
        showCard(currentCardIndex);
    } else {
        if (singleView) singleView.style.display = 'none';
        if (gridView) gridView.style.display = 'block';
        renderGrid();
    }
}

function showCard(index) {
    if (index < 0 || index >= currentCards.length) return;
    const card = currentCards[index];
    
    const cardEl = document.getElementById('flashcard');
    if (cardEl) cardEl.classList.remove('flipped');
    isCardFlipped = false;
    
    // Тексты
    document.getElementById('cardIndex').innerText = index + 1;
    document.getElementById('cardCategory').innerText = card.category;
    document.getElementById('drugName').innerText = card.name || card.title;
    document.getElementById('drugName_back').innerText = card.name || card.title;
    
    document.getElementById('drugDosage').innerText = card.dosage || '-';
    document.getElementById('drugIndications').innerText = card.indications || '-';
    document.getElementById('drugContra').innerText = card.contraindications || '-';
    
    // КАРТИНКА (ГЛАВНЫЙ МОМЕНТ)
    let img = document.getElementById('drugImage');
    const ph = document.getElementById('imagePlaceholder');
    const container = img ? img.parentElement : null;
    
    if (container) {
        // Берем сырую ссылку из CSV
        const rawUrl = card.imageUrl || card.image;
        
        // Превращаем в "черный ход"
        const finalUrl = (typeof convertGoogleDriveUrl === 'function') 
            ? convertGoogleDriveUrl(rawUrl) 
            : rawUrl;
            
        console.log(`🖼️ [Image] ${card.name}: ${finalUrl}`); // Лог для проверки

        if (finalUrl && finalUrl.length > 10) {
            if (!img) {
                img = document.createElement('img');
                img.id = 'drugImage';
                container.insertBefore(img, ph);
            }
            
            img.style.display = 'block';
            img.src = finalUrl;
            img.setAttribute('referrerpolicy', 'no-referrer'); // ОБЯЗАТЕЛЬНО
            
            if (ph) ph.style.display = 'none';
        } else {
            if (img) img.style.display = 'none';
            if (ph) ph.style.display = 'flex';
        }
    }
}

// Функции переключения и грида
function flipCard() { const el = document.getElementById('flashcard'); if(el) el.classList.toggle('flipped'); }
function nextCard() { if (currentCardIndex < currentCards.length-1) { currentCardIndex++; showCard(currentCardIndex); } }
function prevCard() { if (currentCardIndex > 0) { currentCardIndex--; showCard(currentCardIndex); } }
function filterCards() { loadCards(document.getElementById('categoryFilter').value); }
function setCardView(v) { cardView = v; updateCardsUI(); }

function renderGrid() {
    const grid = document.getElementById('cardsGrid');
    if(!grid) return;
    grid.innerHTML = ''; // Очистка
    currentCards.forEach((c, idx) => {
        const div = document.createElement('div');
        div.style.border = '1px solid #ccc';
        div.style.padding = '10px';
        div.style.margin = '5px';
        div.innerText = c.name || c.title;
        div.onclick = () => { currentCardIndex = idx; setCardView('single'); };
        grid.appendChild(div);
    });
}
