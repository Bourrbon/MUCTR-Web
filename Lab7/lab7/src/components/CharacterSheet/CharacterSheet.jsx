import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import Block from '../Block/Block';
import AvatarBlock from '../AvatarBlock/AvatarBlock';
import CharacterInfoBlock from '../CharacterInfoBlock/CharacterInfoBlock';
import StatsBlock from '../StatsBlock/StatsBlock';
import InventoryBlock from '../InventoryBlock/InventoryBlock';
import CyberImplantsBlock from '../CyberImplantsBlock/CyberImplantsBlock';
import AddBlockButton from '../AddBlockButton/AddBlockButton';
import './CharacterSheet.css';

const CharacterSheet = () => {
  const { blocks, editMode } = useContext(AppContext);

  const renderBlock = (block) => {
    switch (block.type) {
      case 'avatar':
        return <AvatarBlock key={block.id} block={block} />;
      case 'info':
        return <CharacterInfoBlock key={block.id} block={block} />;
      case 'stats':
        return <StatsBlock key={block.id} block={block} />;
      case 'inventory':
        return <InventoryBlock key={block.id} block={block} />;
      case 'cyber-implants':
        return <CyberImplantsBlock key={block.id} block={block} />;
      default:
        return null;
    }
  };

  return (
    <div id="character-sheet" className="character-sheet">
      {blocks.map((block) => renderBlock(block))}
      {editMode && <AddBlockButton />}
    </div>
  );
};

export default CharacterSheet;