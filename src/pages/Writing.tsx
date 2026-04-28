import { useState } from "react";
import { Copy, Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const tones = ["Professional", "Casual", "Academic", "Creative", "Formal"];
const types = ["Blog Post", "Email", "Essay", "Social Media", "Article", "Story"];

export default function Writing() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professional");
  const [type, setType] = useState("Blog Post");
  const [language, setLanguage] = useState("Bangla");
  const [generatedText, setGeneratedText] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-write", {
        body: { topic, tone, type, language },
      });
      if (error) throw error;
      setGeneratedText(data.content || "কন্টেন্ট তৈরি করা যায়নি।");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-display text-primary mb-1">AI Writing Tool</h2>
      <p className="text-muted-foreground mb-6">
        Generate polished content in Bangla or English with AI assistance.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4 border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-accent">Configure</h3>
          <div className="space-y-2">
            <Label>Topic / Prompt</Label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="যেমন: বাংলাদেশের মুক্তিযুদ্ধের ইতিহাস..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {tones.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Bangla">বাংলা</SelectItem>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Both">Both (Mixed)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={generate} disabled={loading || !topic.trim()} className="w-full">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</> : <><Wand2 className="h-4 w-4 mr-2" /> Generate Content</>}
          </Button>
        </div>

        <div className="space-y-3 border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-primary">Generated Content</h3>
            {generatedText && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(generatedText);
                  toast({ title: "কপি হয়েছে!" });
                }}
              >
                <Copy className="h-4 w-4 mr-1" /> Copy
              </Button>
            )}
          </div>
          <Textarea
            value={generatedText}
            onChange={(e) => setGeneratedText(e.target.value)}
            placeholder="AI দ্বারা তৈরি কন্টেন্ট এখানে দেখা যাবে..."
            className="min-h-[300px] text-base"
          />
        </div>
      </div>
    </div>
  );
}
