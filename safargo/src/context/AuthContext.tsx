import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../lib/types';
import { safarStore } from '../lib/store';

interface AuthContextType {
  currentUser: UserProfile;
  availableProfiles: UserProfile[];
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  isAdmin: boolean;
  isGoAgent: boolean;
  isAgent: boolean;
  isOperator: boolean;
  isFarmer: boolean;
  isBuyer: boolean;
  isTransporter: boolean;
  isPartner: boolean;
  isCustomer: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storeState, setStoreState] = useState(safarStore.getState());

  useEffect(() => {
    const unsubscribe = safarStore.subscribe(() => {
      setStoreState({ ...safarStore.getState() });
    });
    return unsubscribe;
  }, []);

  const currentUser = storeState.currentUser;
  const availableProfiles = storeState.profiles;

  const switchUser = (userId: string) => {
    const user = availableProfiles.find((p) => p.id === userId);
    if (user) {
      safarStore.setCurrentUser(user);
    }
  };

  const switchRole = (role: UserRole) => {
    safarStore.setRole(role);
  };

  const logout = () => {
    // Switch to standard customer persona
    const customer = availableProfiles.find((p) => p.role === 'customer') || availableProfiles[0];
    safarStore.setCurrentUser(customer);
  };

  const role = currentUser.role;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        availableProfiles,
        switchUser,
        switchRole,
        isAdmin: role === 'admin',
        isGoAgent: role === 'go_agent',
        isAgent: role === 'agent' || role === 'go_agent',
        isOperator: role === 'operator',
        isFarmer: role === 'farmer',
        isBuyer: role === 'buyer',
        isTransporter: role === 'transporter',
        isPartner: role === 'partner',
        isCustomer: role === 'customer',
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
