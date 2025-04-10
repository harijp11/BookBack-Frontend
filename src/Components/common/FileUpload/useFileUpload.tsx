import { useState, useRef } from "react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Check, Loader2, Upload, X } from "lucide-react";

interface FileUploadProps {
  id: string;
  label: string;
  accept?: string;
  multiple?: boolean;
  previewUrl?: string | null;
  uploadFunction: (file: File) => Promise<string>;
  onFileSelected?: (file: File | null) => void;
  onUploadComplete?: (url: string) => void;
  className?: string;
}

export default function FileUpload({
  id,
  label,
  accept = "image/*",
  multiple = false,
  // previewUrl,
  uploadFunction,
  onFileSelected,
  onUploadComplete,
  className = "",
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // const [preview, setPreview] = useState<string | null>(previewUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  // const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      setSelectedFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          // setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        // For non-image files, clear preview
        // setPreview(null);
      }
      
      // Reset upload states
      setIsUploaded(false);
      // setUploadedUrl(null);
      
      // Notify parent component
      if (onFileSelected) {
        onFileSelected(file);
      }
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    try {
      const url = await uploadFunction(selectedFile);
      // setUploadedUrl(url);
      setIsUploaded(true);
      
      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete(url);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Reset the file input
  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setSelectedFile(null);
    // setPreview(null);
    setIsUploaded(false);
    // setUploadedUrl(null);
    
    // Notify parent component
    if (onFileSelected) {
      onFileSelected(null);
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center gap-2">
        <Label 
          htmlFor={id} 
          className="cursor-pointer text-sm text-blue-600 hover:text-blue-800"
        >
          {label}
        </Label>
        <Input
          ref={fileInputRef}
          id={id}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      
      {selectedFile && (
        <div className="mt-2 flex flex-col gap-2">
          {/* <p className="text-sm text-gray-600">
            {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
          </p> */}
          
          {/* {preview && (
            <div className="relative h-32 w-32 overflow-hidden rounded-md border border-gray-200">
              <img 
                src={preview} 
                alt="Preview" 
                className="h-full w-full object-cover"
              />
            </div>
          )} */}
          
          <div className="flex items-center gap-2">
            {!isUploaded ? (
              <Button 
                type="button" 
                size="sm" 
                onClick={handleUpload}
                disabled={isUploading}
                className="flex items-center gap-1"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Upload</span>
                  </>
                )}
              </Button>
            ) : (
              <div className="flex items-center gap-1 text-sm text-green-600">
                <Check className="h-4 w-4" />
                <span>Uploaded</span>
              </div>
            )}
            
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={resetFileInput}
              className="flex items-center gap-1 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <X className="h-4 w-4" />
              <span>Remove</span>
            </Button>
          </div>
        </div>
      )}
      
      {!selectedFile && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2 flex items-center gap-1 border-dashed"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          <span>Select File</span>
        </Button>
      )}
    </div>
  );
}