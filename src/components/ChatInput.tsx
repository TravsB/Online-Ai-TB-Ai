import { useState, useRef, useEffect } from "react";
import { ArrowUp, Square } from "lucide-react";

interface Props {
  isAnimalMode: boolean;
  isStreaming: boolean;
  onSend: (msg: string) => void;
  onCancel: () => void;
  suggestedQuestions?: string[];
  onSuggestedClick?: (q: string) => void;
}

export default function ChatInput({ isAnimalMode, isStreaming, onSend, onCancel, suggestedQuestions, onSuggestedClick }: Props) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = Math.min(ref.current.scrollHeight, 120) + "px";
    }
  }, [value]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setValue("");
  };

  return (
    <div className="sticky bottom-0 px-4 pb-4 pt-2">
      {suggestedQuestions && suggestedQuestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 max-w-3xl mx-auto">
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              onClick={() => onSuggestedClick?.(q)}
              className={`text-xs px-3 py-1.5 rounded-full transition-all hover:-translate-y-0.5 ${
                isAnimalMode
                  ? "bg-animal/10 text-animal border border-animal/20 hover:bg-animal/20"
                  : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      )}
      <div className="max-w-3xl mx-auto relative">
        <div className={`glass rounded-2xl transition-all ${
          isAnimalMode ? "border-animal/20 focus-within:border-animal/40" : "border-primary/20 focus-within:border-primary/40"
        }`}>
          <textarea
            ref={ref}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={isAnimalMode ? "Ask about wildlife and animals..." : "Ask about the environment..."}
            rows={1}
            className="w-full bg-transparent px-4 py-3 pr-14 text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none rounded-2xl"
          />
          <button
            onClick={isStreaming ? onCancel : handleSend}
            disabled={!isStreaming && !value.trim()}
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 ${
              isStreaming
                ? "bg-destructive text-destructive-foreground"
                : isAnimalMode
                  ? "bg-animal text-primary-foreground hover:bg-animal-glow"
                  : "bg-primary text-primary-foreground hover:bg-emerald-glow"
            }`}
          >
            {isStreaming ? <Square className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
