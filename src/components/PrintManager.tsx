
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Printer, Copy, Image, Download, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Strain } from '@/types/strain';
import PrintSettings, { PrintConfig, defaultConfig } from '@/components/PrintSettings';
import { generateBulkText, generateStrainText, generateStrainImage, downloadImage, copyToClipboard } from '@/utils/printGenerator';

interface PrintManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  strains: Strain[];
}

const PrintManager = ({ open, onOpenChange, strains }: PrintManagerProps) => {
  const [config, setConfig] = useState<PrintConfig>(defaultConfig);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Filter in-stock strains
  const inStockStrains = strains.filter(s => s.inStock);
  const allStrains = strains;

  const handleBulkTextExport = async (strainsToExport: Strain[]) => {
    try {
      const text = generateBulkText(strainsToExport, config);
      const success = await copyToClipboard(text);
      
      if (success) {
        toast({
          title: "Copied to clipboard",
          description: `${strainsToExport.length} strains copied as text.`,
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
      // Generate individual images for each strain
      const imagePromises = strainsToExport.map(async (strain, index) => {
        const imageDataUrl = await generateStrainImage(strain, config);
        const filename = `${strain.name.replace(/[^a-z0-9]/gi, '_')}_strain_info.png`;
        downloadImage(imageDataUrl, filename);
        
        // Small delay between downloads to avoid overwhelming the browser
        if (index < strainsToExport.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      });
      
      await Promise.all(imagePromises);
      
      toast({
        title: "Images downloaded",
        description: `${strainsToExport.length} strain images saved as PNG files.`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not generate image exports.",
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
                      Copy as Text
                    </Button>
                    <Button
                      onClick={() => handleBulkImageExport(allStrains)}
                      variant="outline"
                      className="flex-1"
                      disabled={allStrains.length === 0 || isGenerating}
                    >
                      <Image className="h-4 w-4 mr-2" />
                      {isGenerating ? 'Generating...' : 'Download as Images'}
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
                      Copy as Text
                    </Button>
                    <Button
                      onClick={() => handleBulkImageExport(inStockStrains)}
                      variant="outline"
                      className="flex-1"
                      disabled={inStockStrains.length === 0 || isGenerating}
                    >
                      <Image className="h-4 w-4 mr-2" />
                      {isGenerating ? 'Generating...' : 'Download as Images'}
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
                      <p className="text-muted-foreground">Format</p>
                      <Badge variant="outline">{config.format.toUpperCase()}</Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Width</p>
                      <Badge variant="outline">{config.receiptWidth} chars</Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Effects</p>
                      <Badge variant={config.includeEffects ? "default" : "secondary"}>
                        {config.includeEffects ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Compact</p>
                      <Badge variant={config.compactMode ? "default" : "secondary"}>
                        {config.compactMode ? "Yes" : "No"}
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
