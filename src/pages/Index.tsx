import { useState } from "react";
import { Upload, Sparkles, Save, History, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ImageUpload from "@/components/ImageUpload";
import AnalysisResult from "@/components/AnalysisResult";
import MemoryList from "@/components/MemoryList";
import PromptTemplateSelector from "@/components/PromptTemplateSelector";
import FormatSelector from "@/components/FormatSelector";
import QuickActions from "@/components/QuickActions";
import { type PromptTemplate } from "@/lib/promptTemplates";

interface MemoryItem {
  id: string;
  content: string;
  timestamp: string;
  prompt: string;
}

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [analysisResult, setAnalysisResult] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<'text' | 'json' | 'vision_ok'>('text');
  const { toast } = useToast();

  const handleTemplateSelect = (template: PromptTemplate) => {
    setSelectedTemplate(template.id);
    setPrompt(template.prompt);
    setSelectedFormat(template.format);
    toast({
      title: "Template sélectionné",
      description: `${template.name} - ${template.description}`,
    });
  };

  const handleQuickAction = (actionPrompt: string) => {
    setPrompt(actionPrompt);
    setSelectedTemplate(null);
    toast({
      title: "Action rapide",
      description: "Prompt mis à jour",
    });
  };

  const handleImageSelect = (file: File) => {
    // Validation
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "Image trop grande",
        description: "L'image doit faire moins de 10MB",
      });
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Format non supporté",
        description: "Seuls PNG, JPG et JPEG sont acceptés",
      });
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast({
        variant: "destructive",
        title: "Aucune image",
        description: "Veuillez sélectionner une image",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult("");

    try {
      const base64Image = await convertImageToBase64(selectedImage);
      
      // Call the Samy Vision API via edge function with format
      const { data, error } = await supabase.functions.invoke('analyze-image', {
        body: {
          image: base64Image,
          prompt: prompt || "Décris cette image en détail",
          format: selectedFormat
        }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Extract the analysis result from the API response
      const result = data.analysis || data.result || JSON.stringify(data, null, 2);
      setAnalysisResult(result);
      
      toast({
        title: "Analyse terminée",
        description: "L'image a été analysée avec succès",
      });
    } catch (error) {
      console.error("Erreur d'analyse:", error);
      toast({
        variant: "destructive",
        title: "Erreur d'analyse",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveMemory = () => {
    if (!analysisResult) {
      toast({
        variant: "destructive",
        title: "Aucun résultat",
        description: "Analysez d'abord une image avant de sauvegarder",
      });
      return;
    }

    const newMemory: MemoryItem = {
      id: Date.now().toString(),
      content: analysisResult,
      timestamp: new Date().toLocaleString('fr-FR'),
      prompt: prompt || "Décris cette image en détail",
    };

    setMemories(prev => [newMemory, ...prev].slice(0, 5));
    
    toast({
      title: "Sauvegardé",
      description: "L'analyse a été ajoutée à la mémoire",
    });
  };

  const handleDeleteMemory = (id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id));
    toast({
      title: "Supprimé",
      description: "L'entrée a été supprimée de la mémoire",
    });
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    setAnalysisResult("");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Samy Vision
            </h1>
            <span className="text-muted-foreground">- Analyse d'images IA</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Upload & Analysis */}
          <div className="space-y-6 animate-fade-in">
            {/* Image Upload */}
            <Card className="p-6 shadow-medium">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Télécharger une image
              </h2>
              <ImageUpload
                onImageSelect={handleImageSelect}
                imagePreview={imagePreview}
                onClear={handleClearImage}
              />
            </Card>

            {/* Templates & Format Selection */}
            <Card className="p-6 shadow-medium">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-5 h-5 text-accent" />
                <h2 className="text-xl font-semibold">Templates & Format</h2>
              </div>
              
              <div className="space-y-6">
                <PromptTemplateSelector
                  selectedTemplate={selectedTemplate}
                  onSelectTemplate={handleTemplateSelect}
                />
                
                <FormatSelector
                  selectedFormat={selectedFormat}
                  onSelectFormat={setSelectedFormat}
                />

                <QuickActions
                  onSelectAction={handleQuickAction}
                  disabled={isAnalyzing}
                />
              </div>
            </Card>

            {/* Prompt Input */}
            <Card className="p-6 shadow-medium">
              <h2 className="text-xl font-semibold mb-4">Prompt personnalisé</h2>
              <Textarea
                placeholder="Décris cette image en détail"
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  setSelectedTemplate(null);
                }}
                className="min-h-[100px] resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {selectedTemplate ? "Template actif - Modifiez pour personnaliser" : "Entrez votre prompt personnalisé"}
              </p>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleAnalyze}
                disabled={!selectedImage || isAnalyzing}
                className="flex-1 h-12 text-lg font-semibold bg-gradient-primary hover:opacity-90 transition-smooth shadow-medium"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-foreground border-t-transparent mr-2" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Analyser l'image
                  </>
                )}
              </Button>
              <Button
                onClick={handleSaveMemory}
                disabled={!analysisResult}
                variant="outline"
                className="h-12"
              >
                <Save className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Right Column - Results & Memory */}
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            {/* Analysis Result */}
            <Card className="p-6 shadow-medium">
              <h2 className="text-xl font-semibold mb-4">Résultat de l'analyse</h2>
              <AnalysisResult result={analysisResult} isAnalyzing={isAnalyzing} />
            </Card>

            {/* Memory List */}
            <Card className="p-6 shadow-medium">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Mémoire récente
              </h2>
              <MemoryList memories={memories} onDelete={handleDeleteMemory} />
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
