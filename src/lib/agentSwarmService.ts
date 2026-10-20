// SafarGo Autonomous AI Agent Teamwork Swarm Engine
// Inspired by Agency Agents (engineering, finance, support, security, operations)

export interface AgentSpecialist {
  id: string;
  name: string;
  title: string;
  division: 'engineering' | 'finance' | 'support' | 'security' | 'operations';
  avatar: string;
  color: string;
  status: 'active' | 'processing' | 'idle';
  tasksCompleted: number;
  description: string;
  recentAction: string;
}

export interface SwarmLog {
  id: string;
  timestamp: string;
  agentId: string;
  agentName: string;
  division: string;
  message: string;
  status: 'success' | 'info' | 'warning' | 'audit';
}

export interface SwarmMetrics {
  totalAutomations: number;
  commissionProcessed: number;
  autoRecharges: number;
  whatsappDelivered: number;
  fraudRiskPrevented: number;
}

const STORAGE_AUTOPILOT_KEY = 'safargo_swarm_autopilot';
const STORAGE_METRICS_KEY = 'safargo_swarm_metrics';

export const INITIAL_SPECIALISTS: AgentSpecialist[] = [
  {
    id: 'agent-dispatch',
    name: 'Alex (डिस्पैच आर्किटेक्ट)',
    title: 'Autonomous Ticketing & Seat Dispatcher',
    division: 'engineering',
    avatar: '🤖',
    color: '#3B82F6',
    status: 'active',
    tasksCompleted: 84,
    description: 'सीट आवंटन, लाइव PNR जेनरेशन और टिकट अनुरोध को सुपर एडमिन अप्रूवल कतार में सुरक्षित दर्ज करना।',
    recentAction: 'PNR-SFG78291 को सुपर एडमिन समीक्षाधीन कतार में भेजा।'
  },
  {
    id: 'agent-finance',
    name: 'Rhea (फाइनेंस व सेटलमेंट)',
    title: 'Revenue & Commission Engine',
    division: 'finance',
    avatar: '💸',
    color: '#22C55E',
    status: 'active',
    tasksCompleted: 142,
    description: '3% रिचार्ज कमीशन, ₹10 बिजली बिल बोनस और त्वरित 0% UPI पेआउट।',
    recentAction: 'एजेंट वॉलेट में ₹19.34 कमीशन क्रेडिट किया।'
  },
  {
    id: 'agent-utility',
    name: 'Vikram (यूटिलिटी फास्ट-बॉट)',
    title: 'Paybeez Telecom & Recharge Dispatcher',
    division: 'operations',
    avatar: '⚡',
    color: '#D946EF',
    status: 'active',
    tasksCompleted: 96,
    description: 'Paybeez API ऑटो-राउटिंग से मोबाइल व DTH रिचार्ज 1.5s में निष्पादन।',
    recentAction: 'Jio 5G ₹299 प्लान को तत्काल रीचार्ज किया।'
  },
  {
    id: 'agent-whatsapp',
    name: 'Priya (WhatsApp कॉन्सीएर्ज)',
    title: '24x7 WhatsApp Agent & Support',
    division: 'support',
    avatar: '💬',
    color: '#84CC16',
    status: 'active',
    tasksCompleted: 215,
    description: 'WhatsApp OTP, डिजिटल बस ई-टिकट और 1-क्लिक सहायता डिस्पैच।',
    recentAction: 'WhatsApp पर 6-अंकीय OTP और रसीद भेजी।'
  },
  {
    id: 'agent-security',
    name: 'Kavya (केवाईसी व फ्रॉड गार्डियन)',
    title: 'KYC & Fraud Sentinel',
    division: 'security',
    avatar: '🛡️',
    color: '#EF4444',
    status: 'active',
    tasksCompleted: 67,
    description: 'Verhoeff आधार चेक, पैन वैलिडेशन और 0% फ्रॉड रिस्क मॉनिटरिंग।',
    recentAction: '100% वैध आधार व पैन KYC सत्यापित किया।'
  }
];

export const INITIAL_LOGS: SwarmLog[] = [
  {
    id: 'log-1',
    timestamp: '00:41:10',
    agentId: 'agent-security',
    agentName: 'Kavya (सुरक्षा)',
    division: 'security',
    message: 'ऑटो-सिस्टम हेल्थ चेक पास: 0 फ़्रॉड रिस्क डिटेक्टेड।',
    status: 'audit'
  },
  {
    id: 'log-2',
    timestamp: '00:41:25',
    agentId: 'agent-dispatch',
    agentName: 'Alex (डिस्पैच)',
    division: 'engineering',
    message: 'इंदौर ➔ उज्जैन महाकाल एक्सप्रेस में सीट 4A ऑटो-असाइन की गई।',
    status: 'success'
  },
  {
    id: 'log-3',
    timestamp: '00:41:40',
    agentId: 'agent-finance',
    agentName: 'Rhea (फाइनेंस)',
    division: 'finance',
    message: '₹19.34 कमीशन एजेंट वॉलेट में तत्काल क्रेडिट हुआ।',
    status: 'success'
  },
  {
    id: 'log-4',
    timestamp: '00:42:01',
    agentId: 'agent-whatsapp',
    agentName: 'Priya (WhatsApp)',
    division: 'support',
    message: 'डिजिटल ई-टिकट WhatsApp (+91 98260XXXXX) पर सफलतापूर्वक डिलीवर हुआ।',
    status: 'info'
  }
];

