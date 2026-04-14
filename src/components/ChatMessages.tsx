import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Leaf, PawPrint, User, Copy, Check } from "lucide-react";
import { Message } from "@/hooks/useChatStore";
import { useState } from "react";

interface Props {
  messages: Message[];
  isAnimalMode: boolean;
  isStreaming: boolean;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="absolute top-2 right-2 p-1 rounded-md bg-muted/50 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse-dot"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );
}

export default function ChatMessages({ messages, isAnimalMode, isStreaming }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return (
      <div ref={scrollRef} className="flex-1 overflow-y-auto flex items-center justify-center px-4">
        <div className="text-center max-w-md animate-fade-in-up">
          <div className={`w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-2xl ${
            isAnimalMode ? "bg-animal/20" : "bg-primary/20"
          }`}>
            {isAnimalMode ? <PawPrint className="w-10 h-10 text-animal" /> : <Leaf className="w-10 h-10 text-primary" />}
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            {isAnimalMode ? "Wildlife Conservation Assistant" : "Environmental Intelligence"}
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            {isAnimalMode
              ? "Ask me about wildlife, conservation, endangered species, and animal habitats."
              : "Ask me about climate change, sustainability, ecosystems, pollution, and environmental solutions."}
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {(isAnimalMode
              ? ["What animals are endangered?", "How does deforestation affect wildlife?", "Tell me about ocean conservation"]
              : ["What causes climate change?", "How can I reduce my carbon footprint?", "Explain renewable energy sources"]
            ).map((q) => (
              <span key={q} className={`text-xs px-3 py-1.5 rounded-full cursor-default ${
                isAnimalMode ? "bg-animal/10 text-animal border border-animal/20" : "bg-primary/10 text-primary border border-primary/20"
              }`}>
                {q}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
      {messages.map((msg) => (
        <div key={msg.id} className={`flex items-start gap-3 animate-fade-in-up ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            msg.role === "assistant"
              ? isAnimalMode ? "bg-animal/20 text-animal" : "bg-primary/20 text-primary"
              : "bg-muted text-muted-foreground"
          }`}>
            {msg.role === "assistant"
              ? isAnimalMode ? <PawPrint className="w-4 h-4" /> : <Leaf className="w-4 h-4" />
              : <User className="w-4 h-4" />}
          </div>
          <div className={`group relative max-w-[75%] rounded-2xl px-4 py-3 ${
            msg.role === "assistant"
              ? "bg-card border border-border rounded-bl-md"
              : isAnimalMode
                ? "bg-animal text-primary-foreground rounded-br-md"
                : "bg-primary text-primary-foreground rounded-br-md"
          }`}>
            {msg.role === "assistant" ? (
              <div className="prose-chat">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm">{msg.content}</p>
            )}
            <CopyButton text={msg.content} />
          </div>
        </div>
      ))}
      {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
        <div className="flex items-start gap-3 animate-fade-in-up">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            isAnimalMode ? "bg-animal/20 text-animal" : "bg-primary/20 text-primary"
          }`}>
            {isAnimalMode ? <PawPrint className="w-4 h-4" /> : <Leaf className="w-4 h-4" />}
          </div>
          <div className="bg-card border border-border rounded-2xl rounded-bl-md">
            <TypingDots />
          </div>
        </div>
      )}
    </div>
  );
}
