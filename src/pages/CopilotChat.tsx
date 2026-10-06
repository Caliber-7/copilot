import React, { useState, useEffect } from 'react';
import { missionApi } from '../services/api';
import { CopilotMessage } from '../types/mission';
import { PageHeader } from '../components/layout/PageHeader';
import { CopilotChatPanel } from '../components/investigation/CopilotChatPanel';
import { Bot, RotateCcw } from 'lucide-react';

export const CopilotChatPage: React.FC = () => {
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      const data = await missionApi.getCopilotMessages();
      setMessages(data);
    };
    fetchMessages();
  }, []);

  const handleSendMessage = async (query: string) => {
    setLoading(true);
    try {
      await missionApi.submitCopilotQuery(query);
      const updated = await missionApi.getCopilotMessages();
      setMessages(updated);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = async () => {
    await missionApi.resetDemoScenario();
    const refreshed = await missionApi.getCopilotMessages();
    setMessages(refreshed);
  };

  return (
    <div>
      <PageHeader
        title="AI Copilot Assistant"
        subtitle="Conversational anomaly diagnosis grounded in spacecraft telemetry and flight operations flight rules"
        actions={
          <button
            onClick={handleResetChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#101b2f] hover:bg-[#182a47] border border-[#1e3256] text-xs font-mono text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
            <span>Reset Conversation</span>
          </button>
        }
      />

      <CopilotChatPanel
        messages={messages}
        onSendMessage={handleSendMessage}
        loading={loading}
      />
    </div>
  );
};
