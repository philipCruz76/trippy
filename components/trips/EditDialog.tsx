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
    onUpdate: (newValue: string, creditName?: string, creditLink?: string) => void;
  };
  
  export const EditDialog = ({ 
    open, 
    onOpenChange, 
    type, 
    initialValue,
    onUpdate 
  }: EditDialogProps) => {
    const [value, setValue] = useState(initialValue);
    const [creditName, setCreditName] = useState('');
    const [creditLink, setCreditLink] = useState('');
    const [previewError, setPreviewError] = useState(false);
  
    useEffect(() => {
      if (open) {
        setValue(initialValue);
        setCreditName('');
        setCreditLink('');
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
        onUpdate(value, creditName, creditLink);
        onOpenChange(false);
        setValue(initialValue);
        setCreditName('');
        setCreditLink('');
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
  
            {type === 'image' && (
              <>
                <Input
                  placeholder="Photo credit name (optional)"
                  value={creditName}
                  onChange={(e) => setCreditName(e.target.value)}
                />
                <Input
                  placeholder="Photo credit link (optional)"
                  value={creditLink}
                  onChange={(e) => setCreditLink(e.target.value)}
                />
                {value && (
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
              </>
            )}
          </div>
  
          <DialogFooter>
            <Button
              onClick={handleSubmit}
              disabled={!config.validateInput(value)}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };