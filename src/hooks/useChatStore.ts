import { useState, useCallback, useEffect, useRef } from "react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  date: string;
  mode: "environment" | "animal";
}

const STORAGE_KEY = "tb_ai_conversations";

function loadConversations(): Conversation[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveConversations(convos: Conversation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convos));
}

export function useChatStore() {
  const [conversations, setConversations] = useState<Conversation[]>(loadConversations);
  const [currentId, setCurrentId] = useState<string | null>(() => {
    const convos = loadConversations();
    return convos.length > 0 ? convos[0].id : null;
  });
  const [isAnimalMode, setIsAnimalMode] = useState(false);

  // Keep a ref in sync so callers can read the latest state synchronously.
  const conversationsRef = useRef<Conversation[]>(conversations);
  useEffect(() => {
    conversationsRef.current = conversations;
    saveConversations(conversations);
  }, [conversations]);

  const currentConversation = conversations.find((c) => c.id === currentId) || null;

  const createConversation = useCallback(() => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
    const newConv: Conversation = {
      id,
      title: "New Conversation",
      messages: [],
      date: new Date().toLocaleDateString(),
      mode: isAnimalMode ? "animal" : "environment",
    };
    setConversations((prev) => [newConv, ...prev]);
    setCurrentId(id);
    return id;
  }, [isAnimalMode]);

  const addMessage = useCallback(
    (convId: string, role: "user" | "assistant", content: string) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c;
          const msg: Message = {
            id: Date.now().toString() + Math.random(),
            role,
            content,
            timestamp: Date.now(),
          };
          const messages = [...c.messages, msg];
          const title =
            c.messages.length === 0 && role === "user"
              ? content.substring(0, 40) + (content.length > 40 ? "..." : "")
              : c.title;
          return { ...c, messages, title };
        })
      );
    },
    []
  );

  const updateLastAssistantMessage = useCallback(
    (convId: string, content: string) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c;
          const msgs = [...c.messages];
          const lastIdx = msgs.length - 1;
          if (lastIdx >= 0 && msgs[lastIdx].role === "assistant") {
            msgs[lastIdx] = { ...msgs[lastIdx], content };
          }
          return { ...c, messages: msgs };
        })
      );
    },
    []
  );

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const updated = prev.filter((c) => c.id !== id);
        setCurrentId((cur) => (cur === id ? (updated[0]?.id ?? null) : cur));
        return updated;
      });
    },
    []
  );

  const clearAll = useCallback(() => {
    setConversations([]);
    setCurrentId(null);
  }, []);

  const renameConversation = useCallback((id: string, title: string) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)));
  }, []);

  return {
    conversations,
    conversationsRef,
    currentConversation,
    currentId,
    setCurrentId,
    isAnimalMode,
    setIsAnimalMode,
    createConversation,
    addMessage,
    updateLastAssistantMessage,
    deleteConversation,
    clearAll,
    renameConversation,
  };
}
