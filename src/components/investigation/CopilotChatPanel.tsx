import React, { useState } from 'react';
import { Bot, User, Send, Sparkles, ThumbsUp, ThumbsDown, ArrowRight, CornerDownLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CopilotMessage } from '../../types/mission';
import { missionApi } from '../../services/api';

interface CopilotChatPanelProps {
  messages: CopilotMessage[];
  onSendMessage: (query: string) => Promise<void>;
  loading?: boolean;
}

export const CopilotChatPanel: React.FC<CopilotChatPanelProps> = ({
  messages,
  onSendMessage,
  loading = false,
}) => {
  const navigate = useNavigate();
  const [input, setInput] = useState('');

  const quickPrompts = [
    'Why was this anomaly detected?',
    'Which procedure applies to this anomaly?',
    'Are there similar historical incidents?',
    'What is the correlation between current and thermal rise?',
  ];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;
    const query = input.trim();
    setInput('');
    await onSendMessage(query);
  };

  const handleActionClick = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('evidence')) {
      navigate('/evidence/TEL-4821');
    } else if (act.includes('timeline')) {
      navigate('/timeline/ANOM-004');
    } else if (act.includes('procedure')) {
      navigate('/procedures');
    } else if (act.includes('similar') || act.includes('incident')) {
      navigate('/historical');
    } else {
      onSendMessage(action);
    }
  };

  return (
    <div className="bg-[#0c1524] border border-[#1a2842] rounded-lg shadow-md flex flex-col h-[650px] overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-[#09101c] border-b border-[#1a2842] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-700/50 flex items-center justify-center text-purple-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              AI Copilot Assistant
            </h2>
            <p className="text-[11px] text-slate-400">
              Spacecraft diagnostics &amp; telemetry reasoning
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 font-semibold">
          Model: Mission-RAG v4.2
        </span>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-sky-600 text-white'
                    : 'bg-purple-950 border border-purple-600/50 text-purple-300'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-xl rounded-xl p-3.5 text-xs ${
                  isUser
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'bg-[#09101c] border border-[#1e2f4f] text-slate-200 shadow-md'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1 text-[10px] opacity-75 font-mono">
                  <span>{isUser ? 'Flight Operator' : 'Mission Copilot'}</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div className="leading-relaxed whitespace-pre-wrap">{msg.text}</div>

                {/* Supporting Evidence Card */}
                {msg.supportingEvidence && msg.supportingEvidence.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-[#1a2842] space-y-1.5 text-[11px]">
                    <div className="font-mono text-slate-400 text-[10px] font-semibold uppercase">
                      Supporting Evidence
                    </div>
                    {msg.supportingEvidence.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => navigate(`/evidence/${ev.id}`)}
                        className="flex items-center justify-between p-1.5 rounded bg-[#0e1726] hover:bg-[#142338] border border-[#182845] cursor-pointer text-slate-300 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sky-400 text-[10px]">
                            {ev.id}
                          </span>
                          <span className="truncate">{ev.label}</span>
                        </div>
                        <span className="font-mono text-emerald-400 font-bold">
                          {ev.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Meta info & suggestions */}
                {!isUser && (
                  <div className="mt-3 pt-2 border-t border-[#16233b] flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
                    <div className="flex items-center gap-3">
                      <span>Confidence: {msg.confidence?.toFixed(2) || '0.82'}</span>
                      <span>Sources: {msg.sourcesCount || 4}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <button className="hover:text-slate-300 p-0.5">
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                      <button className="hover:text-slate-300 p-0.5">
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Action chips */}
                {msg.suggestedActions && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {msg.suggestedActions.map((act) => (
                      <button
                        key={act}
                        onClick={() => handleActionClick(act)}
                        className="px-2 py-0.5 rounded bg-[#132238] hover:bg-sky-600/30 text-sky-300 hover:text-white border border-[#1d3559] text-[10px] font-mono flex items-center gap-1 transition-colors"
                      >
                        <span>{act}</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3 text-xs text-purple-400 font-mono">
            <Bot className="w-4 h-4 animate-spin" />
            <span>Mission Copilot synthesizing telemetry correlations...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 bg-[#080e1a] border-t border-[#16233b] flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] font-mono text-slate-500 flex-shrink-0">
          Suggested:
        </span>
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSendMessage(prompt)}
            className="px-2.5 py-1 rounded bg-[#0d1627] hover:bg-[#142338] text-slate-300 hover:text-white text-[11px] border border-[#1a2b47] whitespace-nowrap transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Query Input */}
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-[#09101c] border-t border-[#1a2842] flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about this investigation..."
          className="flex-1 bg-[#0e1726] border border-[#1e2f4f] text-slate-200 placeholder-slate-500 text-xs rounded px-3 py-2.5 focus:outline-none focus:border-sky-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-4 py-2.5 rounded bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
        >
          <span>Send</span>
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
