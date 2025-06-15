
import { Menu, Database } from 'lucide-react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';

interface NavigationProps {
  showSettings: boolean;
}

const Navigation = ({ showSettings }: NavigationProps) => {
  const { user } = useAuth();

  return (
    <div className="hidden md:block">
      <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:mx-auto">
        <TabsTrigger value="browse" className="flex items-center gap-2">
          <Menu className="h-4 w-4" />
          {user ? 'Smart Inventory Scanner' : 'Menu Board'}
        </TabsTrigger>
        <TabsTrigger value="details" className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          Strain Information
        </TabsTrigger>
        <TabsTrigger value="showcase" className="flex items-center gap-2">
          <span className="h-4 w-4 text-green-600">🎬</span>
          Live Showcase
        </TabsTrigger>
        {user && showSettings && (
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <span className="h-4 w-4">⚙️</span>
            Settings & Data
          </TabsTrigger>
        )}
      </TabsList>
    </div>
  );
};

export default Navigation;
