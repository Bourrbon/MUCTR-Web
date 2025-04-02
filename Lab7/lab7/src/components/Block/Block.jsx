import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import './Block.css';

const Block = ({ block, children }) => {
  const { editMode, removeBlock } = useContext(AppContext);

  return (
    <div className="block" id={block.id}>
      {children}
      {editMode && (
        <button
          className="delete-block-btn"
          onClick={() => removeBlock(block.id)}
        >
          Удалить блок
        </button>
      )}
    </div>
  );
};

export default Block;