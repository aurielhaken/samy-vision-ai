import { Button } from "@/components/ui/button";
import { QUICK_ACTIONS } from "@/lib/promptTemplates";

interface QuickActionsProps {
  onSelectAction: (prompt: string) => void;
  disabled?: boolean;
}

const QuickActions = ({ onSelectAction, disabled }: QuickActionsProps) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground">Actions rapides</h3>
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
        {QUICK_ACTIONS.map((action) => (
          <Button
            key={action.id}
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => onSelectAction(action.prompt)}
            className="gap-2 min-h-[44px] text-xs sm:text-sm"
          >
            <span role="img" aria-label={action.name}>{action.icon}</span>
            {action.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
