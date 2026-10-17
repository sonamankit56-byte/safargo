import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { usePortal } from '../../context/PortalContext';
import { BusSearchWidget } from '../../components/bus/BusSearchWidget';
import { 
  Bus, 
  ShieldCheck, 
  Clock, 
  Award, 
  Sprout, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  HelpCircle, 
  Sparkles, 
  Phone, 
  Layers,
  MapPin,
  TrendingUp,
  FileCheck
} from 'lucide-react';

export const WwwPortal: React.FC = () => {
  const { state } = useStore();
  const { setActivePortal } = usePortal();
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  const activeRoutes = state.routes.filter((r) => r.isActive);
  const activeOffers = state.offers.filter((o) => o.isActive);

  const faqs = [
    {
      q: 'How does SafarGo manual bus booking work?',
      a: 'Unlike speculative platforms that show unverified seats, SafarGo coordinates directly with authorized bus operators. Once you submit a booking request, our operations desk verifies actual seat availability within a 15-minute service target and confirms your booking with a genuine operator PNR.',
    },
    {
      q: 'What is the 15-Minute Booking Assistance Target?',
      a: 'When you submit a booking request, a 15-minute countdown starts for our team to contact the operator and confirm availability. If an operator is delayed in responding, you will see a delayed alert and can instantly chat with our WhatsApp desk.',
    },
    {
      q: 'How does the Special Go Agent program work?',
      a: 'Go Agents are verified community entrepreneurs. They receive a fixed monthly salary of ₹5,000 (upon achieving a 150-booking target), ₹19.34 commission per eligible confirmed booking, and ₹100 referral rewards when a referred agent completes 5 bookings.',
    },
    {
      q: 'What are SafarGo Kisan & Transport services?',
      a: 'SafarGo connects rural farmers with mandi buyers and transport logistics. Farmers can list harvest crops, receive transparent buyer inquiries, and book vehicle transport directly to the wholesale market.',
    },
  ];

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-safargo-navy to-safargo-navy-dark text-white pt-10 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ff6b00_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-semibold mb-4 border border-orange-500/30">
              <Sparkles className="w-3.5 h-3.5 text-safargo-orange" />
              <span>India's Transparent Assisted Travel & Rural Services</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-3">
              अब हर सफर होगा आसान
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Book verified bus routes with dedicated 15-minute manual assistance, transparent operator confirmation, and empower regional agents and farmers across India.
            </p>
          </div>

          {/* Search Widget Container */}
          <div className="max-w-4xl mx-auto transform -mb-12 shadow-2xl">
            <BusSearchWidget />
          </div>
        </div>
      </section>

      {/* Trust & Model Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-safargo-orange flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">15-Min Assistance Target</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every booking request is processed by authorized operations staff. We coordinate directly with the operator before collecting confirmed fares.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-safargo-navy flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Authentic PNR Only</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We never invent fake seat numbers or speculative PNRs. Your ticket is issued only when the bus operator genuinely confirms availability.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-safargo-green flex items-center justify-center mb-4">
              <Sprout className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Mobility Meets Agriculture</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Integrated Kisan portal connects regional farmers with wholesale buyers and transparent transport logistics for harvested crops.
            </p>
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Verified Bus Routes</h2>
            <p className="text-xs text-slate-500">Administrator-configured routes with authorized operator services</p>
          </div>
          <button
            onClick={() => setActivePortal('book')}
            className="text-xs font-semibold text-safargo-orange hover:text-orange-700 flex items-center gap-1"
          >
            <span>View All Routes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeRoutes.slice(0, 6).map((route) => (
            <div
              key={route.id}
              onClick={() => setActivePortal('book')}
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-safargo-orange shadow-sm hover:shadow-md cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-lg bg-slate-100 group-hover:bg-orange-50 text-slate-600 group-hover:text-safargo-orange transition-colors">
                  <Bus className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    {route.originCity} → {route.destinationCity}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {route.distanceKm} km • Daily Services Available
                  </div>
                </div>
              </div>
              <span className="text-xs font-semibold text-safargo-orange group-hover:translate-x-1 transition-transform">
                Book →
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Special Go Agent Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-safargo-navy p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-3 border border-purple-400/30">
              <Award className="w-3.5 h-3.5" />
              <span>Special Go Agent Network</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black mb-3">
              Earn Fixed Salary ₹5,000 + ₹19.34 Per Booking
            </h2>
            <p className="text-xs sm:text-sm text-purple-200 leading-relaxed mb-6">
              Join SafarGo's authorized Go Agent network. Serve passengers in your town with full booking support, monthly performance tracking, and ₹100 referral bonuses.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setActivePortal('go')}
                className="px-5 py-2.5 bg-safargo-orange hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-lg transition-colors flex items-center gap-2"
              >
                <span>Explore Go Agent Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActivePortal('agent')}
                className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-600 transition-colors"
              >
                Regular Agent Portal
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Offers & Promotions */}
      {activeOffers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900">Current Offers & Coupons</h2>
            <p className="text-xs text-slate-500">Genuine promotional coupons verified on server submission</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeOffers.map((offer) => (
              <div key={offer.id} className="p-4 rounded-xl bg-orange-50/60 border border-orange-200 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-safargo-orange bg-orange-100 px-2 py-0.5 rounded border border-orange-300 text-xs">
                      {offer.code}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{offer.title}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{offer.description}</p>
                  <div className="text-[10px] text-slate-500 mt-2">
                    Min Booking: ₹{offer.minBookingAmount} • Max Discount: ₹{offer.maxDiscount}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Kisan & Rural Services Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-emerald-950 border border-emerald-800/60 p-6 sm:p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                SafarGo Agricultural Hub
              </span>
              <h3 className="text-xl sm:text-2xl font-black">
                Connecting Farmers with Mandi Buyers & Transporters
              </h3>
              <p className="text-xs text-emerald-200/80 max-w-xl">
                List harvested wheat, mustard, soybean, and pulses. Receive transparent price quotes directly from verified Mandi buyers and arrange truck logistics seamlessly.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => setActivePortal('kisan')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                Farmer Portal (किसान)
              </button>
              <button
                onClick={() => setActivePortal('buyer')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-200 font-medium text-xs rounded-xl border border-emerald-700 transition-colors"
              >
                Mandi Buyer Desk
              </button>
              <button
                onClick={() => setActivePortal('transport')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-200 font-medium text-xs rounded-xl border border-emerald-700 transition-colors"
              >
                Logistics Desk
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-500">Everything you need to know about our verified booking model</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                className="w-full text-left px-4 py-3.5 font-semibold text-slate-800 text-sm flex items-center justify-between hover:bg-slate-50"
              >
                <span>{faq.q}</span>
                <span className="text-slate-400 text-lg">{faqOpen === idx ? '−' : '+'}</span>
              </button>
              {faqOpen === idx && (
                <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2.5">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
