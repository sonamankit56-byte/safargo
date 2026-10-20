import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Sparkles, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Compass, 
  Bus, 
  MapPin, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { useTravel } from '../../context/TravelContext';

interface AiMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  actionText?: string;
  actionService?: any;
  timestamp: string;
}

export const SafarGoAiCopilot: React.FC = () => {
  const { t, setActiveService } = useTravel();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<AiMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: 'नमस्ते! 🙏 मैं हूँ आपका सफ़रगो AI यात्रा सहायक (SafarGo AI Copilot)। मैं मध्य प्रदेश के सभी 55 जिलों की बसें, महाकाल उज्जैन दर्शन, PNR स्टेटस और एजेंट कमाई में आपकी मदद कर सकता हूँ। आप क्या जानना चाहते हैं?',
      timestamp: 'अभी'
    }
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Voice Input via Web Speech API
  const handleToggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('आपके ब्राउज़र में वॉइस रिकॉग्निशन सपोर्ट उपलब्ध नहीं है। कृपया टाइप करें।');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN';
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleSendQuery(transcript);
      };

      recognition.start();
    } catch (e) {
      console.warn('Speech recognition error:', e);
      setIsListening(false);
    }
  };

  // Text-to-Speech synthesis
  const handleSpeak = (text: string) => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  };

  const handleSendQuery = (customText?: string) => {
    const query = (customText || inputText).trim();
    if (!query) return;

    const userMsg: AiMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // AI Intent Processor
    setTimeout(() => {
      const qLower = query.toLowerCase();
      let aiReply = '';
      let actText = '';
      let actSrv: any = null;

      if (qLower.includes('उज्जैन') || qLower.includes('महाकाल') || qLower.includes('ujjain') || qLower.includes('mahakal')) {
        aiReply = 'श्री महाकालेश्वर ज्योतिर्लिंग, उज्जैन के लिए इंदौर और भोपाल से हर 15 मिनट में बसें उपलब्ध हैं! भस्म आरती का समय प्रातः 4:00 AM से 6:00 AM है। आप सीधे इंदौर से उज्जैन (55 किमी, 1 घंटा 15 मिनट) की बस बुक कर सकते हैं।';
        actText = '🚌 उज्जैन बसें देखें';
        actSrv = 'bus';
      } else if (qLower.includes('भोपाल') || qLower.includes('bhopal') || qLower.includes('इंदौर') || qLower.includes('indore')) {
        aiReply = 'इंदौर ⇄ भोपाल हाईवे पर हंस ट्रैवल्स, न्यूगो इलेक्ट्रिक बसें और सूत्र सेवा की कुल 48+ बसें 24 घंटे चलती हैं। किराया ₹220 से ₹650 तक है। औसतन 3 घंटे 45 मिनट का समय लगता है।';
        actText = '⚡ आज की बसें खोजें';
        actSrv = 'bus';
      } else if (qLower.includes('कमीशन') || qLower.includes('एजेंट') || qLower.includes('agent') || qLower.includes('earning')) {
        aiReply = 'सफ़रगो अधिकृत एजेंट बनने पर आपको हर टिकट बुकिंग पर फ्लैट ₹19.34 निश्चित कमीशन मिलता है! साथ ही रविवार को 10:00 AM पर स्वतः आपके बैंक/UPI में पेआउट आ जाता है।';
        actText = '💼 पार्टनर हब खोलें';
        actSrv = 'agent';
      } else if (qLower.includes('pnr') || qLower.includes('पीएनआर') || qLower.includes('स्टेटस') || qLower.includes('ट्रैक')) {
        aiReply = 'आप अपने 10-अंकीय PNR नंबर से बस की लाइव जीपीएस लोकेशन, गति (Speed) और चालक का संपर्क नंबर रियल-टाइम में देख सकते हैं।';
        actText = '🔎 PNR स्टेटस चेक करें';
        actSrv = 'trips';
      } else if (qLower.includes('ओंकारेश्वर') || qLower.includes('omkareshwar') || qLower.includes('महेश्वर')) {
        aiReply = 'ओंकारेश्वर ममलेश्वर ज्योतिर्लिंग इंदौर से 77 किमी दक्षिण में नर्मदा नदी के तट पर स्थित है। यहां के लिए इंदौर सरवटे स्टैंड से प्रतिदिन सुबह 6:00 से रात 8:00 तक सीधी बसें चलती हैं।';
        actText = '📍 ओंकारेश्वर बस खोजें';
        actSrv = 'bus';
      } else {
        aiReply = `सफ़रगो पर आपकी यात्रा 100% सुरक्षित है! मध्य प्रदेश के सभी 55 जिलों, तहसीलों व गांवों में 2,500+ अधिकृत बसों का नेटवर्क उपलब्ध है। आप कभी भी लाइव बस ट्रैक कर सकते हैं या टिकट बुक कर सकते हैं।`;
        actText = '🚌 मुख्य बस सर्च पर जाएं';
        actSrv = 'bus';
      }

      const aiMsg: AiMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReply,
        actionText: actText,
        actionService: actSrv,
        timestamp: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
    }, 400);
  };

  const quickPrompts = [
    'महाकाल उज्जैन बसें',
    'इंदौर से भोपाल सबसे तेज बस',
    'एजेंट कमीशन कितना मिलता है?',
    'लाइव PNR ट्रैकिंग कैसे करें?'
  ];

  return (
    <>
      {/* Floating Trigger Pill */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 z-40 bg-gradient-to-r from-indigo-900 via-indigo-600 to-rose-600 text-white rounded-full p-2.5 sm:px-4 sm:py-3 shadow-2xl hover:shadow-indigo-500/50 border-2 border-white/40 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all duration-300 group"
        >
          <div className="relative">
            <Bot className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-indigo-900"></span>
          </div>
          <span className="hidden sm:inline font-black text-xs tracking-wide">
            {t('सफ़रगो AI सहायक', 'SafarGo AI Copilot')}
          </span>
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
        </button>
      )}

      {/* AI Chat Window Modal */}
      {isOpen && (
        <div className="fixed bottom-20 sm:bottom-24 right-2 sm:right-6 z-50 w-[95%] sm:w-[390px] h-[520px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-fade-in">
          {/* AI Header */}
          <div className="p-4 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-900/40">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-rose-500 flex items-center justify-center text-white shadow-md">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-sm tracking-tight">सफ़रगो AI यात्रा साथी</h3>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[9px] font-black px-1.5 py-0.2 rounded-full">
                    LIVE
                  </span>
                </div>
                <p className="text-[10px] text-indigo-200 font-medium">MP बसें, महाकाल यात्रा, PNR व कमाई</p>
              </div>
            </div>

            <button
              onClick={() => {
                if (window.speechSynthesis) window.speechSynthesis.cancel();
                setIsSpeaking(false);
                setIsOpen(false);
              }}
              aria-label="सफ़रगो AI बंद करें"
              className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed shadow-sm ${
                    m.sender === 'user'
                      ? 'bg-rose-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="font-medium text-xs whitespace-pre-wrap">{m.text}</p>

                  {m.actionText && m.actionService && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveService(m.actionService);
                        setIsOpen(false);
                      }}
                      className="mt-2.5 w-full py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 font-black text-[11px] rounded-xl flex items-center justify-between transition"
                    >
                      <span>{m.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {m.sender === 'ai' && (
                    <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{m.timestamp}</span>
                      <button
                        onClick={() => handleSpeak(m.text)}
                        className="hover:text-indigo-600 flex items-center gap-0.5"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>सुनें</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Question Chips */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 overflow-x-auto flex gap-1.5 no-scrollbar">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendQuery(p)}
                className="whitespace-nowrap px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 rounded-full text-[10px] font-bold text-slate-600 transition shrink-0"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendQuery();
              }}
              className="flex items-center gap-1.5"
            >
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`p-2.5 rounded-xl transition shrink-0 ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
                title="बोलकर पूछें (Voice Search)"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isListening ? 'बोलिए, मैं सुन रहा हूँ...' : 'हिंदी या English में पूछें...'}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <button
                type="submit"
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl shadow transition shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
