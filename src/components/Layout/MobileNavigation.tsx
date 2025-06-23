
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, FileText, Eye } from 'lucide-react';

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MobileNavigation = ({ activeTab, onTabChange }: MobileNavigationProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 md:hidden">
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="grid w-full grid-cols-4 h-12">
          <TabsTrigger value="browse" className="flex flex-col items-center gap-1 h-full">
            <Search className="h-4 w-4" />
            <span className="text-xs">Browse</span>
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex flex-col items-center gap-1 h-full">
            <Plus className="h-4 w-4" />
            <span className="text-xs">Bulk Add</span>
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
