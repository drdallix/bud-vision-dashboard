
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Printer, Copy, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Strain } from '@/types/strain';
import { PrintConfig, defaultPrintConfig } from '@/types/printConfig';
import { generateOutput, copyToClipboard, downloadText, formatFilename } from '@/utils/outputGenerators';

interface QuickPrintButtonProps {
  strain: Strain;
  config?: PrintConfig;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  allStrains?: Strain[]; // For menu generation
}

const QuickPrintButton = ({ 
  strain, 
  config = defaultPrintConfig, 
  variant = 'outline', 
  size = 'sm',
  allStrains = []
}: QuickPrintButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      const output = generateOutput(config.defaultCopyMode, strain, config, allStrains);
      const success = await copyToClipboard(output);
      
      if (success) {
        toast({
          title: "Copied to clipboard",
          description: `${strain.name} copied as ${config.defaultCopyMode.replace('-', ' ')}.`,
        });
      } else {
        throw new Error('Clipboard access failed');
      }
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExport = async () => {
    setIsProcessing(true);
    try {
      const output = generateOutput(config.defaultExportMode, strain, config, allStrains);
      const filename = formatFilename(config.defaultFilename, strain.name);
      const extension = config.defaultExportMode === 'json' ? '.json' : '.txt';
      
      downloadText(output, `${filename}${extension}`);
      
      toast({
        title: "File downloaded",
        description: `${strain.name} exported as ${config.defaultExportMode.replace('-', ' ')}.`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not generate export file.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={isProcessing}>
          <Printer className="h-4 w-4" />
          {size !== 'sm' && <span className="ml-2">Print</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCopy}>
          <Copy className="h-4 w-4 mr-2" />
          Copy ({config.defaultCopyMode.replace('-', ' ')})
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExport} disabled={isProcessing}>
          <Download className="h-4 w-4 mr-2" />
          {isProcessing ? 'Exporting...' : `Export (${config.defaultExportMode.replace('-', ' ')})`}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default QuickPrintButton;
