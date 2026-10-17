import React from 'react';
import { BookingProvider, useBooking } from './context/BookingContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { HomeView } from './views/HomeView';
import { SearchResultsView } from './views/SearchResultsView';
import { CheckoutView } from './views/CheckoutView';
import { BookingSuccessView } from './views/BookingSuccessView';
import { MyBookingsView } from './views/MyBookingsView';
import { AgentView } from './views/AgentView';
import { LoginPortalView } from './views/LoginPortalView';

const MainContent: React.FC = () => {
  const { currentView } = useBooking();

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f8fa]">
      <Header />
      <main className="flex-1">
        {currentView === 'home' && <HomeView />}
        {currentView === 'search' && <SearchResultsView />}
        {currentView === 'checkout' && <CheckoutView />}
        {currentView === 'success' && <BookingSuccessView />}
        {currentView === 'my-bookings' && <MyBookingsView />}
        {currentView === 'agent' && <AgentView />}
        {currentView === 'login' && <LoginPortalView />}
      </main>
      <Footer />
      <AuthModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BookingProvider>
      <MainContent />
    </BookingProvider>
  );
};

export default App;
