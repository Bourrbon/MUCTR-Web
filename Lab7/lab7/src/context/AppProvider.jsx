import React, { useState, useEffect } from 'react';
import { AppContext } from './AppContext';
import { fetchRandomAvatar, fetchWeather, saveBlockToServer } from '../services/api';

const AppProvider = ({ children }) => {
  const [editMode, setEditMode] = useState(false);
  const [blocks, setBlocks] = useState([]);
  const [weather, setWeather] = useState({ temperature: 'N/A', condition: 'N/A' });

  const validBlockTypes = ['avatar', 'info', 'stats', 'inventory', 'cyber-implants'];

  const createBlock = (type, id, data = null, serverId = null) => {
    const defaultData = {
      avatar: { avatar: null },
      info: { name: 'Новый персонаж', role: 'Неизвестно', age: '0' },
      stats: { 'Интеллект': 5, 'Рефлексы': 5, 'Харизма': 5 },
      inventory: { items: [] },
      'cyber-implants': { implants: [] },
    };

    return {
      id,
      type,
      serverId,
      data: data || defaultData[type] || {},
    };
  };

  const loadBlocks = async () => {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts?userId=1');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const serverBlocks = await response.json();

      const blockData = serverBlocks.filter(
        (block) => block && block.title && validBlockTypes.includes(block.title)
      );

      let newBlocks = [];
      if (blockData.length > 0) {
        newBlocks = blockData
          .map((data) => {
            try {
              const blockData = JSON.parse(data.body);
              return createBlock(data.title, `${data.title}-block-${data.id}`, blockData, data.id);
            } catch (error) {
              console.error(`Error parsing block data for serverId ${data.id}:`, error);
              return null;
            }
          })
          .filter((block) => block !== null);
      } else {
        const avatarUrl = await fetchRandomAvatar();
        newBlocks = [
          createBlock('avatar', 'avatar-block', { avatar: avatarUrl }),
          createBlock('info', 'info-block', { name: 'Джонни Сильверхенд', role: 'Рокер', age: '32' }),
          createBlock('stats', 'stats-block', { 'Интеллект': 8, 'Рефлексы': 9, 'Харизма': 7 }),
          createBlock('inventory', 'inventory-block', { items: ['Пистолет', 'Кожаная куртка', 'Гитара'] }),
        ];
        for (const block of newBlocks) {
          await saveBlockToServer(block);
        }
      }

      let infoBlock = newBlocks.find((block) => block.type === 'info');
      if (!infoBlock) {
        const infoBlockId = newBlocks.some((block) => block.id === 'info-block')
          ? `info-block-${Date.now()}`
          : 'info-block';
        infoBlock = createBlock('info', infoBlockId, {
          name: 'Джонни Сильверхенд',
          role: 'Рокер',
          age: '32',
        });
        newBlocks.push(infoBlock);
        await saveBlockToServer(infoBlock);
      }

      const avatarBlockIndex = newBlocks.findIndex((block) => block.type === 'avatar');
      const infoBlockIndex = newBlocks.findIndex((block) => block.type === 'info');
      if (avatarBlockIndex !== -1 && infoBlockIndex !== -1 && infoBlockIndex !== avatarBlockIndex + 1) {
        const [infoBlock] = newBlocks.splice(infoBlockIndex, 1);
        newBlocks.splice(avatarBlockIndex + 1, 0, infoBlock);
      }

      const avatarBlock = newBlocks.find((block) => block.type === 'avatar');
      if (avatarBlock && !avatarBlock.data.avatar) {
        avatarBlock.data.avatar = await fetchRandomAvatar();
        await updateBlockOnServer(avatarBlock);
      }

      setBlocks(newBlocks);
    } catch (error) {
      console.error('Error loading blocks from server:', error);
      const avatarUrl = await fetchRandomAvatar();
      const defaultBlocks = [
        createBlock('avatar', 'avatar-block', { avatar: avatarUrl }),
        createBlock('info', 'info-block', { name: 'Джонни Сильверхенд', role: 'Рокер', age: '32' }),
        createBlock('stats', 'stats-block', { 'Интеллект': 8, 'Рефлексы': 9, 'Харизма': 7 }),
        createBlock('inventory', 'inventory-block', { items: ['Пистолет', 'Кожаная куртка', 'Гитара'] }),
      ];
      for (const block of defaultBlocks) {
        await saveBlockToServer(block);
      }
      setBlocks(defaultBlocks);
    }
  };

  const updateBlockOnServer = async (block) => {
    if (!block.serverId) return;
    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${block.serverId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: block.serverId,
          title: block.type,
          body: JSON.stringify(block.data),
          userId: 1,
        }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
      console.error(`Error updating block ${block.id} on server:`, error);
    }
  };

  const loadWeather = async () => {
    try {
      const data = await fetchWeather();
      setWeather({
        temperature: data.current.temperature_2m.toFixed(1),
        condition: data.current.weathercode,
      });
    } catch (error) {
      console.error('Weather API fetch error:', error);
      setWeather({ temperature: 'N/A', condition: 'N/A' });
    }
  };

  const toggleEditMode = () => {
    setEditMode((prev) => {
      const newEditMode = !prev;
      localStorage.setItem('editMode', JSON.stringify(newEditMode));
      return newEditMode;
    });
  };

  const addNewBlock = async () => {
    if (!editMode) return;
    const type = prompt('Введите тип блока (avatar, info, stats, inventory, cyber-implants):');
    if (!validBlockTypes.includes(type)) {
      alert('Неверный тип блока!');
      return;
    }
    const id = `${type}-block-${Date.now()}`;
    const newBlock = createBlock(type, id);
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    await saveBlockToServer(newBlock);
  };

  const removeBlock = async (blockId) => {
    if (!editMode) return;
    if (!window.confirm('Точно удалить этот блок?')) return;
    const block = blocks.find((b) => b.id === blockId);
    if (block && block.serverId) {
      try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${block.serverId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      } catch (error) {
        console.error(`Error deleting block ${blockId} from server:`, error);
      }
    }
    setBlocks(blocks.filter((block) => block.id !== blockId));
  };

  const updateAvatar = async (blockId, avatarUrl) => {
    const newBlocks = blocks.map((block) => {
      if (block.id === blockId) {
        const updatedBlock = { ...block, data: { ...block.data, avatar: avatarUrl } };
        updateBlockOnServer(updatedBlock);
        return updatedBlock;
      }
      return block;
    });
    setBlocks(newBlocks);
  };

  const editField = async (blockId, field, index, newValue) => {
    const newBlocks = blocks.map((block) => {
      if (block.id === blockId) {
        const updatedData = { ...block.data };
        if (index !== null) {
          updatedData[field][index] = newValue;
        } else {
          updatedData[field] = newValue;
        }
        const updatedBlock = { ...block, data: updatedData };
        updateBlockOnServer(updatedBlock);
        return updatedBlock;
      }
      return block;
    });
    setBlocks(newBlocks);
  };

  const addItem = async (blockId, newItem) => {
    const newBlocks = await blocks.map((block) => {
      if (block.id === blockId) {
        const field = block.type === 'inventory' ? 'items' : 'implants';
        const updatedData = { ...block.data, [field]: [...block.data[field], newItem] };
        const updatedBlock = { ...block, data: updatedData };
        try {
          const response = fetch(`https://jsonplaceholder.typicode.com/posts/${block.serverId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ body: JSON.stringify(updatedData) }),
          });
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        } catch (error) {
          console.error(`Error updating block ${block.id} on server:`, error);
        }
        return updatedBlock;
      }
      return block;
    });
    setBlocks(newBlocks);
  };

  const removeItem = async (blockId, index) => {
    if (!editMode) return;
    if (!window.confirm('Точно удалить предмет из списка?')) return;
    const newBlocks = await blocks.map((block) => {
      if (block.id === blockId) {
        const field = block.type === 'inventory' ? 'items' : 'implants';
        const updatedField = [...block.data[field]];
        updatedField.splice(index, 1);
        const updatedData = { ...block.data, [field]: updatedField };
        const updatedBlock = { ...block, data: updatedData };
        try {
          const response = fetch(`https://jsonplaceholder.typicode.com/posts/${block.serverId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ body: JSON.stringify(updatedData) }),
          });
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        } catch (error) {
          console.error(`Error updating block ${block.id} on server:`, error);
        }
        return updatedBlock;
      }
      return block;
    });
    setBlocks(newBlocks);
  };

  const resetCharacter = async () => {
    if (!window.confirm('Точно сбросить персонажа? Все данные в карточке будут сброшены.')) return;
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

    try {
      const userResponse = await fetch('https://randomuser.me/api/');
      const userData = await userResponse.json();
      const user = userData.results[0];
      const randomName = `${user.name.first} ${user.name.last}`;
      const randomAge = user.dob.age;
      const avatarUrl = user.picture.large;

      const newBlocks = [
        createBlock('avatar', 'avatar-block', { avatar: avatarUrl }),
        createBlock('info', 'info-block', { name: randomName, role: 'Рокер', age: randomAge.toString() }),
        createBlock('stats', 'stats-block', { 'Интеллект': 8, 'Рефлексы': 9, 'Харизма': 7 }),
        createBlock('inventory', 'inventory-block', { items: ['Пистолет', 'Кожаная куртка', 'Гитара'] }),
      ];

      for (const block of newBlocks) {
        await saveBlockToServer(block);
      }
      setBlocks(newBlocks);
      setEditMode(false);
      localStorage.setItem('editMode', JSON.stringify(false));
    } catch (error) {
      console.error('Character reset error:', error);
      alert('Не удалось получить данные с сервера, заданы значения по умолчанию');
      const defaultBlocks = [
        createBlock('avatar', 'avatar-block', { avatar: null }),
        createBlock('info', 'info-block', { name: 'Джонни Сильверхенд', role: 'Рокер', age: '32' }),
        createBlock('stats', 'stats-block', { 'Интеллект': 8, 'Рефлексы': 9, 'Харизма': 7 }),
        createBlock('inventory', 'inventory-block', { items: ['Пистолет', 'Кожаная куртка', 'Гитара'] }),
      ];
      for (const block of defaultBlocks) {
        await saveBlockToServer(block);
      }
      setBlocks(defaultBlocks);
      setEditMode(false);
      localStorage.setItem('editMode', JSON.stringify(false));
    }
  };

  const exportCharacter = () => {
    const data = {};
    blocks.forEach((block) => {
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
  };

  useEffect(() => {
    const savedEditMode = localStorage.getItem('editMode');
    if (savedEditMode) {
      setEditMode(JSON.parse(savedEditMode));
    }
    loadBlocks();
    loadWeather();
  }, []);

  return (
    <AppContext.Provider
      value={{
        editMode,
        blocks,
        weather,
        toggleEditMode,
        addNewBlock,
        removeBlock,
        updateAvatar,
        editField,
        addItem,
        removeItem,
        resetCharacter,
        exportCharacter,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;