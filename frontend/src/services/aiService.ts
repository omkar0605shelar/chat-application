import userApi from '../api/axios';

/** Gemma requires user/assistant alternation starting with user — drop UI welcome assistants. */
function stripLeadingAssistantMessages(
  messages: { role: string; content: string }[]
) {
  const out = [...messages];
  while (out.length > 0 && out[0].role === 'assistant') {
    out.shift();
  }
  return out;
}

/**
 * Proxies to user service POST /api/v1/ai/chat (NVIDIA Gemma via server).
 * API key stays in backend .env as NVIDIA_API_KEY — never expose in the browser.
 */
export const aiService = {
  sendMessage: async (messages: { role: string; content: string }[]) => {
    const res = await userApi.post('/ai/chat', {
      messages: stripLeadingAssistantMessages(messages),
    });

    const msg = res.data?.choices?.[0]?.message;
    if (!msg || typeof msg.content !== 'string') {
      throw new Error('Invalid AI response');
    }

    return msg;
  },
};
