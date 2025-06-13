
import { useState, useRef } from 'react';
import { Download, Upload, Database, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Strain {
  id: string;
  name: string;
  type: 'Indica' | 'Sativa' | 'Hybrid';
  thc: number;
  cbd: number;
  effects: string[];
  flavors: string[];
  medicalUses: string[];
  description: string;
  imageUrl: string;
  scannedAt: string;
  confidence: number;
}

interface DataManagerProps {
  scanHistory: Strain[];
  onDataRestore: (data: Strain[]) => void;
}

const DataManager = ({ scanHistory, onDataRestore }: DataManagerProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleExportData = async () => {
    if (scanHistory.length === 0) {
      toast({
        title: "No Data to Export",
        description: "You need to scan some strains first before exporting data.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    
    try {
      const exportData = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        totalScans: scanHistory.length,
        strains: scanHistory
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cannabis-strains-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      toast({
        title: "Data Exported Successfully",
        description: `Exported ${scanHistory.length} strain records to your downloads folder.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      toast({
        title: "Invalid File Type",
        description: "Please select a valid JSON backup file.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importData = JSON.parse(content);
        
        // Validate data structure
        if (!importData.strains || !Array.isArray(importData.strains)) {
          throw new Error("Invalid backup file structure");
        }
        
        // Validate strain objects
        const validStrains = importData.strains.filter((strain: any) => 
          strain.id && strain.name && strain.type && 
          typeof strain.thc === 'number' && typeof strain.cbd === 'number'
        );
        
        if (validStrains.length === 0) {
          throw new Error("No valid strain data found in backup file");
        }
        
        onDataRestore(validStrains);
        
        toast({
          title: "Data Restored Successfully",
          description: `Imported ${validStrains.length} strain records from backup.`,
        });
        
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Failed to parse backup file. Please ensure it's a valid Cannabis Strain Identifier backup.",
          variant: "destructive",
        });
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    
    reader.onerror = () => {
      toast({
        title: "File Read Error",
        description: "Failed to read the backup file. Please try again.",
        variant: "destructive",
      });
      setIsImporting(false);
    };
    
    reader.readAsText(file);
  };

  const getDataSummary = () => {
    if (scanHistory.length === 0) return null;
    
    const typeCount = scanHistory.reduce((acc, strain) => {
      acc[strain.type] = (acc[strain.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const avgThc = Math.round(scanHistory.reduce((sum, strain) => sum + strain.thc, 0) / scanHistory.length);
    const avgCbd = Math.round(scanHistory.reduce((sum, strain) => sum + strain.cbd, 0) / scanHistory.length * 10) / 10;
    
    return { typeCount, avgThc, avgCbd };
  };

  const summary = getDataSummary();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Backup and restore your cannabis strain identification data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Data Summary */}
          {summary && (
            <div className="bg-accent/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Current Data Summary
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Scans</p>
                  <p className="font-bold text-lg">{scanHistory.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Avg THC</p>
                  <p className="font-bold text-lg">{summary.avgThc}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Avg CBD</p>
                  <p className="font-bold text-lg">{summary.avgCbd}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Types</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Object.entries(summary.typeCount).map(([type, count]) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type}: {count}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Export Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Export Data</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Create a backup of all your scanned strain data. This includes strain information, 
                scan dates, and identification confidence scores.
              </p>
              <Button 
                onClick={handleExportData}
                disabled={isExporting || scanHistory.length === 0}
                className="w-full sm:w-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export Backup'}
              </Button>
            </div>

            {scanHistory.length === 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No strain data available to export. Scan some cannabis packages first!
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Import Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Import Data</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Restore your strain data from a previously exported backup file. 
                This will add the imported strains to your current collection.
              </p>
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isImporting ? 'Importing...' : 'Import Backup'}
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Backup Format:</strong> Data is exported in JSON format containing all strain information, 
                scan history, and metadata. Files are compatible across devices and app installations.
              </AlertDescription>
            </Alert>
          </div>

          {/* Data Privacy Notice */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium">Privacy & Data Security</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• All data is stored locally on your device</li>
              <li>• Backup files contain only strain identification data</li>
              <li>• No personal information or images are included in backups</li>
              <li>• You have full control over your data export and import</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataManager;
