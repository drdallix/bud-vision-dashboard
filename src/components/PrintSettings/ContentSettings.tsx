
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PrintConfig } from '@/types/printConfig';
import { Settings } from 'lucide-react';

interface ContentSettingsProps {
  config: PrintConfig;
  onConfigChange: (updates: Partial<PrintConfig>) => void;
}

const ContentSettings = ({ config, onConfigChange }: ContentSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Content Settings
        </CardTitle>
        <CardDescription>Choose what information to include in outputs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center justify-between">
            <Label>THC Information</Label>
            <Switch
              checked={config.includeThc}
              onCheckedChange={(checked) => onConfigChange({ includeThc: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label>Effects</Label>
            <Switch
              checked={config.includeEffects}
              onCheckedChange={(checked) => onConfigChange({ includeEffects: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label>Flavors</Label>
            <Switch
              checked={config.includeFlavors}
              onCheckedChange={(checked) => onConfigChange({ includeFlavors: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label>Terpenes</Label>
            <Switch
              checked={config.includeTerpenes}
              onCheckedChange={(checked) => onConfigChange({ includeTerpenes: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label>Description</Label>
            <Switch
              checked={config.includeDescription}
              onCheckedChange={(checked) => onConfigChange({  includeDescription: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label>Pricing Information</Label>
            <Switch
              checked={config.includePricing}
              onCheckedChange={(checked) => onConfigChange({ includePricing: checked })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentSettings;
