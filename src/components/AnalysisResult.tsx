import { FileText } from "lucide-react";

interface AnalysisResultProps {
  result: string;
  isAnalyzing: boolean;
}

const AnalysisResult = ({ result, isAnalyzing }: AnalysisResultProps) => {
  if (isAnalyzing) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto" />
          <p>Analyse en cours...</p>
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
      <div className="p-4 bg-muted/30 rounded-lg border border-border">
        <pre className="whitespace-pre-wrap font-sans text-sm text-foreground">
          {result}
        </pre>
      </div>
    </div>
  );
};

export default AnalysisResult;
