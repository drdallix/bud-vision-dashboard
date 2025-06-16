
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Printer, Settings, Image, Copy } from 'lucide-react';

export interface PrintConfig {
  // Output format
  format: 'text' | 'image';
  
  // Receipt printer settings
  receiptWidth: number; // characters per line
  fontSize: number;
  
  // Content options
  includeEffects: boolean;
  includeFlavors: boolean;
  includeTerpenes: boolean;
  includeDescription: boolean;
  includePricing: boolean;
  includeQRCode: boolean;
  
  // Layout options
  compactMode: boolean;
  showEmojis: boolean;
  
  // Image settings (for PNG output)
  imageWidth: number;
  backgroundColor: string;
  textColor: string;
}

const defaultConfig: PrintConfig = {
  format: 'text',
  receiptWidth: 48,
  fontSize: 12,
  includeEffects: true,
  includeFlavors: true,
  includeTerpenes: false,
  includeDescription: true,
  includePricing: true,
  includeQRCode: false,
  compactMode: false,
  showEmojis: true,
  imageWidth: 800,
  backgroundColor: '#ffffff',
  textColor: '#000000'
};

interface PrintSettingsProps {
  config: PrintConfig;
  onConfigChange: (config: PrintConfig) => void;
}

const PrintSettings = ({ config, onConfigChange }: PrintSettingsProps) => {
  const updateConfig = (updates: Partial<PrintConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Printer className="h-6 w-6" />
          Print Configuration
        </h3>
        <p className="text-muted-foreground">
          Configure how strain information is formatted for printing and sharing
        </p>
      </div>

      {/* Output Format */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Output Format
          </CardTitle>
          <CardDescription>Choose how to export strain information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={config.format === 'text' ? 'default' : 'outline'}
              onClick={() => updateConfig({ format: 'text' })}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Text/Clipboard
            </Button>
            <Button
              variant={config.format === 'image' ? 'default' : 'outline'}
              onClick={() => updateConfig({ format: 'image' })}
              className="flex items-center gap-2"
            >
              <Image className="h-4 w-4" />
              PNG Image
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Receipt Printer Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Receipt Printer Settings</CardTitle>
          <CardDescription>Configure for thermal receipt printers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Characters per line: {config.receiptWidth}</Label>
            <Slider
              value={[config.receiptWidth]}
              onValueChange={(value) => updateConfig({ receiptWidth: value[0] })}
              min={24}
              max={80}
              step={4}
              className="mt-2"
            />
          </div>
          
          <div>
            <Label>Font size: {config.fontSize}px</Label>
            <Slider
              value={[config.fontSize]}
              onValueChange={(value) => updateConfig({ fontSize: value[0] })}
              min={8}
              max={20}
              step={1}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Content Options */}
      <Card>
        <CardHeader>
          <CardTitle>Content Options</CardTitle>
          <CardDescription>Select what information to include</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between">
              <Label>Effects</Label>
              <Switch
                checked={config.includeEffects}
                onCheckedChange={(checked) => updateConfig({ includeEffects: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Flavors</Label>
              <Switch
                checked={config.includeFlavors}
                onCheckedChange={(checked) => updateConfig({ includeFlavors: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Terpenes</Label>
              <Switch
                checked={config.includeTerpenes}
                onCheckedChange={(checked) => updateConfig({ includeTerpenes: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Description</Label>
              <Switch
                checked={config.includeDescription}
                onCheckedChange={(checked) => updateConfig({ includeDescription: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Pricing</Label>
              <Switch
                checked={config.includePricing}
                onCheckedChange={(checked) => updateConfig({ includePricing: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>QR Code (for URLs)</Label>
              <Switch
                checked={config.includeQRCode}
                onCheckedChange={(checked) => updateConfig({ includeQRCode: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout Options */}
      <Card>
        <CardHeader>
          <CardTitle>Layout Options</CardTitle>
          <CardDescription>Customize the appearance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Compact mode</Label>
            <Switch
              checked={config.compactMode}
              onCheckedChange={(checked) => updateConfig({ compactMode: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label>Show emojis</Label>
            <Switch
              checked={config.showEmojis}
              onCheckedChange={(checked) => updateConfig({ showEmojis: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Image Settings (only show if format is image) */}
      {config.format === 'image' && (
        <Card>
          <CardHeader>
            <CardTitle>Image Settings</CardTitle>
            <CardDescription>Configure PNG export options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Image width: {config.imageWidth}px</Label>
              <Slider
                value={[config.imageWidth]}
                onValueChange={(value) => updateConfig({ imageWidth: value[0] })}
                min={400}
                max={1200}
                step={50}
                className="mt-2"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Background</Label>
                <Select 
                  value={config.backgroundColor} 
                  onValueChange={(value) => updateConfig({ backgroundColor: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="#ffffff">White</SelectItem>
                    <SelectItem value="#000000">Black</SelectItem>
                    <SelectItem value="#1a1a1a">Dark Gray</SelectItem>
                    <SelectItem value="#22c55e">Green</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Text Color</Label>
                <Select 
                  value={config.textColor} 
                  onValueChange={(value) => updateConfig({ textColor: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="#000000">Black</SelectItem>
                    <SelectItem value="#ffffff">White</SelectItem>
                    <SelectItem value="#64748b">Gray</SelectItem>
                    <SelectItem value="#22c55e">Green</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PrintSettings;
export { defaultConfig };
