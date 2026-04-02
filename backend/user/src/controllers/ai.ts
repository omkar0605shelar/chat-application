import axios from "axios";
import TryCatch from "../config/TryCatch.js";
import type { AuthenticatedRequest } from "../middleware/isAuth.js";

const DEFAULT_NVIDIA_URL =
  "https://integrate.api.nvidia.com/v1/chat/completions";
const DEFAULT_MODEL = "google/gemma-3-27b-it";

type ChatMessage = { role: string; content: string };

/**
 * Gemma on NVIDIA requires roles to alternate user/assistant/... and must not
 * start with assistant. The UI often seeds a welcome assistant bubble — strip
 * those so the first message sent upstream is from the user.
 */
function normalizeMessagesForGemma(messages: ChatMessage[]): ChatMessage[] {
  const out = [...messages];
  while (out.length > 0) {
    const first = out[0];
    if (!first || first.role !== "assistant") break;
    out.shift();
  }
  return out;
}

export const chatCompletion = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey?.trim()) {
      res.status(503).json({
        message:
          "AI is not configured. Set NVIDIA_API_KEY in the user service .env file.",
      });
      return;
    }

    const { messages: rawMessages } = req.body as { messages?: ChatMessage[] };
    if (!rawMessages || !Array.isArray(rawMessages) || rawMessages.length === 0) {
      res.status(400).json({ message: "messages must be a non-empty array." });
      return;
    }

    const messages = normalizeMessagesForGemma(rawMessages);
    if (messages.length === 0) {
      res.status(400).json({
        message:
          "No user messages to send. (Leading assistant-only bubbles are not sent to the model.)",
      });
      return;
    }

    const invalid = messages.some(
      (m) =>
        !m ||
        typeof m.content !== "string" ||
        (m.role !== "user" && m.role !== "assistant" && m.role !== "system")
    );
    if (invalid) {
      res.status(400).json({
        message:
          "Each message needs role (user|assistant|system) and content (string).",
      });
      return;
    }

    const model = process.env.NVIDIA_MODEL?.trim() || DEFAULT_MODEL;
    const url = process.env.NVIDIA_CHAT_COMPLETIONS_URL?.trim() || DEFAULT_NVIDIA_URL;

    try {
      const { data } = await axios.post(
        url,
        {
          model,
          messages,
          max_tokens: 512,
          temperature: 0.2,
          top_p: 0.7,
          stream: false,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 120_000,
        }
      );

      const choice = data?.choices?.[0]?.message;
      const content = choice?.content;
      if (typeof content !== "string") {
        res.status(502).json({ message: "Unexpected response from AI provider." });
        return;
      }

      res.json({
        choices: [
          {
            message: {
              role: "assistant" as const,
              content,
            },
          },
        ],
      });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status ?? 502;
        const detail =
          (err.response?.data as { error?: { message?: string } })?.error
            ?.message ??
          (err.response?.data as { message?: string })?.message ??
          err.message;
        res.status(status >= 400 && status < 600 ? status : 502).json({
          message: detail || "AI request failed.",
        });
        return;
      }
      throw err;
    }
  }
);
