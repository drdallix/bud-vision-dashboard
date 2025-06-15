
import { Menu, Scan, Database, Settings } from 'lucide-react';
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
          {user ? 'Inventory Scanner' : 'Menu Board'}
        </TabsTrigger>
        {user && (
          <TabsTrigger value="add" className="flex items-center gap-2">
            <Scan className="h-4 w-4" />
            Package Scanner
          </TabsTrigger>
        )}
        <TabsTrigger value="details" className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          Strain Information
        </TabsTrigger>
        {user && showSettings && (
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings & Data
          </TabsTrigger>
        )}
      </TabsList>
    </div>
  );
};

export default Navigation;
