
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Mic, Camera, Table2, Plus } from 'lucide-react';
import VoiceStrainInput from './VoiceStrainInput';
import ImageStrainInput from './ImageStrainInput';
import TableStrainInput from './TableStrainInput';
import BulkGenerationProgress from './BulkGenerationProgress';
import { Strain } from '@/types/strain';

interface BulkStrainAddProps {
  onStrainsGenerated: (strains: Strain[]) => void;
}

const BulkStrainAdd = ({ onStrainsGenerated }: BulkStrainAddProps) => {
  const [strainNames, setStrainNames] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentGenerating, setCurrentGenerating] = useState<string>('');
  const [generatedStrains, setGeneratedStrains] = useState<Strain[]>([]);
  const [generationProgress, setGenerationProgress] = useState(0);

  const handleStrainNamesUpdate = (names: string[]) => {
    setStrainNames(names);
  };

  const handleStartBulkGeneration = async () => {
    if (strainNames.length === 0) return;
    
    setIsGenerating(true);
    setGeneratedStrains([]);
    setGenerationProgress(0);

    // This will be implemented to use the existing strain generation logic
    // For now, just simulate the process
    for (let i = 0; i < strainNames.length; i++) {
      setCurrentGenerating(strainNames[i]);
      setGenerationProgress(((i + 1) / strainNames.length) * 100);
      
      // Simulate generation delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsGenerating(false);
    setCurrentGenerating('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-600" />
            Bulk Strain Addition
          </CardTitle>
          <CardDescription>
            Add multiple strains at once using voice, image recognition, or manual entry
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <span>Queued:</span>
              <span className="font-bold">{strainNames.length}</span>
            </Badge>
            {generatedStrains.length > 0 && (
              <Badge variant="default" className="flex items-center gap-1">
                <span>Generated:</span>
                <span className="font-bold">{generatedStrains.length}</span>
              </Badge>
            )}
          </div>

          {isGenerating && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Generating strains...</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(generationProgress)}%
                </span>
              </div>
              <Progress value={generationProgress} className="mb-2" />
              {currentGenerating && (
                <p className="text-sm text-muted-foreground">
                  Currently generating: <span className="font-medium">{currentGenerating}</span>
                </p>
              )}
            </div>
          )}

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
