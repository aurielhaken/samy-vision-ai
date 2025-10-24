import { Card } from "@/components/ui/card";
import { BarChart3, Calendar, TrendingUp } from "lucide-react";
import { type MemoryStats } from "@/hooks/useMemoryManager";

interface MemoryStatsProps {
  stats: MemoryStats;
}

const MemoryStats = ({ stats }: MemoryStatsProps) => {
  return (
    <Card className="p-4 sm:p-6 shadow-medium">
      <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" />
        Statistiques de la mémoire
      </h3>
      
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
          <div className="text-2xl sm:text-3xl font-bold text-primary">{stats.total}</div>
          <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">Total</div>
        </div>
        
        <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
          <div className="text-2xl sm:text-3xl font-bold text-accent">{stats.recent}</div>
          <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">Cette semaine</div>
        </div>
        
        <div className="text-center p-2 sm:p-4 bg-muted/30 rounded-lg">
          <div className="text-2xl sm:text-3xl font-bold text-success">
            {Object.keys(stats.byType).length}
          </div>
          <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">Types</div>
        </div>
      </div>

      {Object.keys(stats.byType).length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Par type
          </h4>
          <div className="space-y-2">
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground capitalize">{type}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default MemoryStats;
