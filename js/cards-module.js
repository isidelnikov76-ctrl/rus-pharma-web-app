// ============================================
// МОДУЛЬ ФЛЭШ-КАРТ (COMPATIBLE)
// ============================================

let currentCards = [];
let currentCardIndex = 0;
let isCardFlipped = false;
let cardView = 'single'; 
let cardStats = { know: 0, repeat: 0 };

function initCardsModule() {
    console.log("💊 [Cards] Init...");
    loadCardStats();
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

function quitCardsModule() {
    resetCardsState();
    const catSelect = document.getElementById('categoryFilter');
    if (catSelect) catSelect.value = 'all';
    showSection('menu');
}

function injectExitButton() {
    const container = document.getElementById('singleCardView');
    if (!container) return;
    const existingBtn = document.getElementById('btnExitCards');
    if (existingBtn) existingBtn.remove();
    const exitBtn = document.createElement('button');
    exitBtn.id = 'btnExitCards';
    exitBtn.innerHTML = '🏠 В меню';
    exitBtn.onclick = quitCardsModule;
    Object.assign(exitBtn.style, {
        display: 'block', width: '100%', marginTop: '20px', marginBottom: '20px', padding: '15px',
        background: '#f8f9fa', color: '#666', border: '1px solid #ddd', borderRadius: '10px',
        fontSize: '16px', cursor: 'pointer', fontWeight: 'bold', textAlign: 'center'
    });
    container.appendChild(exitBtn);
}

function populateCategories() {
    // Поддержка и drugs, и cards
    const sourceData = window.appData.drugs || window.appData.cards;
    if (!sourceData) return;

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
    if (!sourceData || sourceData.length === 0) {
        const flashcardEl = document.getElementById('flashcard');
        if (flashcardEl) flashcardEl.innerHTML = '<div style="padding:20px; text-align:center;">Нет данных</div>';
        return;
    }

    if (category === 'all') currentCards = [...sourceData];
    else currentCards = sourceData.filter(d => d.category === category);
    
    currentCardIndex = 0; isCardFlipped = false;
    updateCardsUI();
}

function filterCards() {
    loadCards(document.getElementById('categoryFilter').value);
}

function setCardView(view) {
    cardView = view;
    const btnSingle = document.getElementById('viewSingle');
    const btnGrid = document.getElementById('viewGrid');
    if (btnSingle) btnSingle.classList.toggle('active', view === 'single');
    if (btnGrid) btnGrid.classList.toggle('active', view === 'grid');
    updateCardsUI();
}

function updateCardsUI() {
    const totalEl = document.getElementById('totalCards');
    if (totalEl) totalEl.textContent = currentCards.length;
    updateCardsProgressBar();
    if (currentCards.length === 0) return;

    const singleView = document.getElementById('singleCardView');
    const gridView = document.getElementById('gridCardView');

    if (cardView === 'single') {
        if (singleView) singleView.style.display = 'block';
        if (gridView) gridView.style.display = 'none';
        showCard(currentCardIndex);
        setTimeout(injectExitButton, 50); 
    } else {
        if (singleView) singleView.style.display = 'none';
        if (gridView) gridView.style.display = 'block';
        renderGrid();
    }
}

function updateCardsProgressBar() {
    const total = currentCards.length;
    const progressFill = document.getElementById('cardsProgressFill');
    if (total === 0 || !progressFill) return;
    const percent = ((currentCardIndex + 1) / total) * 100;
    progressFill.style.width = `${percent}%`;
}

function showCard(index) {
    if (index < 0 || index >= currentCards.length) return;
    const card = currentCards[index];
    const cardEl = document.getElementById('flashcard');
    if (cardEl) cardEl.classList.remove('flipped');
    isCardFlipped = false;
    
    document.getElementById('cardIndex').textContent = index + 1;
    document.getElementById('cardCategory').textContent = card.category;
    document.getElementById('drugName').textContent = card.name || card.title;
    const innEl = document.getElementById('drugINN_front');
    if (innEl) innEl.textContent = card.subtitle || card.inn || '';
    
    // --- КАРТИНКА ---
    let img = document.getElementById('drugImage');
    const placeholder = document.getElementById('imagePlaceholder');
    const imgContainer = img ? img.parentElement : null;

    if (imgContainer) {
        // Берем сырую ссылку
        const rawUrl = card.imageUrl || card.image || card.url || card['Фото_URL'];
        
        // Конвертируем через "черный ход"
        const directUrl = (typeof convertGoogleDriveUrl === 'function') 
            ? convertGoogleDriveUrl(rawUrl) 
            : rawUrl;

        if (directUrl && directUrl.length > 5) {
            if (!img) {
                img = document.createElement('img');
                img.id = 'drugImage';
                imgContainer.insertBefore(img, placeholder);
            }
            img.alt = card.name;
            // Разрешаем загрузку с гугла
            img.setAttribute('referrerpolicy', 'no-referrer');
            img.src = directUrl;
            
            Object.assign(img.style, {
                display: 'block', maxWidth: '100%', maxHeight: '220px', objectFit: 'contain',
                borderRadius: '8px', margin: '10px auto', cursor: 'pointer'
            });
            
            img.onclick = (e) => {
                e.stopPropagation();
                if (typeof openImageModal === 'function') openImageModal(directUrl);
            };
            img.onerror = function() {
                this.style.display = 'none';
                if (placeholder) { placeholder.style.display = 'flex'; placeholder.textContent = '❌'; }
            };
            if (placeholder) placeholder.style.display = 'none';
        } else {
            if (img) img.style.display = 'none';
            if (placeholder) {
                placeholder.style.display = 'flex';
                placeholder.textContent = (typeof getCategoryIcon === 'function') ? getCategoryIcon(card.category) : '💊';
            }
        }
    }

    document.getElementById('drugName_back').textContent = card.name || card.title;
    const badgeEl = document.getElementById('drugForm_badge');
    if (badgeEl) badgeEl.textContent = card.form;
    document.getElementById('drugDosage').textContent = card.dosage || '-';
    document.getElementById('drugIndications').textContent = card.indications || '-';
    document.getElementById('drugContra').textContent = card.contraindications || '-';
    document.getElementById('drugSideEffects').textContent = card.sideEffects || '-';
    document.getElementById('drugField').textContent = card.fieldNote || card.fieldNotes || '-';
}

function renderGrid() {
    const grid = document.getElementById('cardsGrid');
    if (!grid) return;
    const sourceData = window.appData.drugs || window.appData.cards || [];
    const results = JSON.parse(localStorage.getItem('cardResults') || '[]');
    const totalLearned = results.filter(r => r.status === 'know').length;
    
    grid.innerHTML = `<div style="padding:10px;text-align:center">Всего: ${sourceData.length}, Изучено: ${totalLearned}</div><div id="gridItemsContainer" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;"></div>`;
    const container = document.getElementById('gridItemsContainer');

    currentCards.forEach((card, index) => {
        const item = document.createElement('div');
        item.className = 'grid-card-item';
        Object.assign(item.style, { border: '2px solid #eee', borderRadius: '10px', padding: '15px', textAlign: 'center', background: 'white', cursor: 'pointer' });
        item.innerHTML = `<div>${getCategoryIcon(card.category)}</div><h4>${card.name || card.title}</h4>`;
        item.onclick = () => { currentCardIndex = index; setCardView('single'); };
        container.appendChild(item);
    });

    const exitBtn = document.createElement('button');
    exitBtn.innerHTML = "🏠 В меню"; exitBtn.onclick = quitCardsModule;
    Object.assign(exitBtn.style, { gridColumn: "1 / -1", marginTop: "20px", padding: "15px", background: "white", border: "1px solid #ccc", borderRadius: "10px", cursor: "pointer" });
    container.appendChild(exitBtn);
}

function flipCard() { const card = document.getElementById('flashcard'); if (card) { card.classList.toggle('flipped'); isCardFlipped = !isCardFlipped; } }
function nextCard() { if (currentCardIndex < currentCards.length - 1) { currentCardIndex++; showCard(currentCardIndex); updateCardsProgressBar(); } else { alert('🎉 Конец!'); } }
function prevCard() { if (currentCardIndex > 0) { currentCardIndex--; showCard(currentCardIndex); updateCardsProgressBar(); } }
function markCard(status) {
    const currentDrug = currentCards[currentCardIndex];
    const results = JSON.parse(localStorage.getItem('cardResults') || '[]');
    const id = currentDrug.id || currentDrug.name;
    const newResults = results.filter(r => r.drugId !== id);
    newResults.push({ drugId: id, status: status, timestamp: Date.now() });
    localStorage.setItem('cardResults', JSON.stringify(newResults));
    loadCardStats();
    setTimeout(() => nextCard(), 200);
}
function getCategoryIcon(category) { const icons = { 'Антибиотики': '💊', 'Анальгетики': '💉', 'Антидоты': '🧪', 'Экстренные': '⚡', 'Антигистаминные': '🌸', 'Инструменты': '✂️', 'Расходники': '🩹', 'default': '💊' }; return icons[category] || icons['default']; }
function loadCardStats() {
    const results = JSON.parse(localStorage.getItem('cardResults') || '[]');
    cardStats.know = results.filter(r => r.status === 'know').length;
    cardStats.repeat = results.filter(r => r.status === 'dontknow').length;
    const knowEl = document.getElementById('knowCount');
    const repeatEl = document.getElementById('repeatCount');
    if (knowEl) knowEl.textContent = cardStats.know;
    if (repeatEl) repeatEl.textContent = cardStats.repeat;
}
