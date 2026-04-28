import { useState } from "react";
import { ArrowRightLeft, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const languages = [
  { code: "bn", name: "বাংলা (Bangla)" },
  { code: "en", name: "English" },
  { code: "hi", name: "हिन्दी (Hindi)" },
  { code: "ar", name: "العربية (Arabic)" },
  { code: "es", name: "Español (Spanish)" },
  { code: "fr", name: "Français (French)" },
  { code: "de", name: "Deutsch (German)" },
  { code: "ja", name: "日本語 (Japanese)" },
  { code: "ko", name: "한국어 (Korean)" },
  { code: "zh", name: "中文 (Chinese)" },
];

export default function Translator() {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("bn");
  const [targetLang, setTargetLang] = useState("en");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const translate = async () => {
    if (!sourceText.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("translate", {
        body: {
          text: sourceText,
          sourceLang: languages.find(l => l.code === sourceLang)?.name,
          targetLang: languages.find(l => l.code === targetLang)?.name,
        },
      });
      if (error) throw error;
      setTranslatedText(data.translation || "অনুবাদ করা যায়নি।");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  return (
    <div>
      <h2 className="text-2xl font-display text-primary mb-1">Real-time Translator</h2>
      <p className="text-muted-foreground mb-6">
        Translate text between multiple languages instantly with AI-powered accuracy.
      </p>

      <div className="flex items-center gap-4 mb-4">
        <Select value={sourceLang} onValueChange={setSourceLang}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            {languages.map(l => <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>)}
          </SelectContent>
        </Select>

        <Button variant="ghost" size="icon" onClick={swapLanguages}>
          <ArrowRightLeft className="h-5 w-5" />
        </Button>

        <Select value={targetLang} onValueChange={setTargetLang}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            {languages.map(l => <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="এখানে টেক্সট লিখুন বা পেস্ট করুন..."
            className="min-h-[250px] text-base"
          />
          <Button onClick={translate} disabled={loading || !sourceText.trim()} className="w-full">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Translating...</> : "Translate"}
          </Button>
        </div>

        <div className="space-y-3">
          <Textarea
            value={translatedText}
            readOnly
            placeholder="অনুবাদ এখানে দেখা যাবে..."
            className="min-h-[250px] text-base bg-muted/30"
          />
          {translatedText && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                navigator.clipboard.writeText(translatedText);
                toast({ title: "কপি হয়েছে!" });
              }}
            >
              <Copy className="h-4 w-4 mr-2" /> Copy Translation
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
