import { useEffect, useState } from 'react';
import { Clock, Activity } from 'lucide-react';
import { getAuditLogs, AuditLog } from '../utils/supabase';

interface AuditTrailProps {
  credentialId: string;
}

export default function AuditTrail({ credentialId }: AuditTrailProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuditLogs();
  }, [credentialId]);

  const loadAuditLogs = async () => {
    setLoading(true);
    const auditLogs = await getAuditLogs(credentialId);
    setLogs(auditLogs);
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  /* ===== DARK-THEME ACTION BADGES ===== */
  const getActionColor = (action: string) => {
    switch (action) {
      case 'issued':
        return 'bg-green-500/15 text-green-400 border border-green-600/40';
      case 'verified':
        return 'bg-blue-500/15 text-blue-400 border border-blue-600/40';
      case 'shared':
        return 'bg-purple-500/15 text-purple-400 border border-purple-600/40';
      case 'revoked':
        return 'bg-red-500/15 text-red-400 border border-red-600/40';
      default:
        return 'bg-gray-500/15 text-gray-300 border border-gray-600/40';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFC700]" />
      </div>
    );
  }

  return (
    <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] p-6 shadow-xl">
      {/* HEADER */}
      <div className="flex items-center mb-6">
        <Activity className="w-5 h-5 text-[#FFC700] mr-2" />
        <h3 className="text-lg font-semibold text-white">
          Audit Trail
        </h3>
      </div>

      {logs.length === 0 ? (
        <p className="text-[#BFBFBF] text-center py-10">
          No audit logs available
        </p>
      ) : (
        <div className="space-y-5">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start space-x-4 pb-5
                border-b border-[#2A2A2A] last:border-0"
            >
              {/* ICON */}
              <div className="flex-shrink-0">
                <Clock className="w-5 h-5 text-[#BFBFBF] mt-1" />
              </div>

              {/* CONTENT */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-1">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full
                      ${getActionColor(log.action)}`}
                  >
                    {log.action.toUpperCase()}
                  </span>
                  <span className="text-sm text-[#BFBFBF]">
                    {formatDate(log.created_at)}
                  </span>
                </div>

                <p className="text-sm text-[#BFBFBF] mb-1">
                  Actor:{' '}
                  <span className="font-mono text-xs text-white">
                    {log.actor_address}
                  </span>
                </p>

                {/* METADATA */}
                {Object.keys(log.metadata).length > 0 && (
                  <details className="mt-3">
                    <summary className="text-xs text-[#FFC700] cursor-pointer hover:underline">
                      View details
                    </summary>
                    <pre
                      className="mt-2 text-xs bg-[#0A0A0A]
                        border border-[#2A2A2A]
                        p-3 rounded-lg overflow-x-auto text-[#BFBFBF]"
                    >
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
