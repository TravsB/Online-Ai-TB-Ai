import { X, Plus, Trash2, Edit2, Search } from "lucide-react";
import { Conversation } from "@/hooks/useChatStore";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  conversations: Conversation[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
}

export default function HistorySidebar({ open, onClose, conversations, currentId, onSelect, onNew, onDelete, onRename }: Props) {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const filtered = conversations.filter(
    (c) => c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.messages.some((m) => m.content.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-background/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />
      {/* Sidebar */}
      <div className={`fixed top-0 right-0 w-[340px] max-w-full h-full bg-card border-l border-border z-50 flex flex-col transition-transform duration-300 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-foreground">Chat History</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 border-b border-border space-y-2">
          <button
            onClick={() => { onNew(); onClose(); }}
            className="w-full py-2.5 bg-primary hover:bg-emerald-glow text-primary-foreground rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" /> New Conversation
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-muted rounded-lg border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/40"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filtered.map((conv) => (
            <div
              key={conv.id}
              onClick={() => { onSelect(conv.id); onClose(); }}
              className={`group p-3 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 ${
                currentId === conv.id
                  ? "bg-primary/10 border border-primary/20"
                  : "bg-muted/50 border border-transparent hover:border-border"
              }`}
            >
              {editingId === conv.id ? (
                <input
                  autoFocus
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={() => { onRename(conv.id, editTitle); setEditingId(null); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { onRename(conv.id, editTitle); setEditingId(null); } }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full text-sm font-semibold bg-transparent outline-none text-foreground border-b border-primary"
                />
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground truncate">{conv.title}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); setEditingId(conv.id); setEditTitle(conv.title); }}
                      className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground"><Edit2 className="w-3 h-3" /></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                      className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {conv.messages[conv.messages.length - 1]?.content || "Empty conversation"}
              </p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">{conv.date}</p>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">No conversations found</p>
          )}
        </div>

        <div className="p-3 border-t border-border">
          <p className="text-[10px] text-muted-foreground text-center">Conversations stored locally on this device</p>
        </div>
      </div>
    </>
  );
}
