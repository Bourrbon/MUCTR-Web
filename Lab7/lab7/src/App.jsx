import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppProvider from './context/AppProvider';
import Header from './components/Header/Header';
import CharacterSheet from './components/CharacterSheet/CharacterSheet';
import './styles/index.css';

const App = () => {
  return (
    <AppProvider>
      <Router>
        <Header />
        <CharacterSheet />
      </Router>
    </AppProvider>
  );
};

export default App;