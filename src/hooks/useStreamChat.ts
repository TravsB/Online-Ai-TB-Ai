import { useCallback, useRef } from "react";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tb-ai-chat`;

interface StreamOptions {
  messages: { role: "user" | "assistant"; content: string }[];
  systemContext: string;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
}

export function useStreamChat() {
  const abortRef = useRef<AbortController | null>(null);

  const stream = useCallback(async ({ messages, systemContext, onDelta, onDone, onError }: StreamOptions) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages, systemContext }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        onError(errData.error || `Error ${resp.status}`);
        return;
      }

      if (!resp.body) { onError("No response body"); return; }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { onDone(); return; }
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) onDelta(content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
      onDone();
    } catch (e: any) {
      if (e.name !== "AbortError") onError(e.message || "Unknown error");
    }
  }, []);

  const cancel = useCallback(() => { abortRef.current?.abort(); }, []);

  return { stream, cancel };
}
