import { useState, useRef } from 'react';
import { uploadFile } from '@/lib/cfApi';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, X, CheckCircle, AlertCircle } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatus('error');
      setErrorMessage('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setStatus('error');
      setErrorMessage('A imagem deve ter no máximo 5MB.');
      return;
    }

    setStatus('uploading');
    setErrorMessage('');

    try {
      const { url } = await uploadFile(file);
      onChange(url);
      setStatus('success');
    } catch (error: any) {
      console.error('Erro no upload:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Erro ao fazer upload da imagem.');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    onChange('');
    setStatus('idle');
    setErrorMessage('');
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {value && (
        <div className="relative inline-block">
          <div className="w-32 h-32 rounded-lg overflow-hidden border border-border bg-background">
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          className="bg-background border border-border hover:bg-muted"
          onClick={handleButtonClick}
          disabled={status === 'uploading'}
        >
          {status === 'uploading' ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              {value ? 'Trocar Imagem' : 'Escolher Imagem'}
            </>
          )}
        </Button>

        {status === 'success' && (
          <span className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" />
            Upload concluído
          </span>
        )}

        {status === 'error' && (
          <span className="flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="w-4 h-4" />
            {errorMessage}
          </span>
        )}

        {status === 'idle' && !value && (
          <span className="text-sm text-muted-foreground">
            Nenhum arquivo escolhido
          </span>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Formatos aceitos: JPG, PNG, WebP. Tamanho máximo: 5MB.
      </p>
    </div>
  );
}
