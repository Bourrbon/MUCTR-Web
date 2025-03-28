// Глобальная переменная для режима редактирования
let editMode = false;

// Базовый класс Block
class Block {
    constructor(id, data) {
        this.id = id;
        this.data = data;
    }

    render() {
        return `
            <div class="block" id="${this.id}">
                ${this.getContent()}
                ${editMode ? `<button class="delete-block-btn" onclick="removeBlock('${this.id}')">Удалить блок</button>` : ''}
            </div>
        `;
    }

    getContent() {
        return '';
    }

    save() {
        localStorage.setItem(this.id, JSON.stringify(this.data));
    }

    load() {
        const savedData = localStorage.getItem(this.id);
        if (savedData) {
            this.data = JSON.parse(savedData);
        }
    }
}

// Класс для блока аватарки
class AvatarBlock extends Block {
    render() {
        return `
            <div class="block avatar-block" id="${this.id}">
                ${this.getContent()}
                ${editMode ? `<button class="delete-block-btn" onclick="removeBlock('${this.id}')">Удалить блок</button>` : ''}
            </div>
        `;
    }

    getContent() {
        const avatarSrc = this.data.avatar || 'https://via.placeholder.com/150';
        return `
            <h2>Аватар персонажа</h2>
            <img src="${avatarSrc}" alt="Аватар персонажа">
            ${editMode ? `<input type="file" onchange="updateAvatar('${this.id}', this)" accept="image/*">` : ''}
        `;
    }
}

// Класс для блока информации о персонаже
class CharacterInfoBlock extends Block {
    getContent() {
        return `
            <h2>Информация о персонаже</h2>
            <p ${editMode ? `class="editable" onclick="editField('${this.id}', 'name')"` : ''}>Имя: ${this.data.name}</p>
            <p ${editMode ? `class="editable" onclick="editField('${this.id}', 'role')"` : ''}>Роль: ${this.data.role}</p>
            <p ${editMode ? `class="editable" onclick="editField('${this.id}', 'age')"` : ''}>Возраст: ${this.data.age}</p>
        `;
    }
}

// Класс для блока характеристик
class StatsBlock extends Block {
    getContent() {
        let content = `<h2>Характеристики</h2>`;
        for (let stat in this.data) {
            content += `<p ${editMode ? `class="editable" onclick="editField('${this.id}', '${stat}')"` : ''}>${stat}: ${this.data[stat]}</p>`;
        }
        return content;
    }
}

// Класс для блока инвентаря
class InventoryBlock extends Block {
    getContent() {
        let content = `<h2>Инвентарь</h2><ul>`;
        this.data.items.forEach((item, index) => {
            content += `
                <li class="inventory-item">
                    <span ${editMode ? `class="editable" onclick="editField('${this.id}', 'items', ${index})"` : ''}>${item}</span>
                    ${editMode ? `<button onclick="removeItem('${this.id}', ${index})">Удалить</button>` : ''}
                </li>`;
        });
        content += `</ul>${editMode ? `<button onclick="addItem('${this.id}')">Добавить предмет</button>` : ''}`;
        return content;
    }
}

// Класс для блока кибер-имплантов
class CyberImplantsBlock extends Block {
    getContent() {
        let content = `<h2>Кибер-импланты</h2><ul>`;
        this.data.implants.forEach((implant, index) => {
            content += `
                <li class="cyber-implant-item">
                    <span ${editMode ? `class="editable" onclick="editField('${this.id}', 'implants', ${index})"` : ''}>${implant}</span>
                    ${editMode ? `<button onclick="removeItem('${this.id}', ${index})">Удалить</button>` : ''}
                </li>`;
        });
        content += `</ul>${editMode ? `<button onclick="addItem('${this.id}')">Добавить имплант</button>` : ''}`;
        return content;
    }
}

// Функция для создания нового блока
function createBlock(type, id) {
    switch (type) {
        case 'avatar':
            return new AvatarBlock(id, { avatar: null });
        case 'info':
            return new CharacterInfoBlock(id, { name: 'Новый персонаж', role: 'Неизвестно', age: '0' });
        case 'stats':
            return new StatsBlock(id, { 'Интеллект': 5, 'Рефлексы': 5, 'Харизма': 5 });
        case 'inventory':
            return new InventoryBlock(id, { items: [] });
        case 'cyber-implants':
            return new CyberImplantsBlock(id, { implants: [] });
        default:
            return null;
    }
}

// Инициализация блоков
let blocks = [];

// Функция для рендеринга шапки
function renderHeader() {
    const header = document.getElementById('header');
    header.innerHTML = `
        <h1>Карточка персонажа Cyberpunk 2020</h1>
        <div class="header-buttons">
            <button id="edit-mode-toggle">${editMode ? 'Выключить режим редактирования' : 'Включить режим редактирования'}</button>
            <button onclick="resetCharacter()">Сбросить персонажа</button>
            <button onclick="exportCharacter()">Экспорт данных</button>
        </div>
    `;
    bindEvents(); // Привязываем события после рендеринга
}

// Функция для загрузки блоков из localStorage
function loadBlocks() {
    const savedBlocks = localStorage.getItem('blocks');
    if (savedBlocks) {
        const blockData = JSON.parse(savedBlocks);
        blocks = blockData.map(data => {
            const block = createBlock(data.type, data.id);
            if (block) {
                block.load();
            }
            return block;
        }).filter(block => block !== null);
    } else {
        // Инициализация по умолчанию, если ничего не сохранено
        blocks = [
            new AvatarBlock('avatar-block', { avatar: null }),
            new CharacterInfoBlock('info-block', { name: 'Джонни Сильверхенд', role: 'Рокер', age: '32' }),
            new StatsBlock('stats-block', { 'Интеллект': 8, 'Рефлексы': 9, 'Харизма': 7 }),
            new InventoryBlock('inventory-block', { items: ['Пистолет', 'Кожаная куртка', 'Гитара'] })
        ];
        blocks.forEach(block => block.save());
    }
}

