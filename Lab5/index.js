// Глобальная переменная для хранения того, находимся ли мы в режиме редактирования
let editMode = false;

// Базовый шаблоный класс Block
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
// Блок хранения аватарки персонажа

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
        const avatarSrc = this.data.avatar || '';
        return `
            <h2>Аватар персонажа</h2>
            <img src="${avatarSrc}" alt="Аватар персонажа">
            ${editMode ? `<input type="file" onchange="updateAvatar('${this.id}', this)" accept="image/*">` : ''}
        `;
    }
}

// Инфомация о персонаже
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

// Характеристики
class StatsBlock extends Block {
    getContent() {
        let content = `<h2>Характеристики</h2>`;
        for (let stat in this.data) {
            content += `<p ${editMode ? `class="editable" onclick="editField('${this.id}', '${stat}')"` : ''}>${stat}: ${this.data[stat]}</p>`;
        }
        return content;
    }
}

// Инвентарь
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

// Кибер-импланты
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

// Загрузка блоков из localStorage
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
        // По умолчанию, если ничего не сохранено
        blocks = [
            new AvatarBlock('avatar-block', { avatar: null }),
            new CharacterInfoBlock('info-block', { name: 'Джонни Сильверхенд', role: 'Рокер', age: '32' }),
            new StatsBlock('stats-block', { 'Интеллект': 8, 'Рефлексы': 9, 'Харизма': 7 }),
            new InventoryBlock('inventory-block', { items: ['Пистолет', 'Кожаная куртка', 'Гитара'] })
        ];
        blocks.forEach(block => block.save());
    }
}

// Сохранение структуры блоков в localStorage
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


function addNewBlock() {
    if (!editMode) return;
	// Список доступных для создания блоков
    const blockTypes = ['avatar', 'info', 'stats', 'inventory', 'cyber-implants'];
    const type = prompt('Введите тип блока (avatar, info, stats, inventory, cyber-implants):');
    // Проверяем тип создаваемого блока на правильность
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


function removeBlock(blockId) {
    if (!editMode) return;
    if (confirm('Точно удалить этот блок?')) {
        blocks = blocks.filter(block => block.id !== blockId);
        localStorage.removeItem(blockId);
        saveBlocks();
        renderSheet();
    }
}


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

// Добавление элемента в блок типа списка
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

// Удаление элемента из блока типа списка
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

// Отрендерить всю карточку
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

// Сохранить текущее состояние
function saveState() {
    localStorage.setItem('editMode', JSON.stringify(editMode));
    saveBlocks();
}

// Загрузить последнее сохранённое состояние
function loadState() {
    const savedEditMode = localStorage.getItem('editMode');
    if (savedEditMode) {
        editMode = JSON.parse(savedEditMode);
    }
    loadBlocks();
    renderHeader(); 
    renderSheet(); 
}

// Костыль, без него кнопка редактирования срабатывает только один раз
function bindEvents() {
    const editButton = document.getElementById('edit-mode-toggle');
    editButton.removeEventListener('click', toggleEditMode);
    editButton.addEventListener('click', toggleEditMode);
}

// Включить / выключить режим редактирования
function toggleEditMode() {
    editMode = !editMode;
    renderHeader(); // Обновляем шапку, чтобы текст кнопки изменился
    renderSheet();
    saveState();
}

// Сброс карточки персонажа
function resetCharacter() {
    if (confirm('Точно сбросить персонажа? Все данные будут удалены.')) {
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