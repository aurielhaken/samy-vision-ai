import { useCallback } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  imagePreview: string;
  onClear: () => void;
}

const ImageUpload = ({ onImageSelect, imagePreview, onClear }: ImageUploadProps) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        onImageSelect(file);
      }
    },
    [onImageSelect]
  );

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  return (
    <div className="space-y-4">
      {!imagePreview ? (
        <label
          htmlFor="file-upload"
          className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-smooth group"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-12 h-12 mb-3 text-muted-foreground group-hover:text-primary transition-smooth" />
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-semibold">Cliquez pour télécharger</span> ou glissez-déposez
            </p>
            <p className="text-xs text-muted-foreground">PNG, JPG ou JPEG (MAX. 10MB)</p>
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleFileInput}
          />
        </label>
      ) : (
        <div className="relative group animate-scale-in">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-64 object-cover rounded-lg shadow-medium"
          />
          <Button
            onClick={onClear}
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-smooth shadow-large"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
