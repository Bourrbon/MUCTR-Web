import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import './AddBlockButton.css';

const AddBlockButton = () => {
  const { addNewBlock } = useContext(AppContext);

  return (
    <button className="add-block-btn" onClick={addNewBlock}>
      Добавить новый блок
    </button>
  );
};

export default AddBlockButton;