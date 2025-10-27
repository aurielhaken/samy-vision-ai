import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Terminal, Cloud, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type BridgeType = 'local' | 'cloud';

export const SamyBridgeSelector = () => {
  const LOCAL_URL = 'ws://localhost:8081';
  const CLOUD_URL = 'wss://qmofmorbkihcdfbaoqsh.functions.supabase.co/samy-bridge';
  
  const [currentBridge, setCurrentBridge] = useState<BridgeType>('cloud');
  const [showInstructions, setShowInstructions] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Détecter le bridge actuel depuis localStorage
    try {
      const saved = localStorage.getItem('samy-ws-url');
      if (saved === LOCAL_URL) {
        setCurrentBridge('local');
      } else {
        setCurrentBridge('cloud');
      }
    } catch (_) {}
  }, [LOCAL_URL]);

  const switchBridge = (type: BridgeType) => {
    const url = type === 'local' ? LOCAL_URL : CLOUD_URL;
    
    try {
      localStorage.setItem('samy-ws-url', url);
      setCurrentBridge(type);
      
      toast({
        title: `Bridge ${type === 'local' ? 'Local' : 'Cloud'} activé`,
        description: 'Rechargement de la page...',
      });
      
      // Recharger pour reconnecter avec le nouveau bridge
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de changer de bridge',
      });
    }
  };

  return (
    <Card className="p-4 shadow-medium">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={currentBridge === 'local' ? 'default' : 'secondary'}>
              {currentBridge === 'local' ? (
                <>
                  <Terminal className="w-3 h-3 mr-1" />
                  Bridge Local
                </>
              ) : (
                <>
                  <Cloud className="w-3 h-3 mr-1" />
                  Bridge Cloud
                </>
              )}
            </Badge>
          </div>
          
          <Collapsible open={showInstructions} onOpenChange={setShowInstructions}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <Info className="w-4 h-4" />
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        </div>

        <Collapsible open={showInstructions} onOpenChange={setShowInstructions}>
          <CollapsibleContent className="space-y-3">
            <div className="text-sm space-y-2 p-3 bg-muted rounded-lg">
              <p className="font-medium">🌥️ Bridge Cloud (par défaut)</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                <li>Fonctionne automatiquement</li>
                <li>Pas besoin de serveur local</li>
                <li>⚠️ Ne peut pas exécuter say13</li>
              </ul>

              <p className="font-medium mt-3">💻 Bridge Local (pour say13)</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                <li>Permet d'utiliser say13 depuis le terminal</li>
                <li>Nécessite le serveur local actif</li>
                <li>Commande: <code className="bg-background px-1 py-0.5 rounded">node samy-bridge.js</code></li>
              </ul>

              <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs">
                <p className="text-yellow-700 dark:text-yellow-300">
                  ⚠️ Pour le bridge local, lancez d'abord le serveur dans votre terminal !
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="flex gap-2">
          <Button
            variant={currentBridge === 'cloud' ? 'default' : 'outline'}
            onClick={() => switchBridge('cloud')}
            className="flex-1"
            size="sm"
          >
            <Cloud className="w-4 h-4 mr-2" />
            Cloud
          </Button>
          
          <Button
            variant={currentBridge === 'local' ? 'default' : 'outline'}
            onClick={() => switchBridge('local')}
            className="flex-1"
            size="sm"
          >
            <Terminal className="w-4 h-4 mr-2" />
            Local
          </Button>
        </div>
      </div>
    </Card>
  );
};