import { useState, useCallback } from "react";
import ChatHeader from "@/components/ChatHeader";
import ChatMessages from "@/components/ChatMessages";
import ChatInput from "@/components/ChatInput";
import HistorySidebar from "@/components/HistorySidebar";
import { useChatStore } from "@/hooks/useChatStore";
import { useStreamChat } from "@/hooks/useStreamChat";
import { toast } from "@/hooks/use-toast";

const ENV_SYSTEM = `You are TB Ai, an expert environmental intelligence assistant. You specialize in climate change, sustainability, renewable energy, pollution, ecosystems, conservation, and environmental policy. Provide accurate, well-structured, and actionable information. Use markdown formatting. Be encouraging and solution-oriented.`;

const ANIMAL_SYSTEM = `You are TB Wildlife, an expert wildlife conservation assistant. You specialize in endangered species, animal behavior, habitats, conservation efforts, biodiversity, and wildlife protection. Provide accurate, well-structured information. Use markdown formatting. Be passionate about conservation.`;

export default function Index() {
  const store = useChatStore();
  const { stream, cancel } = useStreamChat();
  const [isStreaming, setIsStreaming] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const handleSend = useCallback(
    async (content: string) => {
      let convId = store.currentId;
      if (!convId || !store.currentConversation) {
        convId = store.createConversation();
      }

      store.addMessage(convId, "user", content);
      setIsStreaming(true);

      // Build message history for context
      const conv = store.conversations.find((c) => c.id === convId);
      const history = (conv?.messages || []).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
      history.push({ role: "user", content });

      // Create empty assistant message
      store.addMessage(convId!, "assistant", "");

      let accumulated = "";

      await stream({
        messages: history,
        systemContext: store.isAnimalMode ? ANIMAL_SYSTEM : ENV_SYSTEM,
        onDelta: (chunk) => {
          accumulated += chunk;
          store.updateLastAssistantMessage(convId!, accumulated);
        },
        onDone: () => {
          setIsStreaming(false);
        },
        onError: (err) => {
          setIsStreaming(false);
          toast({ title: "Error", description: err, variant: "destructive" });
        },
      });
    },
    [store, stream]
  );

  const suggestedQuestions = store.currentConversation?.messages.length === 0
    ? store.isAnimalMode
      ? ["What animals are critically endangered?", "How does climate change affect wildlife?", "Tell me about marine conservation"]
      : ["What causes climate change?", "How can I reduce my carbon footprint?", "Explain renewable energy sources"]
    : undefined;

  return (
    <div className="h-screen flex flex-col bg-background">
      <ChatHeader
        isAnimalMode={store.isAnimalMode}
        onToggleAnimal={() => store.setIsAnimalMode(!store.isAnimalMode)}
        onClearAll={() => {
          if (confirm("Clear ALL conversations?")) store.clearAll();
        }}
        onToggleHistory={() => setHistoryOpen(true)}
      />

      <div className="flex-1 flex flex-col pt-16 min-h-0">
        <ChatMessages
          messages={store.currentConversation?.messages || []}
          isAnimalMode={store.isAnimalMode}
          isStreaming={isStreaming}
        />
        <ChatInput
          isAnimalMode={store.isAnimalMode}
          isStreaming={isStreaming}
          onSend={handleSend}
          onCancel={cancel}
          suggestedQuestions={suggestedQuestions}
          onSuggestedClick={handleSend}
        />
      </div>

      <HistorySidebar
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        conversations={store.conversations}
        currentId={store.currentId}
        onSelect={(id) => store.setCurrentId(id)}
        onNew={() => { store.createConversation(); }}
        onDelete={store.deleteConversation}
        onRename={store.renameConversation}
      />
    </div>
  );
}
