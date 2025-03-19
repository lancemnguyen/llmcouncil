'use client';

import { useState } from 'react';
import { QueryInput } from '@/components/QueryInput';
import { ResponseCard } from '@/components/ResponseCard';
import { BuyMeACoffee } from '@/components/BuyMeACoffee';
import { LLMResponse, LLMConfig } from '@/types';
import { queryOpenAI, queryGemini, queryClaude, queryDeepseek } from '@/utils/api';

const llmConfigs: LLMConfig[] = [
  {
    name: 'OpenAI GPT-4',
    icon: 'https://images.seeklogo.com/logo-png/46/1/chatgpt-logo-png_seeklogo-465219.png',
    color: 'bg-green-600',
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    apiKeyName: 'OPENAI_API_KEY',
    models: [
      { value: 'gpt-4o-mini', label: 'GPT-4o-mini' }
    ],
    selectedModel: 'gpt-4o-mini'
  },
  {
    name: 'Google Gemini',
    icon: 'https://images.seeklogo.com/logo-png/61/1/gemini-icon-logo-png_seeklogo-611605.png',
    color: 'bg-blue-600',
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    apiKeyName: 'GOOGLE_API_KEY',
    models: [
      { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
      { value: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite' }
    ],
    selectedModel: 'gemini-2.0-flash'
  },
  {
    name: 'Anthropic Claude',
    icon: 'https://images.seeklogo.com/logo-png/51/1/anthropic-icon-logo-png_seeklogo-515014.png',
    color: 'bg-orange-600',
    apiEndpoint: 'https://api.anthropic.com/v1/messages',
    apiKeyName: 'ANTHROPIC_API_KEY',
    models: [
      { value: 'claude-3-5-haiku-latest', label: 'Claude 3.5 Haiku' }
    ],
    selectedModel: 'claude-3-5-haiku-latest'
  },
  {
    name: 'DeepSeek',
    icon: 'https://images.seeklogo.com/logo-png/61/1/deepseek-ai-icon-logo-png_seeklogo-611473.png',
    color: 'bg-purple-600',
    apiEndpoint: 'https://api.deepseek.com/v1/chat/completions',
    apiKeyName: 'DEEPSEEK_API_KEY',
    models: [
      { value: 'deepseek-chat', label: 'DeepSeek Chat' },
      { value: 'deepseek-reasoner', label: 'DeepSeek Reasoner' }
    ],
    selectedModel: 'deepseek-chat'
  }
];

export default function Home() {
  const [query, setQuery] = useState('');
  const [configs, setConfigs] = useState(llmConfigs);
  const [responses, setResponses] = useState<LLMResponse[]>(
    llmConfigs.map(config => ({
      model: config.name,
      response: '',
      loading: false
    }))
  );

  const handleModelChange = (provider: string, model: string) => {
    setConfigs(prev =>
      prev.map(config =>
        config.name === provider
          ? { ...config, selectedModel: model }
          : config
      )
    );
  };

  const handleSubmit = async () => {
    if (!query.trim()) return;

    setResponses(prev => 
      prev.map(response => ({
        ...response,
        loading: true,
        error: undefined
      }))
    );

    const apiCalls = [
      { 
        index: 0, 
        promise: queryOpenAI(query, configs[0].selectedModel)
      },
      { 
        index: 1, 
        promise: queryGemini(query, configs[1].selectedModel)
      },
      { 
        index: 2, 
        promise: queryClaude(query, configs[2].selectedModel)
      },
      { 
        index: 3, 
        promise: queryDeepseek(query, configs[3].selectedModel)
      }
    ];

    for (const { index, promise } of apiCalls) {
      promise
        .then(response => {
          setResponses(prev => 
            prev.map((r, i) => 
              i === index
                ? { ...r, loading: false, response, error: undefined }
                : r
            )
          );
        })
        .catch(error => {
          setResponses(prev => 
            prev.map((r, i) => 
              i === index
                ? {
                    ...r,
                    loading: false,
                    response: '',
                    error: error.message || 'An error occurred while fetching the response'
                  }
                : r
            )
          );
        });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 relative">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">LLM Council</h1>
          <p className="text-gray-600">Compare responses from different language models</p>
        </div>

        <QueryInput
          query={query}
          setQuery={setQuery}
          onSubmit={handleSubmit}
          loading={responses.some(r => r.loading)}
          configs={configs}
          onModelChange={handleModelChange}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {responses.map((response, index) => (
            <ResponseCard
              key={response.model}
              response={response}
              config={configs[index]}
            />
          ))}
        </div>

        <BuyMeACoffee />
      </div>
    </div>
  );
}
