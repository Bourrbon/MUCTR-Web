import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import Block from '../Block/Block';
import './CharacterInfoBlock.css';

const CharacterInfoBlock = ({ block }) => {
  const { editMode, editField } = useContext(AppContext);

  const handleEdit = (field) => {
    const newValue = prompt(`Введите новое значение для ${field}:`, block.data[field]);
    if (newValue) {
      editField(block.id, field, null, newValue);
    }
  };

  return (
    <Block block={block}>
      <h2>Информация о персонаже</h2>
      <p
        className={editMode ? 'editable' : ''}
        onClick={editMode ? () => handleEdit('name') : undefined}
      >
        Имя: {block.data.name}
      </p>
      <p
        className={editMode ? 'editable' : ''}
        onClick={editMode ? () => handleEdit('role') : undefined}
      >
        Роль: {block.data.role}
      </p>
      <p
        className={editMode ? 'editable' : ''}
        onClick={editMode ? () => handleEdit('age') : undefined}
      >
        Возраст: {block.data.age}
      </p>
    </Block>
  );
};

export default CharacterInfoBlock;