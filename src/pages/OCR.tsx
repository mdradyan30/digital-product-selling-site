import { useState, useRef, useCallback } from "react";
import { Upload, Camera, Copy, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function OCR() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = useCallback((f: File) => {
    if (f.size > 20 * 1024 * 1024) {
      toast({ title: "Error", description: "ফাইল সাইজ ২০MB এর বেশি হতে পারবে না", variant: "destructive" });
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const extractText = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(",")[1];
        const { data, error } = await supabase.functions.invoke("ocr", {
          body: { image: base64, mimeType: file.type },
        });
        if (error) throw error;
        setExtractedText(data.text || "কোনো টেক্সট পাওয়া যায়নি।");
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setLoading(false);
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(extractedText);
    toast({ title: "কপি হয়েছে!" });
  };

  const downloadText = () => {
    const blob = new Blob([extractedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "extracted-text.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2 className="text-2xl font-display text-primary mb-1">OCR</h2>
      <p className="text-muted-foreground mb-6">
        Upload images or PDFs and extract Bangla & English text with high accuracy.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="border-2 border-dashed border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-accent mb-4">Upload Document</h3>
          {preview ? (
            <div className="space-y-4">
              <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg object-contain" />
              <div className="flex gap-2 justify-center">
                <Button onClick={extractText} disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Extracting...</> : "Extract Text"}
                </Button>
                <Button variant="outline" onClick={() => { setFile(null); setPreview(null); }}>
                  Change
                </Button>
              </div>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center py-12 cursor-pointer hover:bg-muted/30 rounded-lg transition-colors"
            >
              <Upload className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG, or PDF (max 20MB)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>
          )}
        </div>

        {/* Result Section */}
        <div className="border-2 border-dashed border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">OCR Result</h3>
            {extractedText && (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={copyText}>
                  <Copy className="h-4 w-4 mr-1" /> Copy
                </Button>
                <Button variant="ghost" size="sm" onClick={downloadText}>
                  <Download className="h-4 w-4 mr-1" /> Export
                </Button>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Extracted text appears here. You can review, edit, copy, or export.
          </p>
          <Textarea
            value={extractedText}
            onChange={(e) => setExtractedText(e.target.value)}
            placeholder="Extracted text will appear here. You can edit it before copying or exporting."
            className="min-h-[200px] font-mono text-sm"
          />
        </div>
      </div>
    </div>
  );
}
