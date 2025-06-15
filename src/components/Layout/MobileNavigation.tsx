
import { Menu, Scan, Database } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MobileNavigation = ({ activeTab, onTabChange }: MobileNavigationProps) => {
  const { user } = useAuth();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border">
      <div className="grid grid-cols-3 h-16">
        <button
          onClick={() => onTabChange('browse')}
          className={`flex flex-col items-center justify-center gap-1 text-xs transition-colors ${
            activeTab === 'browse' 
              ? 'text-green-600 bg-green-50' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Menu className="h-5 w-5" />
          <span>{user ? 'Inventory' : 'Menu'}</span>
        </button>

        {user && (
          <button
            onClick={() => onTabChange('add')}
            className={`flex flex-col items-center justify-center gap-1 text-xs transition-colors ${
              activeTab === 'add' 
                ? 'text-green-600 bg-green-50' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Scan className="h-5 w-5" />
            <span>Scanner</span>
          </button>
        )}

        <button
          onClick={() => onTabChange('details')}
          className={`flex flex-col items-center justify-center gap-1 text-xs transition-colors ${
            activeTab === 'details' 
              ? 'text-green-600 bg-green-50' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Database className="h-5 w-5" />
          <span>Info</span>
        </button>
      </div>
    </div>
  );
};

export default MobileNavigation;
