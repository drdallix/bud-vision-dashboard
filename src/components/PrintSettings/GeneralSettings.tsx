import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PrintConfig } from '@/types/printConfig';
import { Layout, Type, Palette } from 'lucide-react';

interface GeneralSettingsProps {
  config: PrintConfig;
  onConfigChange: (updates: Partial<PrintConfig>) => void;
}

const GeneralSettings = ({ config, onConfigChange }: GeneralSettingsProps) => {
  return (
    <div className="space-y-6">
      {/* Layout Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Layout Settings
          </CardTitle>
          <CardDescription>Configure menu layout and structure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Menu Columns</Label>
              <Select 
                value={config.menuColumns.toString()} 
                onValueChange={(value) => onConfigChange({ menuColumns: parseInt(value) as 1 | 2 | 3 })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Column</SelectItem>
                  <SelectItem value="2">2 Columns</SelectItem>
                  <SelectItem value="3">3 Columns</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Menu Width</Label>
              <Select 
                value={config.menuWidth} 
                onValueChange={(value: 'narrow' | 'standard' | 'wide' | 'custom') => 
                  onConfigChange({ menuWidth: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="narrow">Narrow (34 chars)</SelectItem>
                  <SelectItem value="standard">Standard (60 chars)</SelectItem>
                  <SelectItem value="wide">Wide (80 chars)</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {config.menuWidth === 'custom' && (
            <div>
              <Label>Custom Width (characters)</Label>
              <Input
                type="number"
                value={config.customWidth}
                onChange={(e) => onConfigChange({ customWidth: parseInt(e.target.value) || 80 })}
                min={20}
                max={200}
              />
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Group By</Label>
              <Select 
                value={config.groupBy} 
                onValueChange={(value: 'price' | 'type' | 'none') => onConfigChange({ groupBy: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Grouping</SelectItem>
                  <SelectItem value="price">Price Tier</SelectItem>
                  <SelectItem value="type">Strain Type</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Sort By</Label>
              <Select 
                value={config.sortBy} 
                onValueChange={(value: any) => onConfigChange({ sortBy: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                  <SelectItem value="price-low">Price (Low to High)</SelectItem>
                  <SelectItem value="price-high">Price (High to Low)</SelectItem>
                  <SelectItem value="thc">THC Level</SelectItem>
                  <SelectItem value="recent">Recently Added</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Label>Compact Mode</Label>
            <Switch
              checked={config.compactMode}
              onCheckedChange={(checked) => onConfigChange({ compactMode: checked })}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Text & Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Text & Branding
          </CardTitle>
          <CardDescription>Customize menu text and branding</CardDescription>
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
          
          <div>
            <Label>Menu Footer</Label>
            <Textarea
              value={config.menuFooter}
              onChange={(e) => onConfigChange({ menuFooter: e.target.value })}
              placeholder="All prices are per ounce. Taxes not included."
              rows={2}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label>Show Header</Label>
            <Switch
              checked={config.showHeader}
              onCheckedChange={(checked) => onConfigChange({ showHeader: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label>Show Footer</Label>
            <Switch
              checked={config.showFooter}
              onCheckedChange={(checked) => onConfigChange({ showFooter: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label>Include Timestamp</Label>
            <Switch
              checked={config.includeTimestamp}
              onCheckedChange={(checked) => onConfigChange({ includeTimestamp: checked })}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Styling */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Styling
          </CardTitle>
          <CardDescription>Configure visual styling</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Table Style</Label>
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
                  <SelectItem value="double">Double Border</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Theme</Label>
              <Select 
                value={config.theme} 
                onValueChange={(value: 'light' | 'dark' | 'colorful') => onConfigChange({ theme: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="colorful">Colorful</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralSettings;
