
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Zap } from 'lucide-react';
import { ExtractedStrain } from '@/services/bulkStrainService';

interface TableStrainInputProps {
  onStrainNamesUpdate: (strains: ExtractedStrain[]) => void;
  isGenerating: boolean;
  onStartGeneration: () => void;
}

const TableStrainInput = ({ onStrainNamesUpdate, isGenerating, onStartGeneration }: TableStrainInputProps) => {
  const [strains, setStrains] = useState<ExtractedStrain[]>([]);
  const [newStrainName, setNewStrainName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newType, setNewType] = useState<'indica' | 'sativa' | 'hybrid' | ''>('');
  const [bulkText, setBulkText] = useState('');

  const addSingleStrain = () => {
    if (!newStrainName.trim()) return;
    
    const strain: ExtractedStrain = {
      name: newStrainName.trim(),
      ...(newPrice && { price: parseFloat(newPrice) }),
      ...(newType && { type: newType as 'indica' | 'sativa' | 'hybrid' })
    };

    const updated = [...strains, strain];
    setStrains(updated);
    onStrainNamesUpdate(updated);
    setNewStrainName('');
    setNewPrice('');
    setNewType('');
  };

  const processBulkText = () => {
    if (!bulkText.trim()) return;

    const lines = bulkText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const newStrains: ExtractedStrain[] = lines.map(line => {
      // Try to parse format like "Strain Name - $25 - Indica"
      const parts = line.split(/[-,|]/);
      const name = parts[0]?.trim().replace(/[^\w\s-]/g, '').trim();
      
      let price: number | undefined;
      let type: 'indica' | 'sativa' | 'hybrid' | undefined;

      for (let i = 1; i < parts.length; i++) {
        const part = parts[i]?.trim().toLowerCase();
        if (part?.includes('$') || part?.match(/\d+/)) {
          const priceMatch = part.match(/\d+(\.\d+)?/);
          if (priceMatch) {
            price = parseFloat(priceMatch[0]);
          }
        }
        if (part?.includes('indica')) type = 'indica';
        else if (part?.includes('sativa')) type = 'sativa';
        else if (part?.includes('hybrid')) type = 'hybrid';
      }

      return {
        name: name || line.trim(),
        ...(price && { price }),
        ...(type && { type })
      };
    }).filter(strain => strain.name.length > 1);

    const updated = [...strains, ...newStrains];
    setStrains(updated);
    onStrainNamesUpdate(updated);
    setBulkText('');
  };

  const removeStrain = (index: number) => {
    const updated = strains.filter((_, i) => i !== index);
    setStrains(updated);
    onStrainNamesUpdate(updated);
  };

  const clearAll = () => {
    setStrains([]);
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <Input
              placeholder="Strain name..."
              value={newStrainName}
              onChange={(e) => setNewStrainName(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isGenerating}
              className="md:col-span-2"
            />
            <Input
              placeholder="Price (optional)"
              type="number"
              step="0.01"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              disabled={isGenerating}
            />
            <div className="flex gap-2">
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                disabled={isGenerating}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Type (optional)</option>
                <option value="indica">Indica</option>
                <option value="sativa">Sativa</option>
                <option value="hybrid">Hybrid</option>
              </select>
              <Button onClick={addSingleStrain} disabled={isGenerating || !newStrainName.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="relative">
            <Textarea
              placeholder="Or paste multiple strains (one per line). Format: Strain Name - $25 - Indica"
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

      {strains.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Strain Queue ({strains.length})</h4>
              <div className="flex gap-2">
                <Button onClick={clearAll} variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
                <Button 
                  onClick={onStartGeneration} 
                  disabled={isGenerating || strains.length === 0}
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
                    <TableHead>Price</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="w-20">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {strains.map((strain, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{strain.name}</TableCell>
                      <TableCell>
                        {strain.price ? (
                          <Badge variant="outline" className="text-green-600">
                            ${strain.price}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {strain.type ? (
                          <Badge variant="secondary">{strain.type}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
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
