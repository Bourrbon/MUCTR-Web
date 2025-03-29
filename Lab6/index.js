// Глобальная переменная для хранения того, находимся ли мы в режиме редактирования
let editMode = false;

// Заглушки значений погоды
let weather = { temperature: 'N/A', condition: 'N/A' };

// Базовый шаблоный класс Block
class Block {
    constructor(id, data, serverId = null) {
        this.id = id; 
        this.serverId = serverId; // ID блока на сервере (для хранения с помощью JSONPlaceholder)
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

    // Сохранение на сервере (обновляем информацию через PUT)
    async save() {
        if (!this.serverId) {
            console.error(`Cannot save block ${this.id}: No serverId assigned`);
            return;
        }
        try {
            const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${this.serverId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: this.serverId,
                    title: this.getBlockType(),
                    body: JSON.stringify(this.data),
                    userId: 1,
                }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! error code: ${response.status}`);
            }
            const updatedData = await response.json();
            console.log(`Block ${this.id} updated on server:`, updatedData);
        } catch (error) {
            console.error(`Error saving block ${this.id} to server:`, error);
        }
    }

    getDefaultData() {
        return {};
    }

    getBlockType() {
        let type = this.constructor.name.toLowerCase().replace('block', '');
        if (type === 'cyberimplants') {
            type = 'cyber-implants';
        }
        return type;
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

    getDefaultData() {
        return { avatar: null };
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

    getDefaultData() {
        return { name: 'Джонни Сильверхэнд', role: 'Rockerboy', age: '32' };
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

    getDefaultData() {
        return { 'Интеллект': 8, 'Рефлексы': 9, 'Харизма': 7 };
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

    getDefaultData() {
        return { items: ['Пистолет', 'Кожаная куртка', 'Гитара'] };
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

    getDefaultData() {
        return { implants: ['sandevistan'] };
    }
}

function createBlock(type, id, data = null, serverId = null) {
    console.log(`Creating block with type: ${type}, id: ${id}, serverId: ${serverId}`);
    switch (type) {
        case 'avatar':
            return new AvatarBlock(id, data || { avatar: null }, serverId);
        case 'info':
            return new CharacterInfoBlock(id, data || { name: 'Новый персонаж', role: 'Неизвестно', age: '0' }, serverId);
        case 'stats':
            return new StatsBlock(id, data || { 'Интеллект': 5, 'Рефлексы': 5, 'Харизма': 5 }, serverId);
        case 'inventory':
            return new InventoryBlock(id, data || { items: [] }, serverId);
        case 'cyber-implants':
            return new CyberImplantsBlock(id, data || { implants: [] }, serverId);
        default:
            console.warn(`Unknown block type: ${type}`);
            return null;
    }
}

// Инициализация блоков
let blocks = [];

// Функция для получения случайной аватарки через Random User API
async function fetchRandomAvatar() {
    try {
        const response = await fetch('https://randomuser.me/api/');
        if (!response.ok) {
            throw new Error(`HTTP error! error code: ${response.status}`);
        }
        const data = await response.json();
        console.log("Random User API response:", data);
        const avatarUrl = data.results[0].picture.large;
        return avatarUrl;
    } catch (error) {
        console.error('Avatar fetch eror:', error);
        return '';
    }
}

// Получение данных о текущей погоде
async function fetchWeather() {
    try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=55.7558&longitude=37.6173&current=temperature_2m,weathercode');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Weather API response:", data);
        const weatherData = data.current;
        weather.temperature = weatherData.temperature_2m.toFixed(1); // Температура на высоте 2 м
        const weatherCode = weatherData.weathercode;
        weather.condition = getWeatherCondition(weatherCode);
    } catch (error) {
        console.error('Weather API fetch error:', error);
        weather = { temperature: 'N/A', condition: 'N/A' }; // Заглушка
    }
}

// Преобразовать код погоды в описание
function getWeatherCondition(code) {
    const weatherCodes = {
        0: 'Ясно',
        1: 'Переменная облачность',
        2: 'Облачно',
        3: 'Пасмурно',
        45: 'Туман',
        48: 'Изморозь',
        51: 'Лёгкий дождь',
        53: 'Дождь',
        55: 'Сильный дождь',
        61: 'Лёгкий снег',
        63: 'Снег',
        65: 'Сильный снег',
        71: 'Лёгкий снегопад',
        73: 'Снегопад',
        75: 'Сильный снегопад',
        95: 'Гроза',
        96: 'Гроза с градом'
    };
    return weatherCodes[code] || 'Неизвестно';
}

// Функция для рендеринга шапки
function renderHeader() {
    const header = document.getElementById('header');
    header.innerHTML = `
        <h1>Карточка персонажа Cyberpunk 2020</h1>
        <div class="weather">
            Погода в Москве: ${weather.temperature}°C, ${weather.condition}
        </div>
        <div class="header-buttons">
            <button id="edit-mode-toggle">${editMode ? 'Выключить режим редактирования' : 'Включить режим редактирования'}</button>
            <button onclick="resetCharacter()">Сбросить персонажа</button>
            <button onclick="exportCharacter()">Экспорт данных</button>
        </div>
    `;
    bindEvents();
}

// Функция для загрузки блоков с сервера
async function loadBlocks() {
    console.log("Starting loadBlocks...");
    try {
        
        const response = await fetch('https://jsonplaceholder.typicode.com/posts?userId=1');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const serverBlocks = await response.json();
        console.log("Blocks from server:", serverBlocks);

        // Список доступных для создания блоков
        const validBlockTypes = ['avatar', 'info', 'stats', 'inventory', 'cyber-implants'];

        // Проверяем тип создаваемого блока на правильность
        const blockData = serverBlocks.filter(block => {
            if (!block || !block.title || !validBlockTypes.includes(block.title)) {
                console.warn(`Invalid block from server:`, block);
                return false;
            }
            return true;
        });

        if (blockData.length > 0) {
            blocks = blockData.map(data => {
                let blockData;
                try {
                    blockData = JSON.parse(data.body);
                } catch (error) {
                    console.error(`Error parsing block data for serverId ${data.id}:`, error);
                    return null;
                }
                const block = createBlock(data.title, `${data.title}-block-${data.id}`, blockData, data.id);
                return block;
            }).filter(block => block !== null);
        } else {
            console.log("No blocks on server, creating default blocks");
            const avatarUrl = await fetchRandomAvatar();
            blocks = [
                new AvatarBlock('avatar-block', { avatar: avatarUrl }),
                new CharacterInfoBlock('info-block', { name: 'Джонни Сильверхенд', role: 'Рокер', age: '32' }),
                new StatsBlock('stats-block', { 'Интеллект': 8, 'Рефлексы': 9, 'Харизма': 7 }),
                new InventoryBlock('inventory-block', { items: ['Пистолет', 'Кожаная куртка', 'Гитара'] })
            ];
            // Сохраняем новые блоки на сервере
            for (const block of blocks) {
                await saveBlockToServer(block);
            }
            console.log("Default blocks created and saved to serer:", blocks);
        }

        let infoBlock = blocks.find(block => block instanceof CharacterInfoBlock);
        if (!infoBlock) {
            console.log("CharacterInfoBlock not found, creating");
            const infoBlockId = blocks.some(block => block.id === 'info-block') ? `info-block-${Date.now()}` : 'info-block';
            infoBlock = new CharacterInfoBlock(infoBlockId, { name: 'Джонни Сильверхенд', role: 'Рокер', age: '32' });
            blocks.push(infoBlock);
            await saveBlockToServer(infoBlock);
            console.log("Added CharacterInfoBlock:", infoBlock);
        }

        const avatarBlockIndex = blocks.findIndex(block => block instanceof AvatarBlock);
        const infoBlockIndex = blocks.findIndex(block => block instanceof CharacterInfoBlock);
        if (avatarBlockIndex !== -1 && infoBlockIndex !== -1 && infoBlockIndex !== avatarBlockIndex + 1) {
            const [infoBlock] = blocks.splice(infoBlockIndex, 1);
            blocks.splice(avatarBlockIndex + 1, 0, infoBlock);
            console.log("Reordered blocks: CharacterInfoBlock moved after AvatarBlock", blocks);
        }

		
		// Есил аватарки нет, запрашиваем с сервера
        const avatarBlock = blocks.find(block => block instanceof AvatarBlock);
        if (avatarBlock && !avatarBlock.data.avatar) {
            avatarBlock.data.avatar = await fetchRandomAvatar();
            await avatarBlock.save();
        }

        console.log("Final blocks after loadBlocks:", blocks);
    } catch (error) {
        console.error("Error loading blocks from server:", error);
		
        // Если не получилось запросить с сервера
        const avatarUrl = await fetchRandomAvatar();
        blocks = [
            new AvatarBlock('avatar-block', { avatar: avatarUrl }),
            new CharacterInfoBlock('info-block', { name: 'Джонни Сильверхенд', role: 'Рокер', age: '32' }),
            new StatsBlock('stats-block', { 'Интеллект': 8, 'Рефлексы': 9, 'Харизма': 7 }),
            new InventoryBlock('inventory-block', { items: ['Пистолет', 'Кожаная куртка', 'Гитара'] })
        ];
        for (const block of blocks) {
            await saveBlockToServer(block);
        }
    }
}

async function saveBlockToServer(block) {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: block.getBlockType(),
                body: JSON.stringify(block.data),
                userId: 1,
            }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const serverData = await response.json();
        block.serverId = serverData.id;
        console.log(`Block ${block.id} saved to server with serverId ${block.serverId}:`, serverData);
    } catch (error) {
        console.error(`Error saving block ${block.id} to server:`, error);
    }
}

async function addNewBlock() {
    if (!editMode) return;
    const blockTypes = ['avatar', 'info', 'stats', 'inventory', 'cyber-implants'];
    const type = prompt('Введите тип блока (avatar, info, stats, inventory, cyber-implants):');
    if (!blockTypes.includes(type)) {
        alert('Неверный тип блока!');
        return;
    }
    const id = `${type}-block-${Date.now()}`;
    const newBlock = createBlock(type, id);
    if (newBlock) {
        blocks.push(newBlock);
        await saveBlockToServer(newBlock); // Сохраняем новый блок на сервере
        renderSheet();
        renderHeader();
    }
}


async function removeBlock(blockId) {
    if (!editMode) return;
    if (confirm('Точно удалить этот блок?')) {
        const block = blocks.find(b => b.id === blockId);
        if (block && block.serverId) {
            try {
                const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${block.serverId}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                console.log(`Block ${blockId} deleted from server`);
            } catch (error) {
                console.error(`Error deleting block ${blockId} from server:`, error);
            }
        }
        blocks = blocks.filter(block => block.id !== blockId);
        renderSheet();
        renderHeader();
    }
}


async function updateAvatar(blockId, input) {
    const block = blocks.find(b => b.id === blockId);
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = async function(e) {
            block.data.avatar = e.target.result;
            await block.save();
            renderSheet();
            renderHeader();
        };
        reader.readAsDataURL(file);
    }
}


async function editField(blockId, field, index = null) {
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
    if (newValue) {
        await block.save();
        renderSheet();
        renderHeader();
    }
}

// Добавление элемента в блок типа спискок
async function addItem(blockId) {
    if (!editMode) return;
    const block = blocks.find(b => b.id === blockId);
    const field = block instanceof InventoryBlock ? 'items' : 'implants';
    const itemName = block instanceof InventoryBlock ? 'предмет' : 'имплант';
    const newItem = prompt(`Введите новый ${itemName}:`);
    if (newItem) {
        block.data[field].push(newItem);

        try {
            const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${block.serverId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    body: JSON.stringify(block.data),
                }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const updatedData = await response.json();
            console.log(`Block ${block.id} partially updated on server:`, updatedData);
        } catch (error) {
            console.error(`Error partially updating block ${block.id} on server:`, error);
        }
        renderSheet();
        renderHeader();
    }
}

// Удаление элемента из блока типа список
async function removeItem(blockId, index) {
    if (!editMode) return;
    const block = blocks.find(b => b.id === blockId);
    const field = block instanceof InventoryBlock ? 'items' : 'implants';
    const itemName = block instanceof InventoryBlock ? 'предмет' : 'имплант';
    if (confirm(`Точно удалить ${itemName} из списка?`)) {
        block.data[field].splice(index, 1);

        try {
            const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${block.serverId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    body: JSON.stringify(block.data),
                }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const updatedData = await response.json();
            console.log(`Block ${block.id} partially updated on server:`, updatedData);
        } catch (error) {
            console.error(`Error partially updating block ${block.id} on server:`, error);
        }
        renderSheet();
        renderHeader();
    }
}

// Отрендерить всю карточку
function renderSheet() {
    const sheet = document.getElementById('character-sheet');
    let html = '';
    console.log("Rendering sheet with blocks:", blocks);
    blocks.forEach(block => {
        const renderedBlock = block.render();
        console.log(`Rendering block ${block.id}:`, renderedBlock);
        html += renderedBlock;
    });
    if (editMode) {
        html += `<button class="add-block-btn" onclick="addNewBlock()">Добавить новый блок</button>`;
    }
    sheet.innerHTML = html;
}

// Сохранить текущее состояние
function saveState() {
    localStorage.setItem('editMode', JSON.stringify(editMode));
}

// Загрузить последнее сохранённое состояние
async function loadState() {
    const savedEditMode = localStorage.getItem('editMode');
    if (savedEditMode) {
        editMode = JSON.parse(savedEditMode);
    }
    await loadBlocks();
    await fetchWeather();
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
    renderHeader();
    renderSheet();
    saveState();
}

// Сброс карточки персонажа
async function resetCharacter() {
    if (confirm('Точно сбросить персонажа? Все данные в карточке будут сброшены.')) {
        // Удаляем созданные блоки с сервера
        for (const block of blocks) {
            if (block.serverId) {
                try {
                    await fetch(`https://jsonplaceholder.typicode.com/posts/${block.serverId}`, {
                        method: 'DELETE',
                    });
                } catch (error) {
                    console.error(`Error deleting block ${block.id} during reset:`, error);
                }
            }
        }

		// Заполнить сброшенную карточку случайными данными
        try {
            const userResponse = await fetch('https://randomuser.me/api/');
            const userData = await userResponse.json();
            const user = userData.results[0];
            const randomName = `${user.name.first} ${user.name.last}`;
            const randomAge = user.dob.age;
            const avatarUrl = user.picture.large;

            blocks = [
                new AvatarBlock('avatar-block', { avatar: avatarUrl }),
                new CharacterInfoBlock('info-block', { name: randomName, role: 'Рокер', age: randomAge.toString() }),
                new StatsBlock('stats-block', { 'Интеллект': 8, 'Рефлексы': 9, 'Харизма': 7 }),
                new InventoryBlock('inventory-block', { items: ['Пистолет', 'Кожаная куртка', 'Гитара'] })
            ];
            for (const block of blocks) {
                await saveBlockToServer(block);
            }
            editMode = false;
            renderHeader();
            renderSheet();
            saveState();
        } catch (error) {
            console.error('Character reset error:', error);
            alert('Не удалось получить данные с сервера, заданы значения по уммолчанию');
            blocks = [
                new AvatarBlock('avatar-block', { avatar: null }),
                new CharacterInfoBlock('info-block', { name: 'Джонни Сильверхенд', role: 'Рокер', age: '32' }),
                new StatsBlock('stats-block', { 'Интеллект': 8, 'Рефлексы': 9, 'Харизма': 7 }),
                new InventoryBlock('inventory-block', { items: ['Пистолет', 'Кожаная куртка', 'Гитара'] })
            ];
            for (const block of blocks) {
                await saveBlockToServer(block);
            }
            editMode = false;
            renderHeader();
            renderSheet();
            saveState();
        }
    }
}

// Экспорт данных персонажа
function exportCharacter() {
    const data = {};
    blocks.forEach(block => {
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
    renderHeader();
}

// Загрузка страницы
window.onload = () => {
    loadState();
};