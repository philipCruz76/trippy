import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { useState, useEffect } from "react";
  import Image from "next/image";
  
  export type EditDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: 'title' | 'image';
    initialValue: string;
    onUpdate: (newValue: string) => void;
  };
  
  export const EditDialog = ({ 
    open, 
    onOpenChange, 
    type, 
    initialValue,
    onUpdate 
  }: EditDialogProps) => {
    const [value, setValue] = useState(initialValue);
    const [previewError, setPreviewError] = useState(false);
  
    useEffect(() => {
      if (open) {
        setValue(initialValue);
        setPreviewError(false);
      }
    }, [initialValue, open, type]);
  
    const dialogConfig = {
      title: {
        title: "Update Trip Title",
        description: "Enter a new title for your trip.",
        placeholder: "Enter new title...",
        validateInput: (input: string) => input.trim() !== "" && input !== initialValue,
      },
      image: {
        title: "Update Cover Image",
        description: "Enter a new image URL to update the trip cover image.",
        placeholder: "Enter image URL...",
        validateInput: (input: string) => input !== "" && !previewError,
      }
    };
  
    const config = dialogConfig[type];
  
    const handleSubmit = () => {
      if (config.validateInput(value)) {
        onUpdate(value);
        onOpenChange(false);
        setValue(initialValue);
        setPreviewError(false);
      }
    };
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="rounded-2xl border-none bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">{config.title}</DialogTitle>
            <DialogDescription className="text-neutral-600">
              {config.description}
            </DialogDescription>
          </DialogHeader>
  
          <div className="space-y-4">
            <Input
              placeholder={config.placeholder}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (type === 'image') setPreviewError(false);
              }}
            />
  
            {type === 'image' && value && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden">
                <Image
                  src={value}
                  alt="Preview"
                  fill
                  className="object-cover"
                  onError={() => setPreviewError(true)}
                />
                {previewError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
                    Invalid image URL
                  </div>
                )}
              </div>
            )}
          </div>
  
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-none rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!config.validateInput(value)}
              className="flex-1 sm:flex-none rounded-xl bg-black hover:bg-black/90"
            >
              Update {type === 'title' ? 'Title' : 'Image'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };