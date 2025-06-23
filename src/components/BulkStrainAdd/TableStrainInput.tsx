
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Zap } from 'lucide-react';

interface TableStrainInputProps {
  onStrainNamesUpdate: (names: string[]) => void;
  isGenerating: boolean;
  onStartGeneration: () => void;
}

const TableStrainInput = ({ onStrainNamesUpdate, isGenerating, onStartGeneration }: TableStrainInputProps) => {
  const [strainNames, setStrainNames] = useState<string[]>([]);
  const [newStrainName, setNewStrainName] = useState('');
  const [bulkText, setBulkText] = useState('');

  const addSingleStrain = () => {
    if (!newStrainName.trim()) return;
    
    const updated = [...strainNames, newStrainName.trim()];
    setStrainNames(updated);
    onStrainNamesUpdate(updated);
    setNewStrainName('');
  };

  const processBulkText = () => {
    if (!bulkText.trim()) return;

    const names = bulkText
      .split(/[\n,]+/)
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/[^\w\s-]/g, '').trim())
      .filter(line => line.length > 1);

    const updated = [...strainNames, ...names];
    setStrainNames(updated);
    onStrainNamesUpdate(updated);
    setBulkText('');
  };

  const removeStrain = (index: number) => {
    const updated = strainNames.filter((_, i) => i !== index);
    setStrainNames(updated);
    onStrainNamesUpdate(updated);
  };

  const clearAll = () => {
    setStrainNames([]);
    onStrainNamesUpdate([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addSingleStrain();
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter strain name..."
              value={newStrainName}
              onChange={(e) => setNewStrainName(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isGenerating}
            />
            <Button onClick={addSingleStrain} disabled={isGenerating || !newStrainName.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="relative">
            <Textarea
              placeholder="Or paste multiple strain names (one per line or comma-separated)..."
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              disabled={isGenerating}
              rows={4}
            />
            {bulkText.trim() && (
              <Button
                onClick={processBulkText}
                className="absolute bottom-2 right-2"
                size="sm"
                disabled={isGenerating}
              >
                Add All
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {strainNames.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Strain Queue ({strainNames.length})</h4>
              <div className="flex gap-2">
                <Button onClick={clearAll} variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
                <Button 
                  onClick={onStartGeneration} 
                  disabled={isGenerating || strainNames.length === 0}
                  className="flex items-center gap-2"
                >
                  <Zap className="h-4 w-4" />
                  Generate All
                </Button>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Strain Name</TableHead>
                    <TableHead className="w-20">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {strainNames.map((name, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{name}</TableCell>
                      <TableCell>
                        <Button
                          onClick={() => removeStrain(index)}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TableStrainInput;
