import { useState, useCallback } from 'react';
import { Upload, Image as ImageIcon, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  selectedImage: File | null;
}

export const ImageUpload = ({ onImageSelect, selectedImage }: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [error, setError] = useState<string>('');

  const validateFile = (file: File): boolean => {
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a JPG or PNG image');
      setValidationStatus('invalid');
      return false;
    }

    // Check file size (16MB = 16 * 1024 * 1024 bytes)
    const maxSize = 16 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be less than 16MB');
      setValidationStatus('invalid');
      return false;
    }

    setError('');
    setValidationStatus('valid');
    return true;
  };

  const handleFile = useCallback((file: File) => {
    if (validateFile(file)) {
      onImageSelect(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const clearImage = () => {
    setPreview(null);
    onImageSelect(null as any);
    setValidationStatus('idle');
    setError('');
  };

  return (
    <div className="space-y-4">
      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer group",
            isDragging 
              ? "border-primary bg-primary/5 scale-105" 
              : "border-border hover:border-primary/50 hover:bg-muted/30"
          )}
        >
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="space-y-4">
            <div className={cn(
              "mx-auto w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
              isDragging 
                ? "bg-primary/20 scale-110" 
                : "bg-muted group-hover:bg-primary/10 group-hover:scale-105"
            )}>
              <Upload className={cn(
                "w-10 h-10 transition-colors",
                isDragging ? "text-primary" : "text-muted-foreground group-hover:text-primary"
              )} />
            </div>
            
            <div className="space-y-2">
              <p className="text-lg font-semibold text-foreground">
                {isDragging ? 'Drop your photo here' : 'Upload Your Photo'}
              </p>
              <p className="text-sm text-muted-foreground">
                Drag and drop or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                JPG or PNG • Max 16MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          <div className="relative rounded-xl overflow-hidden border-2 border-border group">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={clearImage}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {validationStatus === 'valid' && (
            <div className="flex items-center gap-2 text-success bg-success/10 px-4 py-3 rounded-lg animate-fade-in">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Photo uploaded successfully!</span>
            </div>
          )}
        </div>
      )}
      
      {error && (
        <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-3 rounded-lg animate-fade-in">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">{error}</span>
        </div>
      )}
      
      <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-primary" />
          Photo Guidelines
        </h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <p className="text-success font-medium">✓ Good Photos:</p>
            <ul className="text-muted-foreground space-y-0.5">
              <li>• Clear, front-facing</li>
              <li>• Well-lit</li>
              <li>• Single person</li>
              <li>• Face clearly visible</li>
            </ul>
          </div>
          <div className="space-y-1">
            <p className="text-destructive font-medium">✗ Avoid:</p>
            <ul className="text-muted-foreground space-y-0.5">
              <li>• Blurry images</li>
              <li>• Side profiles</li>
              <li>• Sunglasses/hats</li>
              <li>• Multiple people</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
        <span className="text-primary">🔒</span>
        <span>Your photo is encrypted and automatically deleted within 24 hours</span>
      </div>
    </div>
  );
};
