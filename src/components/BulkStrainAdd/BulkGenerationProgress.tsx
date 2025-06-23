
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Zap } from 'lucide-react';
import { Strain } from '@/types/strain';

interface BulkGenerationProgressProps {
  strainNames: string[];
  currentGenerating: string;
  generatedStrains: Strain[];
  progress: number;
}

const BulkGenerationProgress = ({
  strainNames,
  currentGenerating,
  generatedStrains,
  progress
}: BulkGenerationProgressProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-green-600" />
          Bulk Generation Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm text-muted-foreground">
            {generatedStrains.length} of {strainNames.length} complete
          </span>
        </div>
        
        <Progress value={progress} className="h-3" />

        {currentGenerating && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600" />
            <span className="text-sm font-medium">Generating: {currentGenerating}</span>
          </div>
        )}

        <div className="grid gap-2 max-h-48 overflow-y-auto">
          {strainNames.map((name, index) => {
            const isGenerated = generatedStrains.some(strain => strain.name === name);
            const isCurrent = currentGenerating === name;
            
            return (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg border">
                <span className="text-sm">{name}</span>
                <div className="flex items-center gap-2">
                  {isGenerated ? (
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Complete
                    </Badge>
                  ) : isCurrent ? (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                      Generating
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Queued
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkGenerationProgress;
