import { Card } from "@/components/ui/card";
import { RESPONSE_FORMATS, type ResponseFormat } from "@/lib/promptTemplates";
import { cn } from "@/lib/utils";

interface FormatSelectorProps {
  selectedFormat: 'text' | 'json' | 'vision_ok';
  onSelectFormat: (format: 'text' | 'json' | 'vision_ok') => void;
}

const FormatSelector = ({ selectedFormat, onSelectFormat }: FormatSelectorProps) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground">Format de réponse</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {RESPONSE_FORMATS.map((format) => (
          <Card
            key={format.id}
            className={cn(
              "p-3 cursor-pointer transition-all hover:shadow-medium border-2 min-h-[44px]",
              selectedFormat === format.id
                ? "border-accent bg-accent text-accent-foreground shadow-medium"
                : "border-border hover:border-accent/50"
            )}
            onClick={() => onSelectFormat(format.id)}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <span className="text-2xl" role="img" aria-label={format.name}>
                {format.icon}
              </span>
              <span className="text-xs font-medium">
                {format.name}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FormatSelector;
