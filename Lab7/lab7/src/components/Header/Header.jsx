import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import './Header.css';

const Header = () => {
  const { editMode, weather, toggleEditMode, resetCharacter, exportCharacter } =
    useContext(AppContext);

  return (
    <header className="header">
      <h1>Карточка персонажа Cyberpunk 2020</h1>
      <div className="weather">
        Погода в Москве: {weather.temperature}°C, {weather.condition}
      </div>
      <div className="header-buttons">
        <button onClick={toggleEditMode}>
          {editMode
            ? 'Выключить режим редактирования'
            : 'Включить режим редактирования'}
        </button>
        <button onClick={resetCharacter}>Сбросить персонажа</button>
        <button onClick={exportCharacter}>Экспорт данных</button>
      </div>
    </header>
  );
};

export default Header;