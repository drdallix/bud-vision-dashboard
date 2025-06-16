import { useState } from 'react';
import { Settings as SettingsIcon, Download, Upload, Trash2, RefreshCw, AlertTriangle, Printer } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Strain } from '@/types/strain';
import PrintManager from '@/components/PrintManager';

interface SettingsProps {
  scanHistory: Strain[];
  onDataRestore: (data: Strain[]) => void;
}

const Settings = ({ scanHistory, onDataRestore }: SettingsProps) => {
  const [loading, setLoading] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [isPrintManagerOpen, setIsPrintManagerOpen] = useState(false);

  const exportData = () => {
    try {
      const dataStr = JSON.stringify(scanHistory, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `cannabis-scans-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: "Data exported successfully",
        description: `Downloaded ${scanHistory.length} scan records.`,
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export failed",
        description: "Failed to export your data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (Array.isArray(data)) {
            onDataRestore(data);
            toast({
              title: "Data imported successfully",
              description: `Restored ${data.length} scan records.`,
            });
          } else {
            throw new Error('Invalid data format');
          }
        } catch (error) {
          toast({
            title: "Import failed",
            description: "Invalid file format. Please select a valid JSON export file.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  };

  const clearAllData = async () => {
    if (!user) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to delete all your scan data? This action cannot be undone.'
    );
    
    if (!confirmed) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('scans')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "All data cleared",
        description: "Your scan history has been permanently deleted.",
      });
      
      // Refresh the page to update the UI
      window.location.reload();
    } catch (error) {
      console.error('Error clearing data:', error);
      toast({
        title: "Error clearing data",
        description: "Failed to clear your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    window.location.reload();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Settings</h2>
        <p className="text-muted-foreground">Manage your account and data preferences</p>
      </div>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Export, import, or manage your scan history data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              onClick={exportData}
              variant="outline"
              className="flex items-center gap-2"
              disabled={scanHistory.length === 0}
            >
              <Download className="h-4 w-4" />
              Export Data
            </Button>
            
            <Button
              onClick={importData}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Import Data
            </Button>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              onClick={refreshData}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </Button>
            
            <Button
              onClick={clearAllData}
              variant="destructive"
              className="flex items-center gap-2"
              disabled={loading || scanHistory.length === 0}
            >
              <Trash2 className="h-4 w-4" />
              {loading ? 'Clearing...' : 'Clear All Data'}
            </Button>
          </div>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Data operations are permanent. Export your data regularly to prevent loss.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Print & Export Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Print & Export
          </CardTitle>
          <CardDescription>
            Configure print settings and export strain data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => setIsPrintManagerOpen(true)}
            variant="outline"
            className="flex items-center gap-2"
            disabled={scanHistory.length === 0}
          >
            <Printer className="h-4 w-4" />
            Manage Printing & Export
          </Button>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Your account details and statistics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Total Scans</label>
              <p className="text-sm">{scanHistory.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy & Security</CardTitle>
          <CardDescription>
            Manage your account privacy and security settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Your scan data is private and only visible to you unless you choose to make strains public through the inventory system.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <PrintManager
        open={isPrintManagerOpen}
        onOpenChange={setIsPrintManagerOpen}
        strains={scanHistory}
      />
    </div>
  );
};

export default Settings;
