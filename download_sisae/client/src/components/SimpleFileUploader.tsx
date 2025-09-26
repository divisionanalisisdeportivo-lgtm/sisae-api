import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SimpleFileUploaderProps {
  onFileUploaded?: (filePath: string) => void;
  buttonClassName?: string;
  accept?: string;
  maxSize?: number;
  children: React.ReactNode;
}

export function SimpleFileUploader({
  onFileUploaded,
  buttonClassName = "",
  accept = ".pdf",
  maxSize = 10485760, // 10MB
  children
}: SimpleFileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize) {
      toast({
        title: "Error",
        description: "El archivo es demasiado grande. Máximo 10MB.",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.includes("pdf")) {
      toast({
        title: "Error", 
        description: "Solo se permiten archivos PDF.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      // Simular la carga del archivo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generar una URL simulada del archivo
      const fakePath = `/objects/uploads/${file.name}-${Date.now()}.pdf`;
      
      onFileUploaded?.(fakePath);
      
      toast({
        title: "Archivo cargado",
        description: "El PDF se cargó exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cargar el archivo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
      <Button 
        onClick={handleClick}
        className={buttonClassName}
        disabled={uploading}
        type="button"
      >
        {uploading ? (
          <>
            <i className="fas fa-spinner fa-spin mr-2"></i>
            Cargando...
          </>
        ) : (
          children
        )}
      </Button>
    </>
  );
}