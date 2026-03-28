import { create } from 'zustand';
import type { AIMessage } from '../types';
import { aiService } from '../services/aiService';

interface AIStore {
    messages: AIMessage[];
    isLoading: boolean;
    isOpen: boolean;

    toggleOpen: () => void;
    setOpen: (isOpen: boolean) => void;
    sendMessage: (content: string) => Promise<void>;
    clearMessages: () => void;
}

export const useAIStore = create<AIStore>((set, get) => ({
    messages: [
        {
            id: '1',
            role: 'assistant',
            content: 'Hello! I am ChatFlow AI. How can I help you today?',
            timestamp: new Date().toISOString(),
        },
    ],
    isLoading: false,
    isOpen: false,

    toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
    setOpen: (isOpen) => set({ isOpen }),

    sendMessage: async (content: string) => {
        const userMessage: AIMessage = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date().toISOString(),
        };

        set((state) => ({
            messages: [...state.messages, userMessage],
            isLoading: true,
        }));

        try {
            const currentMessages = get().messages;
            const response = await aiService.sendMessage(currentMessages);

            const assistantMessage: AIMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response,
                timestamp: new Date().toISOString(),
            };

            set((state) => ({
                messages: [...state.messages, assistantMessage],
                isLoading: false,
            }));
        } catch (error) {
            console.error('AI Error:', error);
            const errorMessage: AIMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please check your AI configuration.',
                timestamp: new Date().toISOString(),
            };
            set((state) => ({
                messages: [...state.messages, errorMessage],
                isLoading: false,
            }));
        }
    },

    clearMessages: () =>
        set({
            messages: [
                {
                    id: '1',
                    role: 'assistant',
                    content: 'How can I help you today?',
                    timestamp: new Date().toISOString(),
                },
            ],
        }),
}));
