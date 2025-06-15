
import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import UserNav from '@/components/UserNav';

interface HeaderProps {
  onSettingsClick: () => void;
}

const Header = ({ onSettingsClick }: HeaderProps) => {
  const { user } = useAuth();

  return (
    <div className="flex justify-between items-start mb-6">
      <div className="text-center flex-1">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-2">
          DoobieDB
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {user 
            ? "Professional cannabis knowledge database - scan any package for instant strain information and customer recommendations" 
            : "Interactive dispensary menu board - explore today's available cannabis strains and products"
          }
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        {user ? (
          <UserNav onSettingsClick={onSettingsClick} />
        ) : (
          <Link to="/auth">
            <Button variant="outline" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Budtender Access
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Header;