// Функция для сохранения структуры блоков в localStorage
function saveBlocks() {
    const blockData = blocks.map(block => {
        let type = block.constructor.name.toLowerCase().replace('block', '');
        if (type === 'cyberimplants') {
            type = 'cyber-implants';
        }
        return {
            type: type,
            id: block.id
        };
    });
    localStorage.setItem('blocks', JSON.stringify(blockData));
}

// Функция для добавления нового блока
function addNewBlock() {
    if (!editMode) return;
    const blockTypes = ['avatar', 'info', 'stats', 'inventory', 'cyber-implants'];
    const type = prompt('Введите тип блока (avatar, info, stats, inventory, cyber-implants):');
    if (!blockTypes.includes(type)) {
        alert('Неверный тип блока!');
        return;
    }
    const id = `${type}-block-${Date.now()}`; // Уникальный ID для нового блока
    const newBlock = createBlock(type, id);
    if (newBlock) {
        blocks.push(newBlock);
        newBlock.save();
        saveBlocks();
        renderSheet();
    }
}

// Функция для удаления блока
function removeBlock(blockId) {
    if (!editMode) return;
    if (confirm('Вы уверены, что хотите удалить этот блок?')) {
        blocks = blocks.filter(block => block.id !== blockId);
        localStorage.removeItem(blockId);
        saveBlocks();
        renderSheet();
    }
}

// Функция для обновления аватарки
function updateAvatar(blockId, input) {
    const block = blocks.find(b => b.id === blockId);
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            block.data.avatar = e.target.result;
            block.save();
            renderSheet();
        };
        reader.readAsDataURL(file);
    }
}

// Функция для редактирования полей
function editField(blockId, field, index = null) {
    if (!editMode) return;
    const block = blocks.find(b => b.id === blockId);
    let newValue;
    if (index !== null) {
        newValue = prompt(`Введите новое значение для ${field}[${index}]:`, block.data[field][index]);
        if (newValue) block.data[field][index] = newValue;
    } else {
        newValue = prompt(`Введите новое значение для ${field}:`, block.data[field]);
        if (newValue) block.data[field] = newValue;
    }
    block.save();
    renderSheet();
}

// Функция для добавления элемента (предмета или импланта)
function addItem(blockId) {
    if (!editMode) return;
    const block = blocks.find(b => b.id === blockId);
    const field = block instanceof InventoryBlock ? 'items' : 'implants';
    const itemName = block instanceof InventoryBlock ? 'предмет' : 'имплант';
    const newItem = prompt(`Введите новый ${itemName}:`);
    if (newItem) {
        block.data[field].push(newItem);
        block.save();
        renderSheet();
    }
}

// Функция для удаления элемента (предмета или импланта)
function removeItem(blockId, index) {
    if (!editMode) return;
    const block = blocks.find(b => b.id === blockId);
    const field = block instanceof InventoryBlock ? 'items' : 'implants';
    const itemName = block instanceof InventoryBlock ? 'предмет' : 'имплант';
    if (confirm(`Вы уверены, что хотите удалить этот ${itemName}?`)) {
        block.data[field].splice(index, 1);
        block.save();
        renderSheet();
    }
}

// Функция для рендеринга всей карточки
function renderSheet() {
    const sheet = document.getElementById('character-sheet');
    let html = '';
    blocks.forEach(block => {
        block.load();
        html += block.render();
    });
    if (editMode) {
        html += `<button class="add-block-btn" onclick="addNewBlock()">Добавить новый блок</button>`;
    }
    sheet.innerHTML = html;
}

// Функция для сохранения состояния
function saveState() {
    localStorage.setItem('editMode', JSON.stringify(editMode));
    saveBlocks();
}

// Функция для загрузки состояния
function loadState() {
    const savedEditMode = localStorage.getItem('editMode');
    if (savedEditMode) {
        editMode = JSON.parse(savedEditMode);
    }
    loadBlocks();
    renderHeader(); // Рендерим шапку
    renderSheet(); // Рендерим карточку
}

// Функция для привязки событий
function bindEvents() {
    const editButton = document.getElementById('edit-mode-toggle');
    editButton.removeEventListener('click', toggleEditMode);
    editButton.addEventListener('click', toggleEditMode);
}

// Функция для переключения режима редактирования
function toggleEditMode() {
    editMode = !editMode;
    renderHeader(); // Обновляем шапку, чтобы текст кнопки изменился
    renderSheet();
    saveState();
}

// Сброс персонажа
function resetCharacter() {
    if (confirm('Вы уверены, что хотите сбросить персонажа? Все данные будут удалены.')) {
        localStorage.clear();
        blocks = [
            new AvatarBlock('avatar-block', { avatar: null }),
            new CharacterInfoBlock('info-block', { name: 'Джонни Сильверхенд', role: 'Рокер', age: '32' }),
            new StatsBlock('stats-block', { 'Интеллект': 8, 'Рефлексы': 9, 'Харизма': 7 }),
            new InventoryBlock('inventory-block', { items: ['Пистолет', 'Кожаная куртка', 'Гитара'] })
        ];
        blocks.forEach(block => block.save());
        editMode = false;
        renderHeader();
        renderSheet();
        saveState();
    }
}

// Экспорт данных персонажа
function exportCharacter() {
    const data = {};
    blocks.forEach(block => {
        block.load();
        data[block.id] = block.data;
    });
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'character-data.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Загрузка страницы
window.onload = () => {
    loadState();
};