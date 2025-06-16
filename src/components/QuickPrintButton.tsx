
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Printer, Copy, Image, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Strain } from '@/types/strain';
import { PrintConfig } from '@/components/PrintSettings';
import { generateStrainText, generateStrainImage, downloadImage, copyToClipboard } from '@/utils/printGenerator';

interface QuickPrintButtonProps {
  strain: Strain;
  config: PrintConfig;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

const QuickPrintButton = ({ strain, config, variant = 'outline', size = 'sm' }: QuickPrintButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleTextExport = async () => {
    try {
      const text = generateStrainText(strain, config);
      const success = await copyToClipboard(text);
      
      if (success) {
        toast({
          title: "Copied to clipboard",
          description: `${strain.name} strain info copied as text.`,
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

  const handleImageExport = async () => {
    setIsGenerating(true);
    try {
      const imageDataUrl = await generateStrainImage(strain, config);
      const filename = `${strain.name.replace(/[^a-z0-9]/gi, '_')}_strain_info.png`;
      downloadImage(imageDataUrl, filename);
      
      toast({
        title: "Image downloaded",
        description: `${strain.name} strain info saved as PNG.`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not generate image export.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={isGenerating}>
          <Printer className="h-4 w-4" />
          {size !== 'sm' && <span className="ml-2">Print</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleTextExport}>
          <Copy className="h-4 w-4 mr-2" />
          Copy as Text
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleImageExport} disabled={isGenerating}>
          <Image className="h-4 w-4 mr-2" />
          {isGenerating ? 'Generating...' : 'Download as PNG'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default QuickPrintButton;
