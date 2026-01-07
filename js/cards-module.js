// ============================================
// МОДУЛЬ КАРТ (FINAL DISPLAY)
// ============================================
let currentCards = [];
let currentIndex = 0;
let isFlipped = false;

function initCardsModule() {
    console.log("💊 Init Cards...");
    // Берем данные из глобальной переменной
    const data = window.appData.drugs || window.appData.cards;
    
    if (!data || data.length === 0) {
        document.getElementById('flashcard').innerHTML = '<div style="padding:20px;text-align:center">Нет данных</div>';
        return;
    }
    
    currentCards = data;
    currentIndex = 0;
    populateCategories(data);
    showCard(0);
}

function populateCategories(data) {
    const cats = [...new Set(data.map(d => d.category))];
    const sel = document.getElementById('categoryFilter');
    if(!sel) return;
    sel.innerHTML = '<option value="all">Все</option>';
    cats.forEach(c => sel.innerHTML += `<option value="${c}">${c}</option>`);
}

function showCard(idx) {
    if(idx < 0 || idx >= currentCards.length) return;
    const card = currentCards[idx];
    
    // Тексты
    setText('drugName', card.title || card.name);
    setText('cardCategory', card.category);
    setText('cardIndex', idx + 1);
    setText('totalCards', currentCards.length);
    setText('drugName_back', card.title || card.name);
    setText('drugDosage', card.dosage);
    setText('drugIndications', card.indications);
    setText('drugForm_badge', card.form);

    // КАРТИНКА
    const img = document.getElementById('drugImage');
    const ph = document.getElementById('imagePlaceholder');
    const rawUrl = card.imageUrl || card.image;
    
    // Сбрасываем старое состояние
    if(img) img.style.display = 'none';
    if(ph) ph.style.display = 'flex';

    if (rawUrl && rawUrl.length > 5 && img) {
        // Конвертируем ссылку через app.js
        const finalUrl = (typeof convertGoogleDriveUrl === 'function') 
            ? convertGoogleDriveUrl(rawUrl) 
            : rawUrl;
            
        console.log(`Картинка: ${finalUrl}`); // Для проверки в консоли

        img.onload = function() {
            this.style.display = 'block';
            if(ph) ph.style.display = 'none';
        };
        
        img.setAttribute('referrerpolicy', 'no-referrer'); // ВАЖНО!
        img.src = finalUrl;
    }
    
    const cardEl = document.getElementById('flashcard');
    if(cardEl) cardEl.classList.remove('flipped');
    isFlipped = false;
}

function setText(id, text) {
    const el = document.getElementById(id);
    if(el) el.innerText = text || '-';
}

function flipCard() { 
    const el = document.getElementById('flashcard'); 
    if(el) { isFlipped = !isFlipped; el.classList.toggle('flipped'); }
}
function nextCard() { if(currentIndex < currentCards.length-1) showCard(++currentIndex); }
function prevCard() { if(currentIndex > 0) showCard(--currentIndex); }
function filterCards() {
    const val = document.getElementById('categoryFilter').value;
    const all = window.appData.drugs || window.appData.cards;
    currentCards = (val === 'all') ? all : all.filter(c => c.category === val);
    currentIndex = 0;
    showCard(0);
}
