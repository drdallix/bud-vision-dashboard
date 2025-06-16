
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { PrintConfig } from '@/types/printConfig';
import { Palette } from 'lucide-react';

interface GeneralSettingsProps {
  config: PrintConfig;
  onConfigChange: (updates: Partial<PrintConfig>) => void;
}

const GeneralSettings = ({ config, onConfigChange }: GeneralSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          General Settings
        </CardTitle>
        <CardDescription>Configure overall appearance and behavior</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>ASCII Table Style</Label>
            <Select 
              value={config.asciiTableStyle} 
              onValueChange={(value: any) => onConfigChange({ asciiTableStyle: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">Simple</SelectItem>
                <SelectItem value="bordered">Bordered</SelectItem>
                <SelectItem value="double">Double Line</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Theme</Label>
            <Select 
              value={config.theme} 
              onValueChange={(value: 'light' | 'dark') => onConfigChange({ theme: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light Mode</SelectItem>
                <SelectItem value="dark">Dark Mode</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneralSettings;
