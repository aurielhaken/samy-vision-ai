import { useState, useEffect } from "react";
import { Upload, Sparkles, Save, History, Palette, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { SamyAvatar } from '@/components/SamyAvatar';
import { SamyParticles } from '@/components/SamyParticles';
import ImageUpload from "@/components/ImageUpload";
import AnalysisResult from "@/components/AnalysisResult";
import MemoryList from "@/components/MemoryList";
import PromptTemplateSelector from "@/components/PromptTemplateSelector";
import FormatSelector from "@/components/FormatSelector";
import QuickActions from "@/components/QuickActions";
import MemoryStats from "@/components/MemoryStats";
import MemoryExport from "@/components/MemoryExport";
import { type PromptTemplate } from "@/lib/promptTemplates";
import { useMemoryManager } from "@/hooks/useMemoryManager";

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [analysisResult, setAnalysisResult] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<'text' | 'json' | 'vision_ok'>('text');
  const [samyEmotion, setSamyEmotion] = useState<'calm' | 'curious' | 'energetic'>('calm');
  const { toast } = useToast();
  
  // Memory management
  const {
    entries: memories,
    isLoading: isLoadingMemory,
    loadEntries,
    addEntry,
    deleteEntry,
    getStatistics,
    downloadExport
  } = useMemoryManager();

  // Load memories on mount
  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

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
    setSamyEmotion('curious');

    try {
      const base64Image = await convertImageToBase64(selectedImage);
      
      // Streaming analysis avec Lovable AI
      const ANALYZE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-image`;
      
      const response = await fetch(ANALYZE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          image: base64Image,
          prompt: prompt || "Décris cette image en détail",
          format: selectedFormat,
          stream: true
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Limite de taux atteinte. Réessayez dans quelques instants.");
        }
        if (response.status === 402) {
          throw new Error("Crédits insuffisants. Ajoutez des crédits à votre workspace.");
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("Pas de réponse du serveur");
      }

      // Lire le flux SSE token par token
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullResult = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullResult += content;
              setAnalysisResult(fullResult);
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Flush final buffer
      if (buffer.trim()) {
        for (let raw of buffer.split('\n')) {
          if (!raw || raw.startsWith(':')) continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullResult += content;
              setAnalysisResult(fullResult);
            }
          } catch { /* ignore */ }
        }
      }
      
      setSamyEmotion('energetic');
      toast({
        title: "✨ Analyse terminée",
        description: "L'image a été analysée avec succès",
      });
      setTimeout(() => setSamyEmotion('calm'), 2000);
    } catch (error) {
      console.error("Erreur d'analyse:", error);
      toast({
        variant: "destructive",
        title: "Erreur d'analyse",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
      });
      setAnalysisResult("");
      setSamyEmotion('calm');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveMemory = async () => {
    if (!analysisResult) {
      toast({
        variant: "destructive",
        title: "Aucun résultat",
        description: "Analysez d'abord une image avant de sauvegarder",
      });
      return;
    }

    const result = await addEntry(analysisResult, 'analysis', {
      prompt: prompt || "Décris cette image en détail",
      format: selectedFormat,
      template: selectedTemplate,
      imageName: selectedImage?.name || 'unknown'
    });

    if (result.success) {
      toast({
        title: "Sauvegardé",
        description: "L'analyse a été ajoutée à la mémoire",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Erreur de sauvegarde",
        description: result.error || "Impossible de sauvegarder l'analyse",
      });
    }
  };

  const handleDeleteMemory = async (id: string) => {
    const result = await deleteEntry(id);
    
    if (result.success) {
      toast({
        title: "Supprimé",
        description: "L'entrée a été supprimée de la mémoire",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: result.error || "Impossible de supprimer l'entrée",
      });
    }
  };

  const handleExport = (format: 'json' | 'csv' | 'txt') => {
    downloadExport(format);
    toast({
      title: "Export réussi",
      description: `La mémoire a été exportée au format ${format.toUpperCase()}`,
    });
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    setAnalysisResult("");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle relative">
      {/* Samy Avatar 3D - Floating */}
      <div className="fixed bottom-4 right-4 w-64 h-64 z-50 pointer-events-none">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
        >
          <color attach="background" args={['transparent']} />
          
          <ambientLight intensity={0.3} />
          <pointLight position={[5, 5, 5]} intensity={0.5} />
          <pointLight position={[-5, -5, -5]} intensity={0.3} color="#4A90E2" />
          
          <Environment preset="night" />
          
          <SamyParticles />
          
          <SamyAvatar
            emotion={samyEmotion}
            isSpeaking={isAnalyzing}
            intensity={isAnalyzing ? 0.8 : 0.3}
          />
          
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={!isAnalyzing}
            autoRotateSpeed={0.5}
          />
        </Canvas>
      </div>
      {/* Header */}
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-primary">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Samy Vision
            </h1>
            <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">- Analyse d'images IA</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column - Upload & Analysis */}
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            {/* Image Upload */}
            <Card className="p-4 sm:p-6 shadow-medium">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
                <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Télécharger une image
              </h2>
              <ImageUpload
                onImageSelect={handleImageSelect}
                imagePreview={imagePreview}
                onClear={handleClearImage}
              />
            </Card>

            {/* Templates & Format Selection */}
            <Card className="p-4 sm:p-6 shadow-medium">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                <h2 className="text-lg sm:text-xl font-semibold">Templates & Format</h2>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
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
            <Card className="p-4 sm:p-6 shadow-medium">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Prompt personnalisé</h2>
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
            <div className="flex gap-2 sm:gap-3">
              <Button
                onClick={handleAnalyze}
                disabled={!selectedImage || isAnalyzing}
                className="flex-1 min-h-[44px] h-12 text-base sm:text-lg font-bold bg-gradient-primary hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-large relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                {isAnalyzing ? (
                  <>
                    <div className="relative flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-foreground border-t-transparent mr-2" />
                      <span className="animate-pulse">Analyse en cours...</span>
                    </div>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                    <span>Analyser l'image ⚡</span>
                  </>
                )}
              </Button>
              <Button
                onClick={handleSaveMemory}
                disabled={!analysisResult}
                variant="outline"
                className="h-12 min-h-[44px]"
              >
                <Save className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Right Column - Results & Memory */}
          <div className="space-y-4 sm:space-y-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            {/* Analysis Result */}
            <Card className="p-4 sm:p-6 shadow-medium">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Résultat de l'analyse</h2>
              <AnalysisResult result={analysisResult} isAnalyzing={isAnalyzing} />
            </Card>

            {/* Memory Stats */}
            <MemoryStats stats={getStatistics()} />

            {/* Memory Export */}
            <MemoryExport 
              onExport={handleExport}
              disabled={memories.length === 0}
            />

            {/* Memory List */}
            <Card className="p-4 sm:p-6 shadow-medium">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
                <History className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Mémoire récente ({memories.length})
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
