
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Printer, Copy, Image, Download, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Strain } from '@/types/strain';
import { PrintConfig, defaultPrintConfig } from '@/types/printConfig';
import PrintSettings from '@/components/PrintSettings';
import { generateOutput, copyToClipboard, downloadText, formatFilename } from '@/utils/outputGenerators';

interface PrintManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  strains: Strain[];
}

const PrintManager = ({ open, onOpenChange, strains }: PrintManagerProps) => {
  const [config, setConfig] = useState<PrintConfig>(defaultPrintConfig);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Filter in-stock strains
  const inStockStrains = strains.filter(s => s.inStock);
  const allStrains = strains;

  const handleBulkTextExport = async (strainsToExport: Strain[]) => {
    try {
      // Generate full menu for multiple strains
      const text = generateOutput('full-menu', strainsToExport[0], config, strainsToExport);
      const success = await copyToClipboard(text);
      
      if (success) {
        toast({
          title: "Copied to clipboard",
          description: `${strainsToExport.length} strains copied as menu.`,
        });
      } else {
        toast({
          title: "Copy failed",
          description: "Could not copy to clipboard. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not generate text export.",
        variant: "destructive",
      });
    }
  };

  const handleBulkImageExport = async (strainsToExport: Strain[]) => {
    setIsGenerating(true);
    try {
      // Generate individual exports for each strain using default export mode
      const exportPromises = strainsToExport.map(async (strain, index) => {
        const content = generateOutput(config.defaultExportMode, strain, config);
        const filename = formatFilename(config.defaultFilename, strain.name);
        const extension = config.defaultExportMode === 'json' ? '.json' : '.txt';
        downloadText(content, `${filename}${extension}`);
        
        // Small delay between downloads to avoid overwhelming the browser
        if (index < strainsToExport.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      });
      
      await Promise.all(exportPromises);
      
      toast({
        title: "Files downloaded",
        description: `${strainsToExport.length} strain files saved.`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not generate file exports.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Print & Export Manager
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="bulk-export" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bulk-export">Bulk Export</TabsTrigger>
            <TabsTrigger value="settings">Print Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bulk-export" className="space-y-6">
            <div className="grid gap-4">
              {/* All Strains Export */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>All Strains ({allStrains.length})</span>
                    <Badge variant="outline">{allStrains.length} total</Badge>
                  </CardTitle>
                  <CardDescription>
                    Export your complete strain collection
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleBulkTextExport(allStrains)}
                      variant="outline"
                      className="flex-1"
                      disabled={allStrains.length === 0}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy as Menu
                    </Button>
                    <Button
                      onClick={() => handleBulkImageExport(allStrains)}
                      variant="outline"
                      className="flex-1"
                      disabled={allStrains.length === 0 || isGenerating}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {isGenerating ? 'Generating...' : 'Download Individual Files'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* In Stock Only Export */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>In Stock Only ({inStockStrains.length})</span>
                    <Badge variant="secondary">{inStockStrains.length} available</Badge>
                  </CardTitle>
                  <CardDescription>
                    Export only strains currently in stock
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleBulkTextExport(inStockStrains)}
                      variant="outline"
                      className="flex-1"
                      disabled={inStockStrains.length === 0}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy as Menu
                    </Button>
                    <Button
                      onClick={() => handleBulkImageExport(inStockStrains)}
                      variant="outline"
                      className="flex-1"
                      disabled={inStockStrains.length === 0 || isGenerating}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {isGenerating ? 'Generating...' : 'Download Individual Files'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Current Configuration Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Current Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Copy Mode</p>
                      <Badge variant="outline">{config.defaultCopyMode.replace('-', ' ').toUpperCase()}</Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Export Mode</p>
                      <Badge variant="outline">{config.defaultExportMode.replace('-', ' ').toUpperCase()}</Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Menu Columns</p>
                      <Badge variant="outline">{config.menuColumns}</Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Theme</p>
                      <Badge variant={config.theme === 'dark' ? "default" : "secondary"}>
                        {config.theme}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <PrintSettings config={config} onConfigChange={setConfig} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PrintManager;
