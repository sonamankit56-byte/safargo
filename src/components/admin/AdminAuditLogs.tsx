import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { History, Shield, Search, Filter } from 'lucide-react';

export const AdminAuditLogs: React.FC = () => {
  const { auditLogs } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = auditLogs.filter((log) => {
    return (
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.record_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.actor_email && log.actor_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.record_id && log.record_id.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            सुरक्षा एवं गतिविधि ऑडिट ट्रेल्स (Security & Audit Trail)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            प्रत्येक क्रिया, पुष्टि, कमीशन एवं सेटिंग परिवर्तन का अपरिवर्तनीय रिकॉर्ड (Immutable Logs)
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 block">Total Logs Recorded</span>
          <span className="text-sm font-bold text-slate-900">{auditLogs.length} Events</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search action, actor, record type..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            कोई ऑडिट लॉग रिकॉर्ड नहीं मिला।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-300 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">Event ID</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Actor</th>
                  <th className="p-4">Record Type & ID</th>
                  <th className="p-4">Timestamp (IST)</th>
                  <th className="p-4">Payload / Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-mono text-slate-500">{log.id}</td>
                    
                    <td className="p-4">
                      <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded uppercase text-[11px]">
                        {log.action}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="font-semibold text-slate-800 block">
                        {log.actor_email || 'System / Auto'}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">
                        Role: {log.actor_role || 'Daemon'}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="text-slate-700 font-medium block">{log.record_type}</span>
                      {log.record_id && (
                        <span className="text-[10px] font-mono text-slate-400">{log.record_id}</span>
                      )}
                    </td>

                    <td className="p-4 text-slate-500 font-mono">
                      {new Date(log.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </td>

                    <td className="p-4 max-w-xs truncate font-mono text-[11px] text-slate-600">
                      {log.metadata ? JSON.stringify(log.metadata) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
