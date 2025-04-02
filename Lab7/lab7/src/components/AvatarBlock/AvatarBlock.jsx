import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import Block from '../Block/Block';
import './AvatarBlock.css';

const AvatarBlock = ({ block }) => {
  const { editMode, updateAvatar } = useContext(AppContext);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateAvatar(block.id, event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Block block={block}>
      <div className="avatar-block">
        <h2>Аватар персонажа</h2>
        <img src={block.data.avatar || ''} alt="Аватар персонажа" />
        {editMode && (
          <input
            type="file"
            onChange={handleAvatarChange}
            accept="image/*"
          />
        )}
      </div>
    </Block>
  );
};

export default AvatarBlock;