import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, Image, X } from "lucide-react";

interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
}

export default function FileUpload({ value, onChange }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("logo", file);
      const res = await apiRequest("POST", "/api/upload", formData);
      return await res.json();
    },
    onSuccess: (data) => {
      onChange(data.url);
      toast({
        title: "Upload successful",
        description: "Logo has been uploaded successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a valid image file (JPG, PNG, SVG, WebP).",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }
    
    uploadMutation.mutate(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          isDragging
            ? "border-primary bg-primary/5"
            : value
            ? "border-green-300 bg-green-50"
            : "border-gray-300 hover:border-primary/50"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        {uploadMutation.isPending ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : value ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Image className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 mb-2">Logo uploaded successfully</p>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={handleClick}>
                Replace
              </Button>
              <Button size="sm" variant="outline" onClick={handleRemove}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-2">Drop your logo here or click to browse</p>
            <p className="text-xs text-gray-500 mb-3">SVG, PNG, JPG up to 5MB</p>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              Choose File
            </Button>
          </div>
        )}
      </div>
      
      {value && (
        <div className="flex items-center justify-center">
          <img 
            src={value} 
            alt="Logo preview" 
            className="max-w-32 max-h-32 object-contain rounded-lg border border-gray-200"
          />
        </div>
      )}
    </div>
  );
}
