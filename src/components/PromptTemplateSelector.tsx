import { Card } from "@/components/ui/card";
import { PROMPT_TEMPLATES, type PromptTemplate } from "@/lib/promptTemplates";
import { cn } from "@/lib/utils";

interface PromptTemplateSelectorProps {
  selectedTemplate: string | null;
  onSelectTemplate: (template: PromptTemplate) => void;
}

const PromptTemplateSelector = ({ selectedTemplate, onSelectTemplate }: PromptTemplateSelectorProps) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground">Templates de prompts</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-2">
        {PROMPT_TEMPLATES.map((template) => (
          <Card
            key={template.id}
            className={cn(
              "p-3 cursor-pointer transition-all hover:shadow-medium border-2 min-h-[44px]",
              selectedTemplate === template.id
                ? "border-primary bg-gradient-primary text-primary-foreground shadow-medium"
                : "border-border hover:border-primary/50"
            )}
            onClick={() => onSelectTemplate(template)}
          >
            <div className="flex flex-col items-center text-center gap-1 sm:gap-2">
              <span className="text-xl sm:text-2xl" role="img" aria-label={template.name}>
                {template.icon}
              </span>
              <span className="text-[10px] sm:text-xs font-medium line-clamp-2">
                {template.name}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PromptTemplateSelector;
