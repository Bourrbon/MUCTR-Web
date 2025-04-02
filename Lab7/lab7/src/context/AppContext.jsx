import { createContext } from 'react';

export const AppContext = createContext({
  editMode: false,
  blocks: [],
  weather: { temperature: 'N/A', condition: 'N/A' },
  toggleEditMode: () => {},
  addNewBlock: () => {},
  removeBlock: () => {},
  updateAvatar: () => {},
  editField: () => {},
  addItem: () => {},
  removeItem: () => {},
  resetCharacter: () => {},
  exportCharacter: () => {},
});