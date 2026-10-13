import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
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
import { AdminPromoterManagement } from './components/admin/AdminPromoterManagement';
import { PromoterDashboard } from './components/promoter/PromoterDashboard';
import { PromoterApplicationModal } from './components/promoter/PromoterApplicationModal';
import { QuickDeliveryHub } from './components/delivery/QuickDeliveryHub';
import { FlipkartOrderTrackingView } from './components/delivery/FlipkartOrderTrackingView';
import { AgentDeliveryDesk } from './components/agent/AgentDeliveryDesk';
import { CustomerPortal } from './components/customer/CustomerPortal';
import { ShopkeeperPortal } from './components/shop/ShopkeeperPortal';
import { GoWalletHub } from './components/wallet/GoWalletHub';
import { AuthModal } from './components/auth/AuthModal';
import { GoAgentDashboard } from './components/agent/GoAgentDashboard';
import { GoAgentAuthModal } from './components/agent/GoAgentAuthModal';
import { AnnouncementBanner } from './components/common/AnnouncementBanner';
import { HomePage } from './components/home/HomePage';
import { SafarGoLogo } from './components/common/SafarGoLogo';
import { BottomNav } from './components/common/BottomNav';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { getTabFromPath, getPathFromTab } from './lib/routes';
import { Bus, ShieldCheck, Heart, UserPlus, LogIn, ExternalLink, Zap } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser, role, isAdmin, isPromoter } = useAuth();
  const { celebrationBooking, dismissCelebration, bookings } = useData();

  const navigate = useNavigate();
  const location = useLocation();

  // Derive active tab directly from browser URL bar
  const currentTab = getTabFromPath(location.pathname);

  // Update browser URL bar when a tab is selected
  const setCurrentTab = (tab: string) => {
    const targetPath = getPathFromTab(tab);
    if (location.pathname !== targetPath) {
      navigate(targetPath);
    }
  };

  const [selectedReviewBookingId, setSelectedReviewBookingId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register' | 'promoter_login'>('login');
  const [isPromoterModalOpen, setIsPromoterModalOpen] = useState(false);
  const [isGoAuthModalOpen, setIsGoAuthModalOpen] = useState(false);
  const [goAuthInitialMode, setGoAuthInitialMode] = useState<'login' | 'register'>('login');
  const [selectedTrackOrderId, setSelectedTrackOrderId] = useState<string | null>(null);

  // Extract orderId from URL query string if present (e.g. /track-order?orderId=ORD-123)
  const searchParams = new URLSearchParams(location.search);
  const queryOrderId = searchParams.get('orderId');
  const activeTrackOrderId = queryOrderId || selectedTrackOrderId;

  const handleOpenAuth = (initialTab: 'login' | 'register' | 'promoter_login' = 'login') => {
    setAuthInitialTab(initialTab);
    setIsAuthModalOpen(true);
  };

  const handleOpenGoAuth = (mode: 'login' | 'register' = 'login') => {
    setGoAuthInitialMode(mode);
    setIsGoAuthModalOpen(true);
  };

  // Auto-redirect to role-specific dashboard upon fresh login or logout
  const previousUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const prevId = previousUserIdRef.current;
    const currentId = currentUser?.id || null;
    previousUserIdRef.current = currentId;

    // Detect fresh login: transitioned from unauthenticated (null) to authenticated
    if (!prevId && currentId && currentUser) {
      if (role === 'promoter') {
        navigate('/promoter/dashboard');
      } else if (role === 'admin' || isAdmin) {
        navigate('/admin/dashboard');
      } else if (role === 'agent') {
        navigate('/go-agent');
      } else if (role === 'customer') {
        navigate('/customer');
      } else if (role === 'shopkeeper') {
        navigate('/shop');
      }
    } else if (prevId && !currentId) {
      // User logged out: redirect to homepage
      navigate('/');
    }
  }, [currentUser, role, isAdmin, navigate]);

  // Strict Role-Based Route Guard: Protect admin, agent, promoter areas safely
  useEffect(() => {
    if (location.pathname === '/login' && !currentUser) {
      setAuthInitialTab('login');
      setIsAuthModalOpen(true);
    } else if (location.pathname === '/register' && !currentUser) {
      setAuthInitialTab('register');
      setIsAuthModalOpen(true);
    } else if (location.pathname.startsWith('/admin')) {
      if (!currentUser || (role !== 'admin' && !isAdmin)) {
        if (role === 'customer') navigate('/customer', { replace: true });
        else if (role === 'shopkeeper') navigate('/shop', { replace: true });
        else if (role === 'agent') navigate('/go-agent', { replace: true });
        else if (role === 'promoter') navigate('/promoter/dashboard', { replace: true });
        else navigate('/', { replace: true });
      }
    } else if (location.pathname === '/agent' || location.pathname === '/agent/dashboard') {
      if (role === 'agent') {
        navigate('/go-agent', { replace: true });
      }
    } else if (location.pathname.startsWith('/agent')) {
      const isSharedBookingRoute =
        location.pathname === '/agent/new-booking' || location.pathname === '/agent/my-bookings';
      if (!currentUser) {
        navigate('/', { replace: true });
      } else if (
        role !== 'agent' &&
        role !== 'admin' &&
        !(isSharedBookingRoute && (role === 'promoter' || role === 'shopkeeper'))
      ) {
        if (role === 'customer') navigate('/customer', { replace: true });
        else if (role === 'shopkeeper') navigate('/shop', { replace: true });
        else if (role === 'promoter') navigate('/promoter/dashboard', { replace: true });
      }
    } else if (location.pathname.startsWith('/promoter/dashboard')) {
      if (!currentUser) {
        navigate('/', { replace: true });
      } else if (role !== 'promoter' && role !== 'admin') {
        if (role === 'customer') navigate('/customer', { replace: true });
        else if (role === 'shopkeeper') navigate('/shop', { replace: true });
        else if (role === 'agent') navigate('/agent/dashboard', { replace: true });
      }
    }
  }, [location.pathname, currentUser, role, isAdmin, navigate]);

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
        onOpenGoAuth={handleOpenGoAuth}
      />

      {/* Main Content View Container */}
      <main className="flex-1 pb-16">
        {currentTab === 'go-agent' ? (
          <GoAgentDashboard
            onNavigateHome={() => setCurrentTab('home')}
            onOpenBookingModal={() => setCurrentTab('new-booking')}
          />
        ) : currentTab === 'go-wallet' || currentTab === 'go_wallet' ? (
          <GoWalletHub onNavigate={setCurrentTab} onOpenAuth={handleOpenAuth} />
        ) : currentTab === 'track-order' ? (
          <FlipkartOrderTrackingView
            orderId={activeTrackOrderId}
            onBack={() => setCurrentTab('quick-delivery')}
            onSelectOrder={(id) => {
              setSelectedTrackOrderId(id);
              navigate(`/track-order?orderId=${id}`);
            }}
          />
        ) : currentTab === 'quick-delivery' ? (
          <QuickDeliveryHub onOpenAuth={handleOpenAuth} />
        ) : currentTab === 'promoter-program' ? (
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                    केवल 5 पद (Only 5 Candidates Allowed)
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-300">
                    वेतन: ₹15,000 / माह
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    100% फीस रिफंड गारंटी (₹648 वापस)
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black">
                  सफ़ारगो प्रमोटर पार्टनर प्रोग्राम
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  पूरे SafarGo नेटवर्क में केवल 5 प्रमोटर पद! फिक्स्ड ₹15,000 मासिक वेतन + 500 एजेंट लक्ष्य (प्रति एजेंट <strong>न्यूनतम 3 कन्फर्म बस बुकिंग अनिवार्य</strong>) + लोकल दुकान सब्सक्रिप्शन पैकेज लिस्टिंग + 15-मिनट डिलीवरी ऑडिट + सुपर एडमिन के नीचे <strong>एजेंट रजिस्ट्रेशन व KYC अप्रूवल डेस्क</strong>!
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setIsPromoterModalOpen(true)}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-sm shadow-md transition"
                  >
                    प्रमोटर पद हेतु आवेदन करें (₹149 UTR)
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => setCurrentTab('admin-promoters')}
                      className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition"
                    >
                      सुपर एडमिन प्रमोटर डेस्क
                    </button>
                  )}
                  {isPromoter && (
                    <button
                      onClick={() => setCurrentTab('promoter-dashboard')}
                      className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition"
                    >
                      माई प्रमोटर डैशबोर्ड
                    </button>
                  )}
                </div>
              </div>
            </div>

            <QuickDeliveryHub onOpenAuth={handleOpenAuth} />
          </div>
        ) : currentTab === 'promoter-dashboard' ? (
          <PromoterDashboard onNavigate={setCurrentTab} />
        ) : currentTab === 'customer-portal' ? (
          <CustomerPortal onNavigateTab={setCurrentTab} />
        ) : currentTab === 'shopkeeper-portal' ? (
          <ShopkeeperPortal onNavigate={setCurrentTab} />
        ) : currentTab === 'dashboard' ? (
          <AgentDashboard onNavigate={setCurrentTab} />
        ) : currentTab === 'agent-deliveries' ? (
          <AgentDeliveryDesk />
        ) : currentTab === 'new-booking' ? (
          <ManualBookingForm />
        ) : currentTab === 'my-bookings' ? (
          <AgentBookingsList />
        ) : currentTab === 'commission' ? (
          <AgentCommissionLedger />
        ) : currentTab === 'refer-earn' ? (
          <ReferAndEarn />
        ) : currentTab === 'viral-promotions' ? (
          <AgentViralPromotions />
        ) : currentTab === 'agent-profile' ? (
          <AgentProfile />
        ) : currentTab === 'admin-dashboard' ? (
          <AdminDashboard
            onNavigate={setCurrentTab}
            onOpenBooking={(id) => setSelectedReviewBookingId(id)}
          />
        ) : currentTab === 'admin-promoters' ? (
          <AdminPromoterManagement />
        ) : currentTab === 'admin-bookings' ? (
          <AdminBookingsTable onOpenBooking={(id) => setSelectedReviewBookingId(id)} />
        ) : currentTab === 'admin-agents' ? (
          <AdminAgentManagement />
        ) : currentTab === 'admin-kyc-desk' ? (
          <AdminAgentManagement initialTab="kyc_desk" />
        ) : currentTab === 'admin-security-desk' ? (
          <AdminSecurityDesk />
        ) : currentTab === 'admin-trips' ? (
          <AdminBusTripManagement />
        ) : currentTab === 'admin-promotions' ? (
          <AdminPromotionManagement />
        ) : currentTab === 'admin-salary' ? (
          <AdminCommissionAndSalary />
        ) : currentTab === 'admin-settings' ? (
          <AdminSettings />
        ) : currentTab === 'admin-logs' ? (
          <AdminAuditLogs />
        ) : (
          <HomePage
            onOpenAuth={handleOpenAuth}
            onOpenGoAuth={handleOpenGoAuth}
            onOpenPromoterApply={() => setIsPromoterModalOpen(true)}
            onNavigateTab={(tab) => {
              if (tab === 'promoter-modal') {
                setIsPromoterModalOpen(true);
              } else if (!currentUser && (tab === 'dashboard' || tab === 'new-booking')) {
                handleOpenAuth('login');
              } else {
                setCurrentTab(tab);
              }
            }}
          />
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
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          initialTab={authInitialTab}
          onClose={() => setIsAuthModalOpen(false)}
          onOpenTrackPromoter={() => {
            setIsAuthModalOpen(false);
            setCurrentTab('home');
            setTimeout(() => {
              const el = document.getElementById('promoter-track-section');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }, 100);
          }}
          onOpenApplyPromoter={() => {
            setIsAuthModalOpen(false);
            setIsPromoterModalOpen(true);
          }}
        />
      )}

      {/* Promoter Partner Application Modal */}
      {isPromoterModalOpen && (
        <PromoterApplicationModal
          isOpen={isPromoterModalOpen}
          onClose={() => setIsPromoterModalOpen(false)}
        />
      )}

      {/* GO Special Agent Ultra 3D Auth Modal */}
      {isGoAuthModalOpen && (
        <GoAgentAuthModal
          isOpen={isGoAuthModalOpen}
          initialMode={goAuthInitialMode}
          onClose={() => setIsGoAuthModalOpen(false)}
          onSuccessLogin={() => {
            setIsGoAuthModalOpen(false);
            setCurrentTab('go-agent');
          }}
        />
      )}

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
                Quick Actions & 3D Go Wallet
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    if (!currentUser) {
                      handleOpenGoAuth('login');
                    } else {
                      setCurrentTab('go-agent');
                    }
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-slate-950" />
                  <span>⚡ GO Special Agent (Ultra 3D)</span>
                </button>

                <button
                  onClick={() => {
                    if (!currentUser) {
                      handleOpenAuth('login');
                    } else {
                      setCurrentTab('go-wallet');
                    }
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
                >
                  <span>👑 3D Go Wallet खोलें</span>
                </button>
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
                      else if (role === 'promoter') setCurrentTab('promoter-dashboard');
                      else if (role === 'customer') setCurrentTab('customer-portal');
                      else if (role === 'shopkeeper') setCurrentTab('shopkeeper-portal');
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

          <div className="border-t border-slate-800 pt-6 pb-16 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© 2026 SafarGo Technologies. All rights reserved. Manual Bus Ticketing System.</p>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-slate-400 font-medium">SafarGo Central Verification Desk Online</span>
            </div>
          </div>
        </div>
      </footer>

      {/* AbhiBus Style 4-Tab Sticky Bottom Navigation Bar (Visible after login) */}
      <BottomNav currentTab={currentTab} onNavigateTab={setCurrentTab} />
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ToastProvider>
          <AuthProvider>
            <DataProvider>
              <AppContent />
            </DataProvider>
          </AuthProvider>
        </ToastProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
