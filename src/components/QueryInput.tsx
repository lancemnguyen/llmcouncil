'use client';

import { LLMConfig } from '@/types';
import dynamic from 'next/dynamic';
import { Send } from 'lucide-react';
import { useRef, useEffect } from 'react';
import { CSSObjectWithLabel } from 'react-select';

const Select = dynamic(() => import('react-select'), {
  ssr: false
});

interface QueryInputProps {
  query: string;
  setQuery: (query: string) => void;
  onSubmit: () => void;
  loading: boolean;
  configs: LLMConfig[];
  onModelChange: (provider: string, model: string) => void;
}

const selectStyles = {
  option: (base: CSSObjectWithLabel, state: { isSelected: boolean }) => ({
    ...base,
    color: state.isSelected ? 'white' : '#111827',
    backgroundColor: state.isSelected ? '#2563eb' : 'white',
    '&:hover': {
      backgroundColor: state.isSelected ? '#2563eb' : '#f3f4f6',
    },
  }),
  singleValue: (base: CSSObjectWithLabel) => ({
    ...base,
    color: '#111827',
  }),
};

export function QueryInput({
  query,
  setQuery,
  onSubmit,
  loading,
  configs,
  onModelChange,
}: QueryInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit();
      setQuery('');
    }
  };

  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {configs.map((config, index) => (
          <div key={config.name} className="space-y-2">
            <div className="flex items-center space-x-2">
              <img src={config.icon} alt={config.name} className="w-6 h-6" />
              <span className="text-sm font-medium text-gray-700">{config.name}</span>
            </div>
            <Select
              instanceId={`model-select-${index}`}
              options={config.models}
              value={config.models.find(m => m.value === config.selectedModel)}
              onChange={(option: unknown) => {
                if (option && typeof option === 'object' && 'value' in option) {
                  onModelChange(config.name, (option as { value: string }).value);
                }
              }}
              isDisabled={loading}
              className="text-sm"
              styles={selectStyles}
            />
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your prompt here..."
          className="w-full px-4 py-3 pr-12 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          disabled={loading}
          autoFocus
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
} 