
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceStrainInputProps {
  onStrainNamesUpdate: (names: string[]) => void;
  isGenerating: boolean;
}

const VoiceStrainInput = ({ onStrainNamesUpdate, isGenerating }: VoiceStrainInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [strainNames, setStrainNames] = useState<string[]>([]);
  const [transcript, setTranscript] = useState('');
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

  const processTranscript = () => {
    if (!transcript.trim()) return;

    // Extract strain names from transcript
    // Look for patterns like "strain1, strain2 and strain3" or "strain1 strain2 strain3"
    const names = transcript
      .split(/[,\sand\s]+/)
      .map(name => name.trim())
      .filter(name => name.length > 0)
      .map(name => name.replace(/[^\w\s-]/g, '').trim())
      .filter(name => name.length > 1);

    const newStrainNames = [...strainNames, ...names];
    setStrainNames(newStrainNames);
    onStrainNamesUpdate(newStrainNames);
    setTranscript('');
  };

  const removeStrain = (index: number) => {
    const updated = strainNames.filter((_, i) => i !== index);
    setStrainNames(updated);
    onStrainNamesUpdate(updated);
  };

  const clearAll = () => {
    setStrainNames([]);
    setTranscript('');
    onStrainNamesUpdate([]);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Say strain names clearly. You can say "Blue Dream, Girl Scout Cookies and OG Kush" 
              or list them one by one.
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={isListening ? stopListening : startListening}
                disabled={isGenerating}
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
                <Button onClick={processTranscript} variant="outline">
                  Add Strains
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

      {strainNames.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Detected Strains ({strainNames.length})</h4>
              <Button onClick={clearAll} variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {strainNames.map((name, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-2">
                  {name}
                  <button
                    onClick={() => removeStrain(index)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VoiceStrainInput;
