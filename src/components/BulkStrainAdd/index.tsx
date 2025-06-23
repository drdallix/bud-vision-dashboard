
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Mic, Camera, Table2, Plus } from 'lucide-react';
import VoiceStrainInput from './VoiceStrainInput';
import ImageStrainInput from './ImageStrainInput';
import TableStrainInput from './TableStrainInput';
import BulkGenerationProgress from './BulkGenerationProgress';
import { Strain } from '@/types/strain';
import { ExtractedStrain } from '@/services/bulkStrainService';

interface BulkStrainAddProps {
  onStrainsGenerated: (strains: Strain[]) => void;
}

const BulkStrainAdd = ({ onStrainsGenerated }: BulkStrainAddProps) => {
  const [extractedStrains, setExtractedStrains] = useState<ExtractedStrain[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentGenerating, setCurrentGenerating] = useState<string>('');
  const [generatedStrains, setGeneratedStrains] = useState<Strain[]>([]);
  const [generationProgress, setGenerationProgress] = useState(0);

  const handleStrainNamesUpdate = (strains: ExtractedStrain[]) => {
    setExtractedStrains(strains);
  };

  const handleStartBulkGeneration = async () => {
    if (extractedStrains.length === 0) return;
    
    setIsGenerating(true);
    setGeneratedStrains([]);
    setGenerationProgress(0);

    // This will be implemented to use the existing strain generation logic
    // For now, just simulate the process
    for (let i = 0; i < extractedStrains.length; i++) {
      setCurrentGenerating(extractedStrains[i].name);
      setGenerationProgress(((i + 1) / extractedStrains.length) * 100);
      
      // Simulate generation delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsGenerating(false);
    setCurrentGenerating('');
  };

  const strainNames = extractedStrains.map(s => s.name);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-600" />
            Bulk Strain Addition
          </CardTitle>
          <CardDescription>
            Add multiple strains at once using voice, image recognition, or manual entry. AI will extract names, prices, and types automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <span>Queued:</span>
              <span className="font-bold">{extractedStrains.length}</span>
            </Badge>
            {generatedStrains.length > 0 && (
              <Badge variant="default" className="flex items-center gap-1">
                <span>Generated:</span>
                <span className="font-bold">{generatedStrains.length}</span>
              </Badge>
            )}
            {extractedStrains.some(s => s.price) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <span>With Prices:</span>
                <span className="font-bold">{extractedStrains.filter(s => s.price).length}</span>
              </Badge>
            )}
          </div>

          <Tabs defaultValue="voice" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="voice" className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Voice
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Image
              </TabsTrigger>
              <TabsTrigger value="table" className="flex items-center gap-2">
                <Table2 className="h-4 w-4" />
                Table
              </TabsTrigger>
            </TabsList>

            <TabsContent value="voice" className="space-y-4">
              <VoiceStrainInput 
                onStrainNamesUpdate={handleStrainNamesUpdate}
                isGenerating={isGenerating}
              />
            </TabsContent>

            <TabsContent value="image" className="space-y-4">
              <ImageStrainInput 
                onStrainNamesUpdate={handleStrainNamesUpdate}
                isGenerating={isGenerating}
              />
            </TabsContent>

            <TabsContent value="table" className="space-y-4">
              <TableStrainInput 
                onStrainNamesUpdate={handleStrainNamesUpdate}
                isGenerating={isGenerating}
                onStartGeneration={handleStartBulkGeneration}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {isGenerating && (
        <BulkGenerationProgress 
          strainNames={strainNames}
          currentGenerating={currentGenerating}
          generatedStrains={generatedStrains}
          progress={generationProgress}
        />
      )}
    </div>
  );
};

export default BulkStrainAdd;
