import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import Block from '../Block/Block';
import './CyberImplantsBlock.css';

const CyberImplantsBlock = ({ block }) => {
  const { editMode, addItem, removeItem, editField } = useContext(AppContext);

  const handleEditImplant = (index) => {
    const newValue = prompt(`Введите новое значение для implants[${index}]:`, block.data.implants[index]);
    if (newValue) {
      editField(block.id, 'implants', index, newValue);
    }
  };

  const handleAddImplant = () => {
    const newImplant = prompt('Введите новый имплант:');
    if (newImplant) {
      addItem(block.id, newImplant);
    }
  };

  return (
    <Block block={block}>
      <h2>Кибер-импланты</h2>
      <ul>
        {block.data.implants.map((implant, index) => (
          <li key={index} className="cyber-implant-item">
            <span
              className={editMode ? 'editable' : ''}
              onClick={editMode ? () => handleEditImplant(index) : undefined}
            >
              {implant}
            </span>
            {editMode && (
              <button onClick={() => removeItem(block.id, index)}>Удалить</button>
            )}
          </li>
        ))}
      </ul>
      {editMode && (
        <button onClick={handleAddImplant}>Добавить имплант</button>
      )}
    </Block>
  );
};

export default CyberImplantsBlock;