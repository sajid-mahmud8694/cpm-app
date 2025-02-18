import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X } from "lucide-react";
import { Label } from "@/components/ui/label";

interface FileUploaderProps {
  value: {
    orderName: string;
    files: Array<{ path: string; imageCount?: number }>;
    instructions: string;
  };
  onChange: (updates: Partial<FileUploaderProps["value"]>) => void;
  onValidityChange: (isValid: boolean) => void;
}

export function FileUploader({ value, onChange, onValidityChange }: FileUploaderProps) {
  const [urlInput, setUrlInput] = useState("");
  const [imageCount, setImageCount] = useState<number>(1);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onChange({
      files: [...value.files, ...files.map(f => ({ path: f.name, imageCount: 1 }))]
    });
  };

  const handleUrlAdd = () => {
    if (urlInput) {
      onChange({
        files: [...value.files, { path: urlInput, imageCount }]
      });
      setUrlInput("");
      setImageCount(1);
    }
  };

  const handleRemoveFile = (index: number) => {
    onChange({
      files: value.files.filter((_, i) => i !== index)
    });
  };

  const totalImages = value.files.reduce((sum, file) => sum + (file.imageCount || 1), 0);

  // Check if required fields are filled
  useEffect(() => {
    const isValid = value.orderName.trim() !== '' && 
                   value.files.length > 0 && 
                   value.instructions.trim() !== '';
    onValidityChange(isValid);
  }, [value, onValidityChange]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Upload Files</h2>
        <p className="text-muted-foreground">
          Drop files to upload or enter file URLs from external sources
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="order-name" className="font-semibold">Order Name *</Label>
        <Input
          id="order-name"
          placeholder="Enter a name for your order"
          value={value.orderName}
          onChange={(e) => onChange({ orderName: e.target.value })}
        />
      </div>

      <div className="border-2 border-dashed rounded-lg p-8 text-center">
        <Input
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.psd,.zip,.rar,.7z"
          className="hidden"
          id="file-upload"
          onChange={handleFileChange}
        />
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center gap-2 cursor-pointer"
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <span>Drop files to upload (or click here)</span>
          <span className="text-sm text-muted-foreground">
            Supports .zip, .rar, .7z and image files
          </span>
        </label>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Enter file URL (WeTransfer, Google Drive, etc.)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
          />
        </div>
        <Input
          type="number"
          className="w-32"
          min={1}
          value={imageCount}
          onChange={(e) => setImageCount(parseInt(e.target.value) || 1)}
          placeholder="Images"
        />
        <Button onClick={handleUrlAdd}>Add URL</Button>
      </div>

      {value.files.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold">Uploaded Files</h3>
          <div className="space-y-2">
            {value.files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-accent/50 rounded"
              >
                <div className="flex-1">
                  <span className="truncate">{file.path}</span>
                  {file.imageCount && file.imageCount > 1 && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({file.imageCount} images)
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Total images: {totalImages}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="instructions" className="font-semibold">Order Instructions *</Label>
        <Textarea
          id="instructions"
          placeholder="Add any specific instructions for your order..."
          value={value.instructions}
          onChange={(e) => onChange({ instructions: e.target.value })}
          rows={4}
        />
      </div>
    </div>
  );
}
