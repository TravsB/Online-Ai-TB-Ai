import { useState, useCallback } from "react";

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

  const persist = useCallback((convos: Conversation[]) => {
    setConversations(convos);
    saveConversations(convos);
  }, []);

  const currentConversation = conversations.find((c) => c.id === currentId) || null;

  const createConversation = useCallback(() => {
    const id = Date.now().toString();
    const newConv: Conversation = {
      id,
      title: "New Conversation",
      messages: [],
      date: new Date().toLocaleDateString(),
      mode: isAnimalMode ? "animal" : "environment",
    };
    const updated = [newConv, ...conversations];
    persist(updated);
    setCurrentId(id);
    return id;
  }, [conversations, persist, isAnimalMode]);

  const addMessage = useCallback(
    (convId: string, role: "user" | "assistant", content: string) => {
      const updated = conversations.map((c) => {
        if (c.id !== convId) return c;
        const msg: Message = { id: Date.now().toString() + Math.random(), role, content, timestamp: Date.now() };
        const messages = [...c.messages, msg];
        const title = c.messages.length === 0 && role === "user"
          ? content.substring(0, 40) + (content.length > 40 ? "..." : "")
          : c.title;
        return { ...c, messages, title };
      });
      persist(updated);
    },
    [conversations, persist]
  );

  const updateLastAssistantMessage = useCallback(
    (convId: string, content: string) => {
      const updated = conversations.map((c) => {
        if (c.id !== convId) return c;
        const msgs = [...c.messages];
        const lastIdx = msgs.length - 1;
        if (lastIdx >= 0 && msgs[lastIdx].role === "assistant") {
          msgs[lastIdx] = { ...msgs[lastIdx], content };
        }
        return { ...c, messages: msgs };
      });
      persist(updated);
    },
    [conversations, persist]
  );

  const deleteConversation = useCallback(
    (id: string) => {
      const updated = conversations.filter((c) => c.id !== id);
      persist(updated);
      if (currentId === id) {
        setCurrentId(updated.length > 0 ? updated[0].id : null);
      }
    },
    [conversations, currentId, persist]
  );

  const clearAll = useCallback(() => {
    persist([]);
    setCurrentId(null);
  }, [persist]);

  const renameConversation = useCallback(
    (id: string, title: string) => {
      const updated = conversations.map((c) => (c.id === id ? { ...c, title } : c));
      persist(updated);
    },
    [conversations, persist]
  );

  return {
    conversations,
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
