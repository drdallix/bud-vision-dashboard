
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Mic, Camera, Table2, Plus } from 'lucide-react';
import SmartOmnibar from '@/components/SmartOmnibar';
import VoiceStrainInput from './VoiceStrainInput';
import ImageStrainInput from './ImageStrainInput';
import TableStrainInput from './TableStrainInput';
import BulkGenerationProgress from './BulkGenerationProgress';
import BulkStrainTable from './BulkStrainTable';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [updateInventory, setUpdateInventory] = useState(false);

  const handleStrainNamesUpdate = (strains: ExtractedStrain[]) => {
    setExtractedStrains(strains);
  };

  const handleOmnibarStrain = (strain: Strain) => {
    // Convert generated strain to extracted strain format
    const extractedStrain: ExtractedStrain = {
      name: strain.name,
      type: strain.type,
      // Extract price from strain if available
      price: strain.pricePoints?.[0]?.nowPrice
    };
    setExtractedStrains(prev => [...prev, extractedStrain]);
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
      {/* Familiar Omnibar Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-600" />
            Quick Add Individual Strain
          </CardTitle>
          <CardDescription>
            Use the familiar interface to add individual strains to your bulk list
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SmartOmnibar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onStrainGenerated={handleOmnibarStrain}
            hasResults={false}
          />
        </CardContent>
      </Card>

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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
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

            <div className="flex items-center space-x-2">
              <Switch 
                id="update-inventory" 
                checked={updateInventory}
                onCheckedChange={setUpdateInventory}
              />
              <Label htmlFor="update-inventory" className="text-sm">
                Set as current in-stock inventory
              </Label>
            </div>
          </div>

          <Tabs defaultValue="table" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="table" className="flex items-center gap-2">
                <Table2 className="h-4 w-4" />
                Table
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Voice
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Image
              </TabsTrigger>
              <TabsTrigger value="edit" className="flex items-center gap-2">
                <Table2 className="h-4 w-4" />
                Edit List
              </TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="space-y-4">
              <TableStrainInput 
                onStrainNamesUpdate={handleStrainNamesUpdate}
                isGenerating={isGenerating}
                onStartGeneration={handleStartBulkGeneration}
              />
            </TabsContent>

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

            <TabsContent value="edit" className="space-y-4">
              <BulkStrainTable
                strains={extractedStrains}
                onStrainsUpdate={setExtractedStrains}
                onStartGeneration={handleStartBulkGeneration}
                isGenerating={isGenerating}
                updateInventory={updateInventory}
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
