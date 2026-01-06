// ============================================
// МОДУЛЬ ФЛЭШ-КАРТ (FULL DEBUG VERSION)
// ============================================

let currentCards = [];
let currentCardIndex = 0;
let isCardFlipped = false;
let cardView = 'single'; 
let cardStats = { know: 0, repeat: 0 };

// Инициализация модуля
function initCardsModule() {
    console.log("💊 [Cards] Инициализация модуля...");
    loadCardStats();
    populateCategories();
    
    // Сброс в начало
    resetCardsState();
    loadCards('all');
}

// Функция полного сброса состояния
function resetCardsState() {
    currentCardIndex = 0;
    isCardFlipped = false;
    cardView = 'single';
    
    // Сбрасываем переворот карты визуально
    const cardEl = document.getElementById('flashcard');
    if (cardEl) cardEl.classList.remove('flipped');
}

// Функция ВЫХОДА (Сброс + Меню)
function quitCardsModule() {
    resetCardsState();
    
    // Сбрасываем фильтр категорий на "Все"
    const catSelect = document.getElementById('categoryFilter');
    if (catSelect) catSelect.value = 'all';
    
    // Возвращаемся в меню
    showSection('menu');
}

// Программное добавление кнопки "В меню"
function injectExitButton() {
    const container = document.getElementById('singleCardView');
    if (!container) return;

    // Удаляем старую кнопку, если есть
    const existingBtn = document.getElementById('btnExitCards');
    if (existingBtn) existingBtn.remove();

    // Создаем новую
    const exitBtn = document.createElement('button');
    exitBtn.id = 'btnExitCards';
    exitBtn.innerHTML = '🏠 В меню';
    exitBtn.onclick = quitCardsModule;
    
    Object.assign(exitBtn.style, {
        display: 'block',
        width: '100%',
        marginTop: '20px',
        marginBottom: '20px',
        padding: '15px',
        background: '#f8f9fa',
        color: '#666',
        border: '1px solid #ddd',
        borderRadius: '10px',
        fontSize: '16px',
        cursor: 'pointer',
        fontWeight: 'bold',
        textAlign: 'center'
    });
    
    container.appendChild(exitBtn);
}

function populateCategories() {
    // Используем window.appData (глобальный объект)
    if (!window.appData || !window.appData.drugs) return;

    const categories = [...new Set(window.appData.drugs.map(d => d.category))];
    const select = document.getElementById('categoryFilter');
    
    if (!select) return;

    while (select.options.length > 1) {
        select.remove(1);
    }
    
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
}

function loadCards(category = 'all') {
    const data = window.appData;
    if (!data || !data.drugs || data.drugs.length === 0) {
        const flashcardEl = document.getElementById('flashcard');
        if (flashcardEl) flashcardEl.innerHTML = '<div style="padding:20px; text-align:center;">Нет данных</div>';
        return;
    }

    if (category === 'all') {
        currentCards = [...data.drugs];
    } else {
        currentCards = data.drugs.filter(d => d.category === category);
    }
    
    currentCardIndex = 0;
    isCardFlipped = false;
    updateCardsUI();
}

function filterCards() {
    const category = document.getElementById('categoryFilter').value;
    loadCards(category);
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

// === ОТРИСОВКА ОДНОЙ КАРТЫ С ЛОГАМИ ===
function showCard(index) {
    if (index < 0 || index >= currentCards.length) return;
    
    const card = currentCards[index];
    
    // --- ЛОГИРОВАНИЕ ---
    console.group(`🃏 Карта #${index + 1}: ${card.name || card.title}`);
    console.log("Данные карты:", card);
    
    const cardEl = document.getElementById('flashcard');
    
    if (cardEl) cardEl.classList.remove('flipped');
    isCardFlipped = false;
    
    document.getElementById('cardIndex').textContent = index + 1;
    document.getElementById('cardCategory').textContent = card.category;
    document.getElementById('drugName').textContent = card.name;
    
    const innEl = document.getElementById('drugINN_front');
    if (innEl) innEl.textContent = card.inn || card.subtitle || '';
    
    // --- КАРТИНКА ---
    let img = document.getElementById('drugImage');
    const placeholder = document.getElementById('imagePlaceholder');
    const imgContainer = img ? img.parentElement : null;

    if (imgContainer) {
        // Проверяем все возможные поля
        const rawUrl = card.imageUrl || card.image || card.url || card['Фото_URL'];
        console.log("🔗 Сырая ссылка:", rawUrl);

        const directUrl = (typeof convertGoogleDriveUrl === 'function') 
            ? convertGoogleDriveUrl(rawUrl) 
            : rawUrl;
            
        console.log("🚀 Обработанная ссылка:", directUrl);

        if (directUrl && directUrl.length > 5) {
            // Если картинки нет - создаем
            if (!img) {
                img = document.createElement('img');
                img.id = 'drugImage';
                imgContainer.insertBefore(img, placeholder);
            }

            img.alt = card.name || card.title;
            img.setAttribute('referrerpolicy', 'no-referrer'); // Хак для Google Drive
            img.src = directUrl;
            
            Object.assign(img.style, {
                display: 'block',
                maxWidth: '100%',
                maxHeight: '220px',
                objectFit: 'contain',
                borderRadius: '8px',
                margin: '10px auto'
            });
            
            // Зум
            img.onclick = (e) => {
                e.stopPropagation();
                if (typeof openImageModal === 'function') openImageModal(directUrl);
            };

            // Ошибка загрузки
            img.onerror = function() {
                console.error("❌ Не удалось загрузить картинку:", directUrl);
                this.style.display = 'none';
                if (placeholder) {
                    placeholder.style.display = 'flex';
                    placeholder.textContent = '❌'; 
                }
            };
            
            // Успех
            img.onload = function() {
                console.log("✅ Картинка отрисована успешно");
            };

            if (placeholder) placeholder.style.display = 'none';
            
        } else {
            console.warn("⚠️ Ссылка на картинку пустая или слишком короткая");
            if (img) img.style.display = 'none';
            if (placeholder) {
                placeholder.style.display = 'flex';
                placeholder.textContent = (typeof getCategoryIcon === 'function') ? getCategoryIcon(card.category) : '💊';
            }
        }
    }
    console.groupEnd();

    // Обратная сторона
    document.getElementById('drugName_back').textContent = card.name;
    const badgeEl = document.getElementById('drugForm_badge');
    if (badgeEl) badgeEl.textContent = card.form;
    
    document.getElementById('drugDosage').textContent = card.dosage;
    document.getElementById('drugIndications').textContent = card.indications;
    document.getElementById('drugContra').textContent = card.contraindications;
    document.getElementById('drugSideEffects').textContent = card.sideEffects;
    document