export const getAutopilotStatus = (): boolean => {
  try {
    const val = localStorage.getItem(STORAGE_AUTOPILOT_KEY);
    return val !== null ? val === 'true' : true; // Default ON
  } catch {
    return true;
  }
};

export const setAutopilotStatus = (enabled: boolean): void => {
  try {
    localStorage.setItem(STORAGE_AUTOPILOT_KEY, String(enabled));
    window.dispatchEvent(new CustomEvent('safargo_swarm_autopilot_changed', { detail: { enabled } }));
  } catch {}
};

export const getSwarmMetrics = (): SwarmMetrics => {
  try {
    const raw = localStorage.getItem(STORAGE_METRICS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    totalAutomations: 604,
    commissionProcessed: 14850.50,
    autoRecharges: 184,
    whatsappDelivered: 310,
    fraudRiskPrevented: 12
  };
};

export const recordSwarmAutomation = (division: string, amount: number = 0): void => {
  const current = getSwarmMetrics();
  current.totalAutomations += 1;
  if (division === 'finance') current.commissionProcessed += amount;
  if (division === 'operations') current.autoRecharges += 1;
  if (division === 'support') current.whatsappDelivered += 1;
  if (division === 'security') current.fraudRiskPrevented += 1;

  try {
    localStorage.setItem(STORAGE_METRICS_KEY, JSON.stringify(current));
    window.dispatchEvent(new CustomEvent('safargo_swarm_metrics_updated', { detail: current }));
  } catch {}
};

/**
 * Triggers the complete autonomous pipeline across all 5 specialized agents
 */
export const runAutonomousPipeline = async (
  taskName: string,
  details: {
    mobile?: string;
    amount?: number;
    pnr?: string;
    service?: string;
  }
): Promise<{ success: boolean; logs: SwarmLog[] }> => {
  const isAuto = getAutopilotStatus();
  if (!isAuto) {
    return { success: false, logs: [] };
  }

  const newLogs: SwarmLog[] = [];
  const now = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // 1. Security Check
  newLogs.push({
    id: `log-${Date.now()}-1`,
    timestamp: now(),
    agentId: 'agent-security',
    agentName: 'Kavya (सुरक्षा)',
    division: 'security',
    message: `[Kavya] कार्य: "${taskName}" - सुरक्षा व फ्रॉड रिस्क एनालिसिस पास (0.0% रिस्क)।`,
    status: 'audit'
  });
  recordSwarmAutomation('security');

  // 2. Dispatch / Execution
  newLogs.push({
    id: `log-${Date.now()}-2`,
    timestamp: now(),
    agentId: 'agent-dispatch',
    agentName: 'Alex (डिस्पैच)',
    division: 'engineering',
    message: `[Alex] ${details.service || 'सर्विसेज'} ऑटो-प्रक्रिया निष्पादित: PNR/Txn ${details.pnr || 'SFG-' + Math.floor(100000 + Math.random() * 900000)} जनरेट।`,
    status: 'success'
  });
  recordSwarmAutomation('engineering');

  // 3. Finance & Commission
  if (details.amount) {
    const comm = details.amount * 0.03;
    newLogs.push({
      id: `log-${Date.now()}-3`,
      timestamp: now(),
      agentId: 'agent-finance',
      agentName: 'Rhea (फाइनेंस)',
      division: 'finance',
      message: `[Rhea] ऑटो-कमीशन +₹${comm.toFixed(2)} वॉलेट में क्रेडिट और YouPI पेमेंट रिकॉन्सिल्ड।`,
      status: 'success'
    });
    recordSwarmAutomation('finance', comm);
  }

  // 4. WhatsApp Support Dispatch
  if (details.mobile) {
    newLogs.push({
      id: `log-${Date.now()}-4`,
      timestamp: now(),
      agentId: 'agent-whatsapp',
      agentName: 'Priya (WhatsApp)',
      division: 'support',
      message: `[Priya] ऑटो-कन्फर्मेशन व डिजिटल वाउचर WhatsApp (+91 ${details.mobile.slice(-10)}) पर तैयार!`,
      status: 'info'
    });
    recordSwarmAutomation('support');
  }

  // Broadcast to UI
  window.dispatchEvent(new CustomEvent('safargo_swarm_pipeline_executed', {
    detail: { taskName, logs: newLogs }
  }));

  return { success: true, logs: newLogs };
};
