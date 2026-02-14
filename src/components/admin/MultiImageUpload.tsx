import { useState, useRef } from 'react';
import { uploadFile } from '@/lib/cfApi';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, X, Plus } from 'lucide-react';

interface MultiImageUploadProps {
  values: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

export default function MultiImageUpload({
  values = [],
  onChange,
  maxImages = 5
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - values.length;
    if (remainingSlots <= 0) {
      setErrorMessage(`Máximo de ${maxImages} imagens permitidas.`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    for (const file of filesToUpload) {
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Por favor, selecione apenas arquivos de imagem.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Cada imagem deve ter no máximo 5MB.');
        return;
      }
    }

    setUploading(true);
    setErrorMessage('');

    try {
      const uploadedUrls: string[] = [];

      for (const file of filesToUpload) {
        const { url } = await uploadFile(file);
        uploadedUrls.push(url);
      }

      onChange([...values, ...uploadedUrls]);
    } catch (error: any) {
      console.error('Erro no upload:', error);
      setErrorMessage(error.message || 'Erro ao fazer upload.');
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const newValues = values.filter((_, i) => i !== index);
    onChange(newValues);
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {values.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {values.map((url, index) => (
            <div key={index} className="relative">
              <div className="w-24 h-24 rounded-lg overflow-hidden border border-border bg-background">
                <img src={url} alt={`Imagem ${index + 1}`} className="w-full h-full object-cover" />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {values.length < maxImages && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-24 h-24 rounded-lg border-2 border-dashed border-border bg-background hover:bg-muted/50 flex flex-col items-center justify-center gap-1 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <Plus className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Adicionar</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {values.length === 0 && (
        <Button
          type="button"
          variant="secondary"
          className="bg-background border border-border hover:bg-muted"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Adicionar Imagens
            </>
          )}
        </Button>
      )}

      {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}

      <p className="text-xs text-muted-foreground">
        Adicione até {maxImages} imagens. Formatos: JPG, PNG, WebP. Max: 5MB cada.
      </p>
    </div>
  );
}
