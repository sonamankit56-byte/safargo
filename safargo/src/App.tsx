import React from 'react';
import { PortalProvider, usePortal } from './context/PortalContext';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { SubdomainBar } from './components/common/SubdomainBar';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';

// 12 Portal Components
import { WwwPortal } from './portals/www/WwwPortal';
import { BookPortal } from './portals/book/BookPortal';
import { AgentPortal } from './portals/agent/AgentPortal';
import { GoPortal } from './portals/go/GoPortal';
import { AdminPortal } from './portals/admin/AdminPortal';
import { OperatorPortal } from './portals/operator/OperatorPortal';
import { KisanPortal } from './portals/kisan/KisanPortal';
import { BuyerPortal } from './portals/buyer/BuyerPortal';
import { TransportPortal } from './portals/transport/TransportPortal';
import { PayPortal } from './portals/pay/PayPortal';
import { HelpPortal } from './portals/help/HelpPortal';
import { PartnerPortal } from './portals/partner/PartnerPortal';

const PortalRouter: React.FC = () => {
  const { activePortal } = usePortal();

  const renderActivePortal = () => {
    switch (activePortal) {
      case 'www':
        return <WwwPortal />;
      case 'book':
        return <BookPortal />;
      case 'agent':
        return <AgentPortal />;
      case 'go':
        return <GoPortal />;
      case 'admin':
        return <AdminPortal />;
      case 'operator':
        return <OperatorPortal />;
      case 'kisan':
        return <KisanPortal />;
      case 'buyer':
        return <BuyerPortal />;
      case 'transport':
        return <TransportPortal />;
      case 'pay':
        return <PayPortal />;
      case 'help':
        return <HelpPortal />;
      case 'partner':
        return <PartnerPortal />;
      default:
        return <WwwPortal />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <SubdomainBar />
      <Navbar />
      <main className="flex-1">
        {renderActivePortal()}
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AuthProvider>
        <PortalProvider>
          <PortalRouter />
        </PortalProvider>
      </AuthProvider>
    </StoreProvider>
  );
}
