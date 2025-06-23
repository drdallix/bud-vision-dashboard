
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import BulkOmnibar from '@/components/SmartOmnibar/BulkOmnibar';
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

  const handleStrainsExtracted = (strains: ExtractedStrain[]) => {
    setExtractedStrains(prev => [...prev, ...strains]);
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
      {/* Main Bulk Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-600" />
            Bulk Strain Addition
          </CardTitle>
          <CardDescription>
            Use text, voice, or image to add multiple strains at once. AI will extract strain names, prices, and types automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <BulkOmnibar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onStrainsExtracted={handleStrainsExtracted}
          />

          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>💬 Text:</strong> Type or paste strain lists with prices</p>
            <p><strong>🎤 Voice:</strong> Say strain names with prices (e.g., "Blue Dream twenty five dollars, OG Kush indica thirty")</p>
            <p><strong>📷 Camera:</strong> Take photos of menus, inventories, or strain lists</p>
          </div>
        </CardContent>
      </Card>

      {/* Strain List Management */}
      {extractedStrains.length > 0 && (
        <BulkStrainTable
          strains={extractedStrains}
          onStrainsUpdate={setExtractedStrains}
          onStartGeneration={handleStartBulkGeneration}
          isGenerating={isGenerating}
          updateInventory={updateInventory}
        />
      )}

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
