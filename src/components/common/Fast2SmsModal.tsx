import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  KeyRound,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Eye,
  EyeOff,
  RefreshCw,
  X,
  MessageSquare,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { getSmsConfig, saveSmsConfig, testFast2SmsConnection } from '../../lib/smsService';

interface Fast2SmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMobile?: string;
}

export const Fast2SmsModal: React.FC<Fast2SmsModalProps> = ({
  isOpen,
  onClose,
  defaultMobile = ''
}) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testMobile, setTestMobile] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    raw?: any;
  } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [whatsappDelivery, setWhatsappDelivery] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const cfg = getSmsConfig();
      setApiKey(cfg.fast2smsApiKey || '');
      setWhatsappDelivery(cfg.autoDeliverViaWhatsApp);
      if (defaultMobile) {
        setTestMobile(defaultMobile.replace(/\D/g, '').slice(-10));
      }
      setTestResult(null);
      setSaveSuccess(false);
    }
  }, [isOpen, defaultMobile]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveSmsConfig({
      fast2smsApiKey: apiKey.trim(),
      autoDeliverViaWhatsApp: whatsappDelivery
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleTestSms = async () => {
    const clean = testMobile.replace(/\D/g, '').slice(-10);
    if (!clean || clean.length !== 10) {
      setTestResult({
        success: false,
        message: 'कृपया सही 10-अंकीय भारतीय मोबाइल नंबर दर्ज करें (उदा. 9826012345)'
      });
      return;
    }

    if (!apiKey.trim()) {
      setTestResult({
        success: false,
        message: 'कृपया पहले अपनी Fast2SMS API Authorization Key दर्ज करें'
      });
      return;
    }

    // Auto save first
    saveSmsConfig({
      fast2smsApiKey: apiKey.trim(),
      autoDeliverViaWhatsApp: whatsappDelivery
    });

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await testFast2SmsConnection(apiKey.trim(), clean);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `त्रुटि: ${err?.message || 'कनेक्शन विफल'}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  const isConfigured = apiKey.trim().length > 5;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-rose-950/50 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 p-0.5 shadow-lg shadow-rose-600/30 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-rose-400">
                <Smartphone className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Fast2SMS रियल OTP गेटवे</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isConfigured 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {isConfigured ? '🟢 सक्रिय (Active)' : '🟡 सेटअप आवश्यक'}
                </span>
              </div>
              <p className="text-xs text-slate-400">भारतीय मोबाइल नंबरों पर असली SMS भेजने का सिस्टम</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Info Banner */}
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 text-xs text-rose-200">
            <ShieldCheck className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-rose-300">100% भारतीय DLT/OTP अधिकृत गेटवे</p>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Fast2SMS API से एजेंट लॉगिन और रजिस्ट्रेशन का 6-अंकीय OTP सीधे उपयोगकर्ता के असली फ़ोन पर SMS के रूप में डिलीवर होता है।
              </p>
            </div>
          </div>

          {/* API Key Configuration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-rose-400" />
                <span>Fast2SMS Authorization API Key</span>
              </label>
              <a
                href="https://www.fast2sms.com/dashboard/dev-api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-rose-400 hover:underline flex items-center gap-1"
              >
                <span>Free Key प्राप्त करें</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="उदा. sL6bH4vK3cPxR2w9m8..."
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-rose-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-400">
                (API Key ब्राउज़र स्टोरेज एवं .env में सुरक्षित सेव रहती है)
              </span>
              <button
                type="button"
                onClick={handleSave}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5 shadow-md"
              >
                {saveSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                <span>{saveSuccess ? 'सहेजा गया!' : 'Key सेव करें'}</span>
              </button>
            </div>
          </div>

          {/* WhatsApp Dual Delivery Option */}
          <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-xs font-bold text-slate-200">WhatsApp पर भी OTP भेजें</p>
                <p className="text-[10px] text-slate-400">SMS के साथ WhatsApp पर भी डुअल-डिलीवरी</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={whatsappDelivery}
              onChange={(e) => {
                setWhatsappDelivery(e.target.checked);
                saveSmsConfig({ autoDeliverViaWhatsApp: e.target.checked });
              }}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          {/* Live SMS Tester */}
          <div className="p-4 bg-slate-800/40 border border-slate-700/80 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>लाइव SMS डिलीवरी टेस्ट करें (Live Test)</span>
              </h4>
              <span className="text-[10px] text-slate-400">तुरंत SMS चेक करें</span>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={testMobile}
                  onChange={(e) => setTestMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="अपना 10-अंकीय मोबाइल नंबर"
                  className="w-full pl-11 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="button"
                onClick={handleTestSms}
                disabled={isTesting}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>भेजा जा रहा है...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>टेस्ट SMS भेजें</span>
                  </>
                )}
              </button>
            </div>

            {/* Test Result Box */}
            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs animate-fade-in ${
                  testResult.success
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-semibold">{testResult.message}</p>
                    {testResult.raw?.request_id && (
                      <p className="text-[10px] font-mono opacity-80">
                        Request ID: {testResult.raw.request_id}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Powered by Fast2SMS Bulk V2 India
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition"
          >
            पूर्ण करें (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
