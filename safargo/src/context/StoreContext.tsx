import React, { createContext, useContext, useState, useEffect } from 'react';
import { safarStore, SafarGoStoreState } from '../lib/store';

const StoreContext = createContext<{
  store: typeof safarStore;
  state: SafarGoStoreState;
} | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SafarGoStoreState>(safarStore.getState());

  useEffect(() => {
    const unsub = safarStore.subscribe(() => {
      setState({ ...safarStore.getState() });
    });
    return unsub;
  }, []);

  return (
    <StoreContext.Provider value={{ store: safarStore, state }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
