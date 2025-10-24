import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, FileJson, FileText, FileSpreadsheet } from "lucide-react";

interface MemoryExportProps {
  onExport: (format: 'json' | 'csv' | 'txt') => void;
  disabled?: boolean;
}

const MemoryExport = ({ onExport, disabled }: MemoryExportProps) => {
  return (
    <Card className="p-6 shadow-medium">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Download className="w-5 h-5 text-primary" />
        Exporter la mémoire
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button
          variant="outline"
          className="flex flex-col gap-2 h-auto py-4 min-h-[44px]"
          onClick={() => onExport('json')}
          disabled={disabled}
        >
          <FileJson className="w-6 h-6 text-primary" />
          <span className="text-xs">JSON</span>
        </Button>
        
        <Button
          variant="outline"
          className="flex flex-col gap-2 h-auto py-4 min-h-[44px]"
          onClick={() => onExport('csv')}
          disabled={disabled}
        >
          <FileSpreadsheet className="w-6 h-6 text-accent" />
          <span className="text-xs">CSV</span>
        </Button>
        
        <Button
          variant="outline"
          className="flex flex-col gap-2 h-auto py-4 min-h-[44px]"
          onClick={() => onExport('txt')}
          disabled={disabled}
        >
          <FileText className="w-6 h-6 text-success" />
          <span className="text-xs">TXT</span>
        </Button>
      </div>
    </Card>
  );
};

export default MemoryExport;
