import type { AIMessage } from '../types';

const AI_API_URL = import.meta.env.VITE_AI_API_URL || '';
const AI_API_KEY = import.meta.env.VITE_AI_API_KEY || '';

const SYSTEM_PROMPT = `You are ChatFlow AI, a helpful assistant embedded in a modern messaging application. 
Your role is to:
- Help users compose better messages
- Detect and suggest fixes for grammatical or tone issues
- Provide smart reply suggestions
- Answer general questions with concise, helpful responses
- Be friendly, concise, and professional
Keep responses short and conversational unless asked for detail.`;

export const aiService = {
    isConfigured: () => Boolean(AI_API_URL && AI_API_KEY),

    sendMessage: async (messages: AIMessage[]): Promise<string> => {
        if (!AI_API_URL || !AI_API_KEY) {
            throw new Error('AI API not configured. Add VITE_AI_API_URL and VITE_AI_API_KEY to your .env file.');
        }

        const payload = {
            model: 'gemini-2.0-flash',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...messages
                    .filter((m) => !m.isLoading)
                    .map((m) => ({ role: m.role, content: m.content })),
            ],
            max_tokens: 500,
            temperature: 0.7,
        };

        const res = await fetch(`${AI_API_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${AI_API_KEY}`,
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error?.message || `AI request failed (${res.status})`);
        }

        const data = await res.json();
        return data.choices?.[0]?.message?.content || 'No response received.';
    },

    getSuggestions: async (messageText: string): Promise<string[]> => {
        if (!aiService.isConfigured()) return [];
        try {
            const prompt = `Given this draft message: "${messageText}" — suggest 2 short improved reply options. Return only a JSON array of strings, no explanation.`;
            const mockMessages: AIMessage[] = [
                { id: '1', role: 'user', content: prompt, timestamp: new Date().toISOString() },
            ];
            const result = await aiService.sendMessage(mockMessages);
            return JSON.parse(result);
        } catch {
            return [];
        }
    },
};
