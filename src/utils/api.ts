import { APIError } from '@/types';

const RATE_LIMIT_STATUS_CODES = [429, 408, 503];
const MAX_RETRIES = 3;
const BASE_DELAY = 1000;

interface FetchAPIError extends Error {
  status?: number;
  retryAfter?: number;
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retryCount = 0
): Promise<Response> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const error = new Error() as APIError;
      error.status = response.status;
      error.message = await response.text();

      if (RATE_LIMIT_STATUS_CODES.includes(response.status)) {
        error.retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10);
      }

      throw error;
    }

    return response;
  } catch (error) {
    if (
      retryCount < MAX_RETRIES &&
      error instanceof Error &&
      (error as FetchAPIError).status !== undefined &&
      RATE_LIMIT_STATUS_CODES.includes((error as FetchAPIError).status!)
    ) {
      const apiError = error as FetchAPIError;
      const retryDelay = apiError.retryAfter
        ? apiError.retryAfter * 1000
        : BASE_DELAY * Math.pow(2, retryCount);
    
      await delay(retryDelay);
      return fetchWithRetry(url, options, retryCount + 1);
    }    

    throw error;
  }
}

export async function queryOpenAI(query: string, model: string): Promise<string> {
  const response = await fetchWithRetry(
    '/api/openai',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        model,
      }),
    }
  );

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function queryGemini(query: string, model: string): Promise<string> {
  const response = await fetchWithRetry(
    '/api/gemini',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        model,
      }),
    }
  );

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

export async function queryClaude(query: string, model: string): Promise<string> {
  const response = await fetchWithRetry(
    '/api/claude',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        model,
      }),
    }
  );

  const data = await response.json();
  return data.content[0].text;
}

export async function queryDeepseek(query: string, model: string): Promise<string> {
  const response = await fetchWithRetry(
    '/api/deepseek',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        model,
      }),
    }
  );

  const data = await response.json();
  return data.choices[0].message.content;
} 