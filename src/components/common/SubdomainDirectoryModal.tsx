import React, { useState } from 'react';
import {
  X,
  Globe,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Terminal,
  Zap,
  Award,
  Store,
  Users,
  Server,
  Layers
} from 'lucide-react';
import {
  SUBDOMAIN_CONFIGS,
  AppSubdomain,
  getCustomDomain,
  setCustomDomain,
  buildSubdomainUrl,
  setSubdomainOverride
} from '../../lib/subdomain';

interface SubdomainDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubdomainDirectoryModal: React.FC<SubdomainDirectoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [domainInput, setDomainInput] = useState(getCustomDomain());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveDomain = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomDomain(domainInput);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const subdomainsList: {
    id: AppSubdomain;
    prefix: string;
    name: string;
    role: string;
    desc: string;
    icon: any;
    color: string;
  }[] = [
    {
      id: 'admin',
      prefix: 'admin',
      name: 'सुपर एडमिन कंट्रोल पैनल',
      role: 'Super Admin Only',
      desc: 'एजेंट अनुमोदन, टिकट कन्फर्मेशन, Go Instant Add Money रिव्यू, सैलरी व सुरक्षा डेस्क',
      icon: ShieldCheck,
      color: 'bg-red-500/20 text-red-400 border-red-500/40',
    },
    {
      id: 'agent',
      prefix: 'agent',
      name: 'GO Special Agent 3D Terminal',
      role: 'GO CSC Agents',
      desc: 'फ्लैट ₹20 कमीशन, 3-मिनट अप्रूवल, Go Instant Add Money एवं एडवांस निकासी',
      icon: Zap,
      color: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    },
    {
      id: 'promoter',
      prefix: 'promoter',
      name: 'प्रमोटर पार्टनर प्रोग्राम',
      role: 'Promoter Partners',
      desc: '₹15,000 फिक्स्ड वेतन, 5 एक्सक्लूसिव स्लॉट, एजेंट ऑनबोर्डिंग व मर्चेंट लिस्टिंग',
      icon: Award,
      color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40',
    },
    {
      id: 'shop',
      prefix: 'shop',
      name: 'दुकानदार क्विक कॉमर्स पोर्टल',
      role: 'Local Merchants',
      desc: 'दुकान लिस्टिंग, 15-मिनट डिलीवरी ऑर्डर पूर्ति व Go Wallet बिक्री आय',
      icon: Store,
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    },
    {
      id: 'main',
      prefix: 'www',
      name: 'मुख्य पब्लिक यात्री पोर्टल',
      role: 'Public / Passengers',
      desc: 'ऑनलाइन बस बुकिंग, लाइव सीट मैप, ऑर्डर ट्रैकिंग व ग्राहक सहायता',
      icon: Globe,
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl max-w-2xl w-full text-white shadow-2xl overflow-hidden my-4">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-white flex items-center gap-2">
                <span>🌐 SafarGo सबडोमेन डायरेक्टरी (Dedicated Subdomains)</span>
              </h3>
              <p className="text-xs text-slate-400">
                प्रत्येक रोल का अलग सुरक्षित सबडोमेन — बिना किसी मिक्सिंग के!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-6 text-xs overflow-y-auto max-h-[75vh]">
          
          {/* Custom Domain Configuration Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-bold text-slate-300 text-xs flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-orange-400" />
                <span>आपका मुख्य डोमेन (Primary Domain):</span>
              </span>
              <form onSubmit={handleSaveDomain} className="flex items-center gap-2">
                <input
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="safargo.in"
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs outline-none focus:border-orange-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition cursor-pointer"
                >
                  सहेजें
                </button>
              </form>
            </div>
            <p className="text-[11px] text-slate-400">
              जब आप Vercel या Cloudflare में डोमेन कनेक्ट करेंगे, तो सभी सबडोमेन इसी मुख्य डोमेन के अंतर्गत स्वचालित कार्य करेंगे।
            </p>
          </div>

          {/* Subdomains Listing Cards */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
              5 अलग-अलग सबडोमेन (Separate Subdomain Architecture)
            </h4>

            {subdomainsList.map((item) => {
              const Icon = item.icon;
              const fullSubdomainUrl = buildSubdomainUrl(item.id);
              const displayDomain = `${item.prefix}.${domainInput}`;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-white text-sm font-black">{item.name}</strong>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-slate-800 text-slate-300">
                          {item.role}
                        </span>
                      </div>
                      <div className="font-mono text-xs text-amber-400 font-bold flex items-center gap-1.5">
                        <span>{displayDomain}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(displayDomain, item.id)}
                          className="text-slate-500 hover:text-white"
                          title="कॉपी करें"
                        >
                          {copiedKey === item.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSubdomainOverride(item.id);
                        window.location.href = `/?subdomain=${item.id}`;
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition border border-slate-700 cursor-pointer"
                    >
                      टेस्ट खोलें
                    </button>
                    <a
                      href={fullSubdomainUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs transition flex items-center gap-1 shadow-md cursor-pointer"
                    >
                      <span>सीधे जाएं</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DNS Configuration Guide for Connecting Domain */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="font-bold text-amber-400 flex items-center gap-1.5 text-xs">
              <Server className="w-4 h-4" />
              <span>DNS सेटअप निर्देश (Cloudflare / Hostinger / GoDaddy ➔ Vercel)</span>
            </h4>
            <div className="space-y-2 text-[11px] text-slate-300 leading-relaxed font-mono">
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">आसान तरीका (Wildcard DNS):</span>
                <code>Type: <strong>CNAME</strong> | Name: <strong>*</strong> | Target: <strong>cname.vercel-dns.com</strong></code>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px]">या अलग-अलग CNAME रिकॉर्ड्स:</span>
                <div><code>CNAME <strong>admin</strong> ➔ cname.vercel-dns.com</code></div>
                <div><code>CNAME <strong>agent</strong> ➔ cname.vercel-dns.com</code></div>
                <div><code>CNAME <strong>promoter</strong> ➔ cname.vercel-dns.com</code></div>
                <div><code>CNAME <strong>shop</strong> ➔ cname.vercel-dns.com</code></div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
          >
            बंद करें (Close)
          </button>
        </div>

      </div>
    </div>
  );
};
