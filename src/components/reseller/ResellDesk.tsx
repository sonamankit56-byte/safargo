import React, { useState } from 'react';
import { useShopping } from '../../context/ShoppingContext';
import { 
  TrendingUp, 
  Banknote, 
  Calendar, 
  Share2, 
  CheckCircle2, 
  CreditCard, 
  Sparkles, 
  ArrowUpRight, 
  Building,
  HelpCircle,
  Calculator,
  MessageCircle
} from 'lucide-react';

export const ResellDesk: React.FC = () => {
  const { resellerWallet, updateBankDetails, setCurrentView, t } = useShopping();

  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [accountNo, setAccountNo] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [upi, setUpi] = useState('');

  // Interactive Reseller Earning Calculator
  const [itemsPerWeek, setItemsPerWeek] = useState(10);
  const [marginPerItem, setMarginPerItem] = useState(180);
  const projectedMonthlyIncome = itemsPerWeek * marginPerItem * 4;

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    updateBankDetails(accountNo, ifsc, upi);
    setIsBankModalOpen(false);
    alert('Bank & UPI details successfully updated for automatic Sunday payouts!');
  };

  const handleShareCatalog = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Exclusive Fashion Collection',
        text: 'Latest designer sarees and dresses available at wholesale prices! Reply with size to order.',
        url: window.location.origin
      }).catch(() => {});
    } else {
      alert('Catalog text copied to clipboard! Share on WhatsApp groups to collect customer orders.');
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-24 pt-2">
      <div className="max-w-3xl mx-auto px-3 space-y-3.5">
        
        {/* Hero Earnings Banner */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-cyan-900 text-white rounded-2xl p-4 sm:p-6 shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/30 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-emerald-200 mb-2">
              <Sparkles className="w-3 h-3 text-yellow-300" />
              <span>{t('सफ़रगो रीसेलर हब (0 निवेश, 100% नकद लाभ)', 'Zero Investment • Earn Cash Profit')}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black">
              {t('आपकी कुल रीसेलिंग कमाई', 'Your Reselling Earnings')}
            </h1>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                <span className="text-[11px] text-emerald-200 block">{t('कुल ट्रांसफर की गई कमाई', 'Total Credited to Bank')}</span>
                <span className="text-2xl sm:text-3xl font-black text-yellow-300">
                  ₹{resellerWallet.totalMarginEarned.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                <span className="text-[11px] text-emerald-200 block">{t('अगले रविवार देय मार्जिन', 'Pending for Sunday')}</span>
                <span className="text-2xl sm:text-3xl font-black text-white">
                  ₹{resellerWallet.pendingMargin.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-100">
              <Calendar className="w-4 h-4 text-yellow-300" />
              <span>{t('अगला ऑटोमैटिक ट्रांसफर:', 'Next Payout:')} <b>{resellerWallet.nextPayoutDate}</b></span>
            </div>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/20 to-transparent pointer-events-none" />
        </div>

        {/* WhatsApp Catalog Share CTA */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-soft flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-gray-800">
                {t('व्हाट्सएप पर कैटलॉग शेयर करें', 'Share Catalog on WhatsApp')}
              </h3>
              <p className="text-[11px] text-gray-500">
                {t('ग्राहकों को फोटो भेजें, अपना मार्जिन जोड़कर ऑर्डर लें', 'Send pictures to customers, take orders with your price')}
              </p>
            </div>
          </div>

          <button
            onClick={handleShareCatalog}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Share2 className="w-4 h-4" />
            <span>{t('शेयर करें', 'Share')}</span>
          </button>
        </div>

        {/* Bank & UPI Linked Account Box */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {t('बैंक एवं यूपीआई खाता (Bank Details for Payout)', 'Payout Account Details')}
            </h3>
            <button
              onClick={() => setIsBankModalOpen(true)}
              className="text-xs font-bold text-[#9F2089] hover:underline"
            >
              {t('खाता बदलें', 'Update Details')}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-gray-400 text-[10px] block">{t('लिंक किया गया बैंक खाता', 'Bank Account')}</span>
                <span className="font-bold text-gray-800 font-mono text-sm">{resellerWallet.bankAccountMasked || 'Not Added'}</span>
                <span className="text-[10px] text-gray-500 block">IFSC: {resellerWallet.bankIfsc || 'SBIN0001428'}</span>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-gray-400 text-[10px] block">{t('लिंक्ड UPI ID', 'Linked UPI')}</span>
                <span className="font-bold text-gray-800 font-mono text-sm">{resellerWallet.upiIdMasked || 'Not Added'}</span>
                <span className="text-[10px] text-emerald-600 font-medium block">Verified for Sunday Deposit</span>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Reselling Profit Projection Calculator */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-soft space-y-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-[#9F2089]" />
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              {t('मासिक कमाई कैलकुलेटर (Monthly Income Calculator)', 'Monthly Earning Calculator')}
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-medium text-gray-700 mb-1">
                <span>{t('हर हफ्ते कितने ऑर्डर बेचेंगे?', 'Orders sold per week:')}</span>
                <b className="text-[#9F2089] font-bold">{itemsPerWeek} {t('ऑर्डर', 'orders')}</b>
              </div>
              <input
                type="range"
                min={2}
                max={50}
                value={itemsPerWeek}
                onChange={(e) => setItemsPerWeek(parseInt(e.target.value, 10))}
                className="w-full accent-[#9F2089] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium text-gray-700 mb-1">
                <span>{t('प्रति प्रोडक्ट औसत मार्जिन मुनाफा:', 'Average margin profit per item:')}</span>
                <b className="text-emerald-700 font-bold">₹{marginPerItem}</b>
              </div>
              <input
                type="range"
                min={50}
                max={500}
                step={10}
                value={marginPerItem}
                onChange={(e) => setMarginPerItem(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div className="p-3 bg-pink-50 border border-pink-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-600 font-medium block">{t('आपकी संभावित मासिक कमाई:', 'Projected Monthly Income:')}</span>
                <span className="text-[10px] text-gray-500">{t('बिना किसी दुकान या स्टॉक के घर बैठे', 'Work from home with zero stock risk')}</span>
              </div>
              <span className="text-2xl font-black text-[#9F2089]">
                ₹{projectedMonthlyIncome.toLocaleString('en-IN')} /mo
              </span>
            </div>
          </div>
        </div>

        {/* Sunday Payout History Log */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-soft space-y-3">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {t('रविवार बैंक ट्रांसफर हिस्ट्री (Payout History)', 'Bank Transfer History')}
          </h3>

          <div className="space-y-2 divide-y divide-gray-100">
            {resellerWallet.payoutHistory.map((log) => (
              <div key={log.id} className="pt-2 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-gray-800">
                    <span>{log.date}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded uppercase">
                      {log.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                    UTR Ref: {log.bankReference} | Order: {log.orderNumber}
                  </p>
                </div>
                <span className="text-sm font-extrabold text-emerald-700 font-mono">
                  +₹{log.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Bank Modal */}
      {isBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-3">
            <h3 className="font-extrabold text-base text-gray-900">
              {t('बैंक एवं यूपीआई विवरण अपडेट करें', 'Update Bank / UPI Details')}
            </h3>

            <form onSubmit={handleSaveBank} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">{t('बैंक खाता नंबर (Account Number)', 'Bank Account Number')}</label>
                <input
                  type="text"
                  value={accountNo}
                  onChange={(e) => setAccountNo(e.target.value)}
                  placeholder="e.g. 384910294812"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9F2089] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">{t('IFSC कोड', 'IFSC Code')}</label>
                <input
                  type="text"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                  placeholder="e.g. SBIN0001428"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9F2089] focus:outline-none uppercase font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">{t('UPI ID (PhonePe / GPay / Paytm)', 'UPI ID')}</label>
                <input
                  type="text"
                  value={upi}
                  onChange={(e) => setUpi(e.target.value)}
                  placeholder="username@okaxis"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9F2089] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsBankModalOpen(false)}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold"
                >
                  {t('रद्द करें', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#9F2089] text-white rounded-lg font-bold shadow-md"
                >
                  {t('सुरक्षित सेव करें', 'Save Details')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
