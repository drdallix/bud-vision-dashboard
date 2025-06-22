
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Zap, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StrainAPIControlsProps {
  strainName: string;
  onGenerate: (params: any) => void;
  isGenerating: boolean;
  isAuthenticated: boolean;
  rateLimitInfo?: {
    remaining: number;
    resetTime: number;
  } | null;
}

const StrainAPIControls: React.FC<StrainAPIControlsProps> = ({
  strainName,
  onGenerate,
  isGenerating,
  isAuthenticated,
  rateLimitInfo
}) => {
  const [params, setParams] = useState({
    description: '',
    type: '',
    thc: '',
    cbd: '',
    effects: '',
    flavors: '',
    force: false
  });

  const handleGenerate = () => {
    const processedParams = {
      description: params.description || undefined,
      type: params.type || undefined,
      thc: params.thc ? parseInt(params.thc) : undefined,
      cbd: params.cbd ? parseInt(params.cbd) : undefined,
      effects: params.effects ? params.effects.split(',').map(e => e.trim()).filter(Boolean) : undefined,
      flavors: params.flavors ? params.flavors.split(',').map(f => f.trim()).filter(Boolean) : undefined,
      force: params.force
    };
    
    onGenerate(processedParams);
  };

  const getRemainingTimeString = () => {
    if (!rateLimitInfo) return '';
    const remaining = Math.ceil((rateLimitInfo.resetTime - Date.now()) / 1000 / 60);
    return `${remaining} minute${remaining !== 1 ? 's' : ''}`;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-green-600" />
          Strain API Generator
        </CardTitle>
        <CardDescription>
          Generate detailed strain information for "{strainName}" with custom parameters
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!isAuthenticated && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>
                  Rate limited to {rateLimitInfo?.remaining || 0} more requests.
                </span>
                {rateLimitInfo && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Resets in {getRemainingTimeString()}
                  </Badge>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Strain Type</Label>
            <Select value={params.type} onValueChange={(value) => setParams(p => ({ ...p, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="indica">Indica</SelectItem>
                <SelectItem value="sativa">Sativa</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="thc">THC %</Label>
              <Input
                id="thc"
                type="number"
                min="0"
                max="35"
                value={params.thc}
                onChange={(e) => setParams(p => ({ ...p, thc: e.target.value }))}
                placeholder="21"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cbd">CBD %</Label>
              <Input
                id="cbd"
                type="number"
                min="0"
                max="25"
                value={params.cbd}
                onChange={(e) => setParams(p => ({ ...p, cbd: e.target.value }))}
                placeholder="2"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description/Characteristics</Label>
          <Textarea
            id="description"
            value={params.description}
            onChange={(e) => setParams(p => ({ ...p, description: e.target.value }))}
            placeholder="Describe the strain's characteristics, growing conditions, or unique properties..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="effects">Effects (comma-separated)</Label>
            <Input
              id="effects"
              value={params.effects}
              onChange={(e) => setParams(p => ({ ...p, effects: e.target.value }))}
              placeholder="relaxed, euphoric, creative"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="flavors">Flavors (comma-separated)</Label>
            <Input
              id="flavors"
              value={params.flavors}
              onChange={(e) => setParams(p => ({ ...p, flavors: e.target.value }))}
              placeholder="citrus, pine, sweet"
            />
          </div>
        </div>

        <Separator />

        <Button 
          onClick={handleGenerate}
          disabled={isGenerating || (!isAuthenticated && rateLimitInfo?.remaining === 0)}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            </>
          ) : (
            'Generate Strain Profile'
          )}
        </Button>

        {!isAuthenticated && (
          <p className="text-sm text-muted-foreground text-center">
            Sign in for unlimited access and to save strains to your collection
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StrainAPIControls;
