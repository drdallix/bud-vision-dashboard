
import { Menu, Database, Scan, Sparkles } from 'lucide-react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in">
      <TabsList className="grid w-full grid-cols-4 h-12 bg-card border">
        <TabsTrigger 
          value="browse" 
          className="flex items-center gap-2 data-[state=active]:bg-green-500/10 data-[state=active]:text-green-700"
        >
          <Menu className="h-4 w-4" />
          <span className="hidden sm:inline">
            {user ? '📦 Inventory' : '📋 Menu'}
          </span>
        </TabsTrigger>
        <TabsTrigger 
          value="details" 
          disabled={activeTab !== 'details'}
          className="flex items-center gap-2 data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-700"
        >
          <Database className="h-4 w-4" />
          <span className="hidden sm:inline">🔬 Details</span>
        </TabsTrigger>
        <TabsTrigger 
          value="scan" 
          className="flex items-center gap-2 data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-700"
        >
          <Scan className="h-4 w-4" />
          <span className="hidden sm:inline">📱 Live Scan</span>
        </TabsTrigger>
        <TabsTrigger 
          value="showcase" 
          className="flex items-center gap-2 data-[state=active]:bg-orange-500/10 data-[state=active]:text-orange-700"
        >
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">✨ Showcase</span>
        </TabsTrigger>
      </TabsList>
    </div>
  );
};

export default Navigation;
