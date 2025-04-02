import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import Block from '../Block/Block';
import './StatsBlock.css';

const StatsBlock = ({ block }) => {
  const { editMode, editField } = useContext(AppContext);

  const handleEdit = (stat) => {
    const newValue = prompt(`Введите новое значение для ${stat}:`, block.data[stat]);
    if (newValue) {
      editField(block.id, stat, null, newValue);
    }
  };

  return (
    <Block block={block}>
      <h2>Характеристики</h2>
      {Object.keys(block.data).map((stat) => (
        <p
          key={stat}
          className={editMode ? 'editable' : ''}
          onClick={editMode ? () => handleEdit(stat) : undefined}
        >
          {stat}: {block.data[stat]}
        </p>
      ))}
    </Block>
  );
};

export default StatsBlock;