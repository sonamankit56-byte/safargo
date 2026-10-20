import React from 'react';
import { useTravel } from '../../context/TravelContext';
import { AgentAuthGateway } from '../agent/AgentAuthGateway';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen } = useTravel();

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 flex items-start sm:items-center justify-center animate-fade-in">
      <div className="relative w-full max-w-4xl my-6 bg-transparent">
        <AgentAuthGateway onClose={() => setIsAuthModalOpen(false)} isModal={true} />
      </div>
    </div>
  );
};
