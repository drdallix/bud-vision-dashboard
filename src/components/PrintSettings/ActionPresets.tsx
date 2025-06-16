
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PrintConfig, OutputMode } from '@/types/printConfig';
import { Copy, Download, Printer } from 'lucide-react';

interface ActionPresetsProps {
  config: PrintConfig;
  onConfigChange: (updates: Partial<PrintConfig>) => void;
}

const ActionPresets = ({ config, onConfigChange }: ActionPresetsProps) => {
  const outputModeOptions: { value: OutputMode; label: string }[] = [
    { value: 'ascii-table', label: 'ASCII Table' },
    { value: 'plain-text', label: 'Plain Text' },
    { value: 'social-media', label: 'Social Media' },
    { value: 'json', label: 'JSON Data' }
  ];

  return (
    <div className="space-y-6">
      {/* Default Copy Action */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Default "Copy" Action
          </CardTitle>
          <CardDescription>Configure the default format when copying single strains</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Output Mode</Label>
            <Select 
              value={config.defaultCopyMode} 
              onValueChange={(value: OutputMode) => onConfigChange({ defaultCopyMode: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {outputModeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Default Export Action */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Default "Export" Action
          </CardTitle>
          <CardDescription>Configure the default format when exporting single strains</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Output Mode</Label>
            <Select 
              value={config.defaultExportMode} 
              onValueChange={(value: OutputMode) => onConfigChange({ defaultExportMode: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {outputModeOptions.filter(o => o.value !== 'social-media').map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Default Filename Template</Label>
            <Input
              value={config.defaultFilename}
              onChange={(e) => onConfigChange({ defaultFilename: e.target.value })}
              placeholder="{StrainName}-{Date}"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use {'{StrainName}'}, {'{Date}'}, {'{Time}'} as placeholders
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Print Menu Action */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            "Print Menu" Action Configuration
          </CardTitle>
          <CardDescription>Configure the full menu generation settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Menu Title</Label>
            <Input
              value={config.menuTitle}
              onChange={(e) => onConfigChange({ menuTitle: e.target.value })}
              placeholder="Today's Cannabis Menu"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Number of Columns</Label>
              <Select 
                value={config.menuColumns.toString()} 
                onValueChange={(value) => onConfigChange({ menuColumns: parseInt(value) as 2 | 3 })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Columns</SelectItem>
                  <SelectItem value="3">3 Columns</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Group Strains By</Label>
              <Select 
                value={config.groupBy} 
                onValueChange={(value: 'price' | 'type') => onConfigChange({ groupBy: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">Price Tier</SelectItem>
                  <SelectItem value="type">Strain Type</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label>Sort Strains By</Label>
            <Select 
              value={config.sortBy} 
              onValueChange={(value: any) => onConfigChange({ sortBy: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Menu Footer</Label>
            <Input
              value={config.menuFooter}
              onChange={(e) => onConfigChange({ menuFooter: e.target.value })}
              placeholder="All prices are per ounce. Taxes not included."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActionPresets;
