import { FileText, Sparkles } from "lucide-react";

interface AnalysisResultProps {
  result: string;
  isAnalyzing: boolean;
}

const AnalysisResult = ({ result, isAnalyzing }: AnalysisResultProps) => {
  if (isAnalyzing) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/30 border-t-primary mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-lg">Analyse en cours...</p>
            <p className="text-sm text-muted-foreground">Intelligence artificielle au travail ⚡</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
        <FileText className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-sm">Le résultat de l'analyse apparaîtra ici</p>
      </div>
    );
  }

  return (
    <div className="prose prose-sm max-w-none animate-fade-in">
      <div className="relative p-4 sm:p-6 bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg border-2 border-primary/20 shadow-medium">
        <div className="absolute top-2 right-2">
          <div className="p-1.5 rounded-full bg-primary/10">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          </div>
        </div>
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
          {result}
          {isAnalyzing && <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse" />}
        </pre>
      </div>
    </div>
  );
};

export default AnalysisResult;
