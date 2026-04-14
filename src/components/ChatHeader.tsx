import { Leaf, PawPrint, Trash2, History, Sun, Moon } from "lucide-react";
import { useState } from "react";

interface Props {
  isAnimalMode: boolean;
  onToggleAnimal: () => void;
  onClearAll: () => void;
  onToggleHistory: () => void;
}

export default function ChatHeader({ isAnimalMode, onToggleAnimal, onClearAll, onToggleHistory }: Props) {
  const [isDark, setIsDark] = useState(true);

  return (
    <header className="fixed top-0 left-0 right-0 z-30 glass h-16 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
          isAnimalMode ? "bg-animal" : "bg-primary"
        }`}>
          {isAnimalMode ? <PawPrint className="w-5 h-5 text-primary-foreground" /> : <Leaf className="w-5 h-5 text-primary-foreground" />}
        </div>
        <div>
          <h1 className="font-display text-lg font-bold text-foreground">
            {isAnimalMode ? "TB Wildlife" : "TB Ai"}
          </h1>
          <p className="text-xs text-muted-foreground">
            {isAnimalMode ? "Wildlife Conservation" : "Environmental Intelligence"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={onToggleAnimal} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
          isAnimalMode
            ? "bg-animal/20 text-animal border border-animal/30"
            : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        }`}>
          <PawPrint className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Animal Mode</span>
        </button>
        <button onClick={onClearAll} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-all flex items-center gap-1.5">
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear All</span>
        </button>
        <button onClick={onToggleHistory} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all flex items-center gap-1.5">
          <History className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">History</span>
        </button>
      </div>
    </header>
  );
}
