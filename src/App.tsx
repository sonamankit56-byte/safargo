import React, { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { Navbar } from './components/common/Navbar';
import { CommissionCelebration } from './components/common/CommissionCelebration';
import { AgentDashboard } from './components/agent/AgentDashboard';
import { ManualBookingForm } from './components/agent/ManualBookingForm';
import { AgentBookingsList } from './components/agent/AgentBookingsList';
import { AgentCommissionLedger } from './components/agent/AgentCommissionLedger';
import { AgentProfile } from './components/agent/AgentProfile';
import { ReferAndEarn } from './components/agent/ReferAndEarn';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminBookingsTable } from './components/admin/AdminBookingsTable';
import { AdminBookingReviewModal } from './components/admin/AdminBookingReviewModal';
import { AdminAgentManagement } from './components/admin/AdminAgentManagement';
import { AdminBusTripManagement } from './components/admin/AdminBusTripManagement';
import { AdminCommissionAndSalary } from './components/admin/AdminCommissionAndSalary';
import { AdminSettings } from './components/admin/AdminSettings';
import { AdminAuditLogs } from './components/admin/AdminAuditLogs';
import { AdminSecurityDesk } from './components/admin/AdminSecurityDesk';
import { AgentViralPromotions } from './components/agent/AgentViralPromotions';
import { AdminPromotionManagement } from './components/admin/AdminPromotionManagement';
import { AuthModal } from './components/auth/AuthModal';
import { AnnouncementBanner } from './components/common/AnnouncementBanner';
import { HomePage } from './components/home/HomePage';
import { SafarGoLogo } from './components/common/SafarGoLogo';
import { Bus, ShieldCheck, Heart, UserPlus, LogIn, ExternalLink } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser, role, isAdmin } = useAuth();
  const { celebrationBooking, dismissCelebration, bookings } = useData();

  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedReviewBookingId, setSelectedReviewBookingId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register'>('login');

  const handleOpenAuth = (initialTab: 'login' | 'register' = 'login') => {
    setAuthInitialTab(initialTab);
    setIsAuthModalOpen(true);
  };

  const selectedReviewBooking = bookings.find((b) => b.id === selectedReviewBookingId) || null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Platform Live Announcement Broadcast Banner */}
      <AnnouncementBanner />

      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main Content View Container */}
      <main className="flex-1 pb-16">
        {(!currentUser || currentTab === 'home') ? (
          <HomePage
            onOpenAuth={handleOpenAuth}
            onNavigateTab={(tab) => {
              if (!currentUser) {
                handleOpenAuth('login');
              } else {
                setCurrentTab(tab);
              }
            }}
          />
        ) : role === 'agent' ? (
          <>
            {currentTab === 'dashboard' && <AgentDashboard onNavigate={setCurrentTab} />}
            {currentTab === 'new-booking' && <ManualBookingForm />}
            {currentTab === 'my-bookings' && <AgentBookingsList />}
            {currentTab === 'commission' && <AgentCommissionLedger />}
            {currentTab === 'refer-earn' && <ReferAndEarn />}
            {currentTab === 'viral-promotions' && <AgentViralPromotions />}
            {currentTab === 'agent-profile' && <AgentProfile />}
          </>
        ) : (
          <>
            {currentTab === 'admin-dashboard' && (
              <AdminDashboard
                onNavigate={setCurrentTab}
                onOpenBooking={(id) => setSelectedReviewBookingId(id)}
              />
            )}
            {currentTab === 'admin-bookings' && (
              <AdminBookingsTable onOpenBooking={(id) => setSelectedReviewBookingId(id)} />
            )}
            {currentTab === 'admin-agents' && <AdminAgentManagement />}
            {currentTab === 'admin-kyc-desk' && <AdminAgentManagement initialTab="kyc_desk" />}
            {currentTab === 'admin-security-desk' && <AdminSecurityDesk />}
            {currentTab === 'admin-trips' && <AdminBusTripManagement />}
            {currentTab === 'admin-promotions' && <AdminPromotionManagement />}
            {currentTab === 'admin-salary' && <AdminCommissionAndSalary />}
            {currentTab === 'admin-settings' && <AdminSettings />}
            {currentTab === 'admin-logs' && <AdminAuditLogs />}
          </>
        )}
      </main>

      {/* Commission Celebration Modal (Fires only once on newly confirmed booking) */}
      {celebrationBooking && (
        <CommissionCelebration
          booking={celebrationBooking}
          onClose={dismissCelebration}
        />
      )}

      {/* Admin Booking Review & Verification Modal */}
      {selectedReviewBooking && (
        <AdminBookingReviewModal
          booking={selectedReviewBooking}
          onClose={() => setSelectedReviewBookingId(null)}
        />
      )}

      {/* Auth / Register Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialTab={authInitialTab}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <SafarGoLogo size="md" variant="light" showTagline={false} />
              <p className="text-xs text-slate-400 leading-relaxed">
                ग्रामीण जन सेवा केंद्रों (CSC) को अधिकृत बस बुकिंग सेंटर बनाकर स्थानीय युवाओं को स्थायी रोजगार प्रदान करने वाला भारत का पहला मैनुअल बस बुकिंग नेटवर्क।
              </p>
              <p className="text-[11px] text-orange-400 font-bold">
                टैगलाइन: "अब हर सफर होगा आसान"
              </p>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                Quick Navigation
              </h3>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <button onClick={() => setCurrentTab('home')} className="hover:text-white transition">
                    पोर्टल होम (Home)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      if (!currentUser) handleOpenAuth('login');
                      else setCurrentTab(role === 'admin' ? 'admin-dashboard' : 'dashboard');
                    }}
                    className="hover:text-white transition"
                  >
                    एजेंट डैशबोर्ड (Agent Portal)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      if (!currentUser) handleOpenAuth('login');
                      else setCurrentTab('new-booking');
                    }}
                    className="hover:text-white transition"
                  >
                    नई टिकट बुक करें (New Request)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      if (!isAdmin) handleOpenAuth('login');
                      else setCurrentTab('admin-dashboard');
                    }}
                    className="hover:text-white transition"
                  >
                    एडमिन कंट्रोल डेस्क (Admin Desk)
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                SafarGo Trust & Support
              </h3>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>100% सत्यापित बस ऑपरेटर</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  <span>ग्रामीण सशक्तिकरण पहल</span>
                </li>
                <li>
                  <span className="text-[11px]">हेल्पलाइन WhatsApp: +91 98765 43210</span>
                </li>
                <li>
                  <span className="text-[11px]">ईमेल: support@safargo.in</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                {!currentUser ? (
                  <>
                    <button
                      onClick={() => handleOpenAuth('register')}
                      className="w-full py-2 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      नया एजेंट बनें (Free Signup)
                    </button>
                    <button
                      onClick={() => handleOpenAuth('login')}
                      className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      लॉगिन करें (Sign In)
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      if (role === 'admin') setCurrentTab('admin-dashboard');
                      else setCurrentTab('dashboard');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <span>माई अकाउंट खोलें</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© 2026 SafarGo Technologies. All rights reserved. Manual Bus Ticketing System.</p>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-slate-400 font-medium">SafarGo Central Verification Desk Online</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
