
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Printer } from 'lucide-react';
import { PrintConfig } from '@/types/printConfig';
import ActionPresets from './PrintSettings/ActionPresets';
import ContentSettings from './PrintSettings/ContentSettings';
import GeneralSettings from './PrintSettings/GeneralSettings';

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
          Print & Export Configuration
        </h3>
        <p className="text-muted-foreground">
          Configure your preferred output formats and menu settings
        </p>
      </div>

      <Tabs defaultValue="presets" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="presets">Action Presets</TabsTrigger>
          <TabsTrigger value="content">Content Settings</TabsTrigger>
          <TabsTrigger value="general">General Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="presets">
          <ActionPresets config={config} onConfigChange={updateConfig} />
        </TabsContent>
        
        <TabsContent value="content">
          <ContentSettings config={config} onConfigChange={updateConfig} />
        </TabsContent>
        
        <TabsContent value="general">
          <GeneralSettings config={config} onConfigChange={updateConfig} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PrintSettings;
export { defaultPrintConfig as defaultConfig } from '@/types/printConfig';
