
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Printer, Copy, Download, Settings, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Strain } from '@/types/strain';
import { PrintConfig, defaultPrintConfig } from '@/types/printConfig';
import PrintSettings from '@/components/PrintSettings';
import { generateOutput, copyToClipboard, downloadText, formatFilename } from '@/utils/outputGenerators';

interface ShowcasePrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filteredStrains: Strain[];
  filterSummary: {
    filterType: string;
    sortBy: string;
    selectedEffects: string[];
    selectedFlavors: string[];
    stockFilter: string;
    thcRange: [number, number];
  };
}

const ShowcasePrintDialog = ({ 
  open, 
  onOpenChange, 
  filteredStrains, 
  filterSummary 
}: ShowcasePrintDialogProps) => {
  const [config, setConfig] = useState<PrintConfig>(defaultPrintConfig);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const inStockStrains = filteredStrains.filter(s => s.inStock);

  const handleQuickCopy = async (strains: Strain[]) => {
    try {
      const text = generateOutput('full-menu', strains[0], config, strains);
      const success = await copyToClipboard(text);
      
      if (success) {
        toast({
          title: "Copied to clipboard",
          description: `Menu with ${strains.length} strains copied.`,
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
        description: "Could not generate menu.",
        variant: "destructive",
      });
    }
  };

  const handleQuickDownload = async (strains: Strain[]) => {
    setIsGenerating(true);
    try {
      const content = generateOutput(config.defaultExportMode, strains[0], config, strains);
      const filename = `showcase-menu-${new Date().toISOString().split('T')[0]}`;
      const extension = config.defaultExportMode === 'json' ? '.json' : '.txt';
      downloadText(content, `${filename}${extension}`);
      
      toast({
        title: "File downloaded",
        description: `Menu with ${strains.length} strains saved.`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not generate file export.",
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
            Print Showcase Menu
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="quick-print" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="quick-print">Quick Print</TabsTrigger>
            <TabsTrigger value="filter-info">Active Filters</TabsTrigger>
            <TabsTrigger value="settings">Print Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="quick-print" className="space-y-6">
            <div className="grid gap-4">
              {/* Filtered Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Filtered Results ({filteredStrains.length})</span>
                    <Badge variant="outline">{filteredStrains.length} strains</Badge>
                  </CardTitle>
                  <CardDescription>
                    Print menu with currently applied showcase filters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleQuickCopy(filteredStrains)}
                      variant="outline"
                      className="flex-1"
                      disabled={filteredStrains.length === 0}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Menu
                    </Button>
                    <Button
                      onClick={() => handleQuickDownload(filteredStrains)}
                      variant="outline"
                      className="flex-1"
                      disabled={filteredStrains.length === 0 || isGenerating}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {isGenerating ? 'Generating...' : 'Download Menu'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* In Stock Only */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>In Stock Only ({inStockStrains.length})</span>
                    <Badge variant="secondary">{inStockStrains.length} available</Badge>
                  </CardTitle>
                  <CardDescription>
                    Print menu with only in-stock strains from current filters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleQuickCopy(inStockStrains)}
                      variant="outline"
                      className="flex-1"
                      disabled={inStockStrains.length === 0}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Menu
                    </Button>
                    <Button
                      onClick={() => handleQuickDownload(inStockStrains)}
                      variant="outline"
                      className="flex-1"
                      disabled={inStockStrains.length === 0 || isGenerating}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {isGenerating ? 'Generating...' : 'Download Menu'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Current Configuration Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Current Print Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Columns</p>
                      <Badge variant="outline">{config.menuColumns}</Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Width</p>
                      <Badge variant="outline">{config.menuWidth}</Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Group By</p>
                      <Badge variant="outline">{config.groupBy}</Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Sort By</p>
                      <Badge variant="outline">{config.sortBy}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="filter-info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Active Showcase Filters
                </CardTitle>
                <CardDescription>
                  These filters are currently applied to the showcase and will be reflected in the printed menu
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Basic Filters</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <Badge variant="outline">{filterSummary.filterType}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sort:</span>
                        <Badge variant="outline">{filterSummary.sortBy}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stock:</span>
                        <Badge variant="outline">{filterSummary.stockFilter}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">THC Range:</span>
                        <Badge variant="outline">
                          {filterSummary.thcRange[0]}%-{filterSummary.thcRange[1]}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Profile Filters</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Effects ({filterSummary.selectedEffects.length}):</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {filterSummary.selectedEffects.length > 0 ? (
                            filterSummary.selectedEffects.map(effect => (
                              <Badge key={effect} variant="secondary" className="text-xs">
                                {effect}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-xs">None selected</span>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">Flavors ({filterSummary.selectedFlavors.length}):</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {filterSummary.selectedFlavors.length > 0 ? (
                            filterSummary.selectedFlavors.map(flavor => (
                              <Badge key={flavor} variant="secondary" className="text-xs">
                                {flavor}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-xs">None selected</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total Results:</span>
                    <div className="flex gap-2">
                      <Badge variant="outline">{filteredStrains.length} strains</Badge>
                      <Badge variant="secondary">{inStockStrains.length} in stock</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <PrintSettings config={config} onConfigChange={setConfig} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ShowcasePrintDialog;
