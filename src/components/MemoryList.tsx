import { Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface MemoryItem {
  id: string;
  content: string;
  timestamp: string;
  prompt: string;
}

interface MemoryListProps {
  memories: MemoryItem[];
  onDelete: (id: string) => void;
}

const MemoryList = ({ memories, onDelete }: MemoryListProps) => {
  if (memories.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">Aucune analyse sauvegardée pour le moment</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto">
      {memories.map((memory, index) => (
        <Card
          key={memory.id}
          className="p-4 hover:shadow-medium transition-smooth animate-scale-in"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{memory.timestamp}</span>
              </div>
              <p className="text-sm font-medium text-accent">
                Prompt: {memory.prompt}
              </p>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {memory.content}
              </p>
            </div>
            <Button
              onClick={() => onDelete(memory.id)}
              size="icon"
              variant="ghost"
              className="hover:text-destructive transition-smooth"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default MemoryList;
