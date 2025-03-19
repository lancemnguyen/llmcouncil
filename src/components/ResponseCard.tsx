import { LLMResponse, LLMConfig } from '@/types';
import ReactMarkdown from 'react-markdown';
import { Loader2 } from 'lucide-react';

interface ResponseCardProps {
  response: LLMResponse;
  config: LLMConfig;
}

export function ResponseCard({ response, config }: ResponseCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col h-[400px]">
      <div className={`px-4 py-3 border-b ${config.color}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src={config.icon} alt={config.name} className="w-6 h-6" />
            <h3 className="font-medium text-white">{config.name}</h3>
          </div>
          <span className="text-xs text-white opacity-90">
            {config.models.find(m => m.value === config.selectedModel)?.label}
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {response.loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : response.error ? (
          <div className="text-red-500">{response.error}</div>
        ) : (
          <div className="text-black">
            <ReactMarkdown>{response.response}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
} 