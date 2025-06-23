
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Trash2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { extractStrainsFromText, ExtractedStrain } from '@/services/bulkStrainService';

interface VoiceStrainInputProps {
  onStrainNamesUpdate: (strains: ExtractedStrain[]) => void;
  isGenerating: boolean;
}

const VoiceStrainInput = ({ onStrainNamesUpdate, isGenerating }: VoiceStrainInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [extractedStrains, setExtractedStrains] = useState<ExtractedStrain[]>([]);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };

    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      
      if (finalTranscript) {
        setTranscript(prev => prev + ' ' + finalTranscript);
      }
    };

    recognitionRef.current.onerror = () => {
      setIsListening(false);
      toast({
        title: "Speech Recognition Error",
        description: "There was an error with speech recognition. Please try again.",
        variant: "destructive",
      });
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const processTranscript = async () => {
    if (!transcript.trim()) return;

    setIsProcessing(true);
    try {
      const result = await extractStrainsFromText(transcript);
      
      const newStrains = [...extractedStrains, ...result.strains];
      setExtractedStrains(newStrains);
      onStrainNamesUpdate(newStrains);
      setTranscript('');

      toast({
        title: "Strains Extracted",
        description: `Found ${result.strains.length} strains with ${result.confidence}% confidence.`,
      });
    } catch (error) {
      toast({
        title: "Processing Failed",
        description: "Failed to extract strain information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const removeStrain = (index: number) => {
    const updated = extractedStrains.filter((_, i) => i !== index);
    setExtractedStrains(updated);
    onStrainNamesUpdate(updated);
  };

  const clearAll = () => {
    setExtractedStrains([]);
    setTranscript('');
    onStrainNamesUpdate([]);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Say strain names with prices if available. For example: "Blue Dream twenty five dollars, Girl Scout Cookies thirty, OG Kush indica type"
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={isListening ? stopListening : startListening}
                disabled={isGenerating || isProcessing}
                variant={isListening ? "destructive" : "default"}
                size="lg"
                className="flex items-center gap-2"
              >
                {isListening ? (
                  <>
                    <MicOff className="h-4 w-4" />
                    Stop Listening
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    Start Listening
                  </>
                )}
              </Button>

              {transcript && (
                <Button 
                  onClick={processTranscript} 
                  variant="outline" 
                  disabled={isProcessing}
                  className="flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      Extract Strains
                    </>
                  )}
                </Button>
              )}
            </div>

            {transcript && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-mono">{transcript}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {extractedStrains.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Extracted Strains ({extractedStrains.length})</h4>
              <Button onClick={clearAll} variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
            
            <div className="space-y-2">
              {extractedStrains.map((strain, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{strain.name}</span>
                    {strain.price && (
                      <Badge variant="outline" className="text-green-600">
                        ${strain.price}
                      </Badge>
                    )}
                    {strain.type && (
                      <Badge variant="secondary">
                        {strain.type}
                      </Badge>
                    )}
                  </div>
                  <Button
                    onClick={() => removeStrain(index)}
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VoiceStrainInput;
