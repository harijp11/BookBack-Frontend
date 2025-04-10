import React, { useState, useRef } from "react";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@/Components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/Components/ui/dialog";
import { Loader2, Check, X } from "lucide-react";

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedImageBase64: string) => void;
  aspectRatio?: number; // Optional aspect ratio (1 for square, 3/4 for book covers, etc.)
  circularCrop?: boolean; // Optional circular crop for profile pictures
  title?: string; // Optional title for the dialog
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
  aspectRatio,
  circularCrop = false,
  title = "Crop Image",
}) => {
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 80,
    height: aspectRatio ? 80 / aspectRatio : 80,
    x: 10,
    y: 10,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const getCroppedImg = () => {
    if (!imageRef.current) return;

    setIsProcessing(true);

    const image = imageRef.current;
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Set canvas dimensions to match the desired crop size
    canvas.width = crop.width! * scaleX;
    canvas.height = crop.height! * scaleY;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsProcessing(false);
      return;
    }

    // Draw the cropped image on the canvas
    ctx.drawImage(
      image,
      crop.x! * scaleX,
      crop.y! * scaleY,
      crop.width! * scaleX,
      crop.height! * scaleY,
      0,
      0,
      crop.width! * scaleX,
      crop.height! * scaleY
    );

    // If circular crop is requested, apply a circular mask
    if (circularCrop) {
      // Save the current context state
      ctx.save();
      
      // Create a circular path
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY);
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
      ctx.clip();
      
      // Draw the image again to apply the clip
      ctx.drawImage(
        image,
        crop.x! * scaleX,
        crop.y! * scaleY,
        crop.width! * scaleX,
        crop.height! * scaleY,
        0,
        0,
        crop.width! * scaleX,
        crop.height! * scaleY
      );
      
      // Restore the context state
      ctx.restore();
    }

    // Convert canvas to a base64-encoded string
    const base64Image = canvas.toDataURL("image/jpeg", 0.9); // 0.9 quality for better file size

    // Pass the cropped image back to parent component
    onCropComplete(base64Image);
    setIsProcessing(false);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="flex justify-center">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              aspect={aspectRatio}
              circularCrop={circularCrop}
              className="max-h-[500px]"
            >
              <img
                src={imageSrc}
                ref={imageRef}
                alt="Crop preview"
                className="max-h-[500px] object-contain"
              />
            </ReactCrop>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            Drag to adjust the crop area.
            {circularCrop && " The image will be cropped as a circle."}
          </p>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            <X className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button
            type="button"
            onClick={getCroppedImg}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" /> Apply Crop
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropper;