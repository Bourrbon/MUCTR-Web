import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import Block from '../Block/Block';
import './InventoryBlock.css';

const InventoryBlock = ({ block }) => {
  const { editMode, addItem, removeItem, editField } = useContext(AppContext);

  const handleEditItem = (index) => {
    const newValue = prompt(`Введите новое значение для items[${index}]:`, block.data.items[index]);
    if (newValue) {
      editField(block.id, 'items', index, newValue);
    }
  };

  const handleAddItem = () => {
    const newItem = prompt('Введите новый предмет:');
    if (newItem) {
      addItem(block.id, newItem);
    }
  };

  return (
    <Block block={block}>
      <h2>Инвентарь</h2>
      <ul>
        {block.data.items.map((item, index) => (
          <li key={index} className="inventory-item">
            <span
              className={editMode ? 'editable' : ''}
              onClick={editMode ? () => handleEditItem(index) : undefined}
            >
              {item}
            </span>
            {editMode && (
              <button onClick={() => removeItem(block.id, index)}>Удалить</button>
            )}
          </li>
        ))}
      </ul>
      {editMode && (
        <button onClick={handleAddItem}>Добавить предмет</button>
      )}
    </Block>
  );
};

export default InventoryBlock;