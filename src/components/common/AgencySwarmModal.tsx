import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Zap,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  MessageCircle,
  Code,
  Activity,
  X,
  Play,
  RefreshCw,
  Cpu,
  Layers,
  TrendingUp,
  Terminal,
  Clock,
  Radio
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  INITIAL_SPECIALISTS,
  INITIAL_LOGS,
  AgentSpecialist,
  SwarmLog,
  getAutopilotStatus,
  setAutopilotStatus,
  getSwarmMetrics,
  runAutonomousPipeline
} from '../../lib/agentSwarmService';

interface AgencySwarmModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AgencySwarmModal: React.FC<AgencySwarmModalProps> = ({
  isOpen: propsIsOpen,
  onClose: propsOnClose
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [autopilot, setAutopilot] = useState(true);
  const [specialists, setSpecialists] = useState<AgentSpecialist[]>(INITIAL_SPECIALISTS);
  const [logs, setLogs] = useState<SwarmLog[]>(INITIAL_LOGS);
  const [metrics, setMetrics] = useState(getSwarmMetrics());
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    if (propsIsOpen !== undefined) {
      setIsOpen(propsIsOpen);
    }
  }, [propsIsOpen]);

  useEffect(() => {
    setAutopilot(getAutopilotStatus());
    setMetrics(getSwarmMetrics());

    const handleOpen = () => {
      setIsOpen(true);
      setAutopilot(getAutopilotStatus());
      setMetrics(getSwarmMetrics());
    };

    const handlePipeline = (e: any) => {
      if (e.detail?.logs) {
        setLogs(prev => [...e.detail.logs, ...prev].slice(0, 30));
        setMetrics(getSwarmMetrics());
      }
    };

    window.addEventListener('safargo_open_swarm_modal', handleOpen);
    window.addEventListener('safargo_swarm_pipeline_executed', handlePipeline);

    return () => {
      window.removeEventListener('safargo_open_swarm_modal', handleOpen);
      window.removeEventListener('safargo_swarm_pipeline_executed', handlePipeline);
    };
  }, []);

  const handleToggleAutopilot = () => {
    const next = !autopilot;
    setAutopilot(next);
    setAutopilotStatus(next);
  };

  const handleSimulateSwarm = async () => {
    setIsSimulating(true);

    // Pulse specialist statuses
    setSpecialists(prev => prev.map(s => ({ ...s, status: 'processing' })));

    try {
      const res = await runAutonomousPipeline('ऑटो-बुकिंग व Paybeez रिचार्ज डिस्पैच', {
        mobile: '9826012345',
        amount: 450,
        service: 'इंदौर ➔ भोपाल सुपरफास्ट बस',
        pnr: `SFG-${Math.floor(100000 + Math.random() * 900000)}`
      });

      if (res.logs) {
        setLogs(prev => [...res.logs, ...prev].slice(0, 30));
        setMetrics(getSwarmMetrics());
      }

      try {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
      } catch {}
    } finally {
      setTimeout(() => {
        setSpecialists(prev => prev.map(s => ({
          ...s,
          status: 'active',
          tasksCompleted: s.tasksCompleted + 1
        })));
        setIsSimulating(false);
      }, 800);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (propsOnClose) propsOnClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-b border-indigo-800/40 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-xl shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-indigo-400">
                <Cpu className="w-6 h-6 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white tracking-tight">
                  🎭 SafarGo AI Agent Swarm • ऑटोनॉमस टीमवर्क हब
                </h3>
                <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <Radio className="w-3 h-3 animate-ping text-emerald-400" />
                  <span>5 एजेंट्स लाइव</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Agency Agents आर्किटेक्चर: इंजीनियरिंग, फाइनेंस, यूटिलिटी, व्हाट्सएप व सुरक्षा स्वार्म
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Autopilot Control Banner */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg ${
                autopilot ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-slate-700'
              }`}>
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white">
                    पूर्ण ऑटोपायलट मोड (Autonomous Autopilot)
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    autopilot ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {autopilot ? '⚡ सक्रिय (ACTIVE)' : 'मैनुअल मोड'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  सभी 5 AI स्पेशलिस्ट हर बुकिंग, रीचार्ज और कमीशन को बिना किसी मानवीय हस्तक्षेप के तुरंत ऑटो-प्रोसेस करते हैं।
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleSimulateSwarm}
                disabled={isSimulating}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer"
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>स्वार्म चल रहा है...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>🚀 1-क्लिक टेस्ट रन</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleToggleAutopilot}
                className={`px-4 py-2.5 rounded-xl font-black text-xs transition cursor-pointer border ${
                  autopilot
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {autopilot ? 'चालू (ON)' : 'बंद (OFF)'}
              </button>
            </div>
          </div>

          {/* Swarm Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                🔄 कुल ऑटो-टास्क
              </span>
              <span className="text-xl font-black text-white mt-0.5 block">
                {metrics.totalAutomations}
              </span>
            </div>

            <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                💰 प्रोसेस्ड कमीशन
              </span>
              <span className="text-xl font-black text-emerald-300 mt-0.5 block">
                ₹{metrics.commissionProcessed.toFixed(2)}
              </span>
            </div>

            <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl">
              <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider block">
                ⚡ ऑटो-रिचार्ज
              </span>
              <span className="text-xl font-black text-pink-300 mt-0.5 block">
                {metrics.autoRecharges}
              </span>
            </div>

            <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl">
              <span className="text-[10px] font-bold text-lime-400 uppercase tracking-wider block">
                💬 WhatsApp डिस्पैच
              </span>
              <span className="text-xl font-black text-lime-300 mt-0.5 block">
                {metrics.whatsappDelivered}
              </span>
            </div>
          </div>

          {/* Team Specialists Roster (Agency Agents Style) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>विशेषज्ञ एजेंट टीम (Active Specialists Roster)</span>
              </h4>
              <span className="text-[11px] text-slate-400">स्वायत्त निष्पादन क्षमता</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {specialists.map((agent) => (
                <div
                  key={agent.id}
                  className="p-3.5 bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/70 rounded-2xl transition space-y-2 relative overflow-hidden group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-lg shrink-0">
                        {agent.avatar}
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-white">{agent.name}</h5>
                        <p className="text-[10px] font-mono font-medium text-slate-400">{agent.title}</p>
                      </div>
                    </div>

                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                      agent.status === 'processing'
                        ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {agent.status === 'processing' ? '⚙️ कार्य जारी' : '🟢 एक्टिव'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {agent.description}
                  </p>

                  <div className="pt-2 border-t border-slate-750 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">कार्य पूरे: <strong className="text-white">{agent.tasksCompleted}</strong></span>
                    <span className="font-mono text-indigo-400 bg-slate-900/60 px-1.5 py-0.5 rounded">
                      {agent.division}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Inter-Agent Terminal Stream */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>लाइव एजेंट-टू-एजेंट संचार लॉग (Swarm Terminal Stream)</span>
              </h4>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>REAL-TIME PIPELINE</span>
              </span>
            </div>

            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-xs text-slate-300 space-y-2 max-h-48 overflow-y-auto shadow-inner">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2.5 leading-relaxed text-[11px]">
                  <span className="text-slate-500 shrink-0 font-medium">[{log.timestamp}]</span>
                  <span className={`font-bold shrink-0 ${
                    log.division === 'engineering' ? 'text-blue-400' :
                    log.division === 'finance' ? 'text-emerald-400' :
                    log.division === 'support' ? 'text-lime-400' :
                    log.division === 'security' ? 'text-rose-400' : 'text-purple-400'
                  }`}>
                    {log.agentName}:
                  </span>
                  <span className="text-slate-200">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400">
            Powered by SafarGo Autonomous Swarm Protocol (Agency Agents Standard)
          </span>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition cursor-pointer"
          >
            पूर्ण करें (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
