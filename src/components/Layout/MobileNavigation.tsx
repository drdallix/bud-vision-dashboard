
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Scan, FileText, Eye, Heart } from 'lucide-react';

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MobileNavigation = ({ activeTab, onTabChange }: MobileNavigationProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 md:hidden">
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="grid w-full grid-cols-5 h-12">
          <TabsTrigger value="browse" className="flex flex-col items-center gap-1 h-full">
            <Search className="h-4 w-4" />
            <span className="text-xs">Browse</span>
          </TabsTrigger>
          <TabsTrigger value="scan" className="flex flex-col items-center gap-1 h-full">
            <Scan className="h-4 w-4" />
            <span className="text-xs">Scan</span>
          </TabsTrigger>
          <TabsTrigger value="swipe" className="flex flex-col items-center gap-1 h-full">
            <Heart className="h-4 w-4" />
            <span className="text-xs">Swipe</span>
          </TabsTrigger>
          <TabsTrigger value="details" className="flex flex-col items-center gap-1 h-full">
            <FileText className="h-4 w-4" />
            <span className="text-xs">Details</span>
          </TabsTrigger>
          <TabsTrigger value="showcase" className="flex flex-col items-center gap-1 h-full">
            <Eye className="h-4 w-4" />
            <span className="text-xs">Showcase</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default MobileNavigation;
