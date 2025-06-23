
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Edit2, Trash2, Zap, Receipt } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ExtractedStrain } from '@/services/bulkStrainService';
import QuickPrintButton from '@/components/QuickPrintButton';
import { PrintConfig, defaultPrintConfig } from '@/types/printConfig';

interface BulkStrainTableProps {
  strains: ExtractedStrain[];
  onStrainsUpdate: (strains: ExtractedStrain[]) => void;
  onStartGeneration: () => void;
  isGenerating: boolean;
  updateInventory: boolean;
}

interface EditingStrain extends ExtractedStrain {
  index: number;
}

const BulkStrainTable = ({ 
  strains, 
  onStrainsUpdate, 
  onStartGeneration, 
  isGenerating,
  updateInventory 
}: BulkStrainTableProps) => {
  const [editingStrain, setEditingStrain] = useState<EditingStrain | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editType, setEditType] = useState<'indica' | 'sativa' | 'hybrid' | ''>('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [startCount, setStartCount] = useState('');
  const [endCount, setEndCount] = useState('');
  const { toast } = useToast();

  // Print configuration for receipt printer (narrow width)
  const receiptPrintConfig: PrintConfig = {
    ...defaultPrintConfig,
    menuWidth: 'narrow',
    menuColumns: 1,
    compactMode: true,
    includeDescription: false,
    includeTerpenes: false,
    includeEffects: false,
    includeFlavors: false,
    menuTitle: 'Inventory Count Sheet',
    menuFooter: `Start: ${startCount} | End: ${endCount}`,
    showHeader: true,
    showFooter: true
  };

  const handleEdit = (strain: ExtractedStrain, index: number) => {
    setEditingStrain({ ...strain, index });
    setEditName(strain.name);
    setEditPrice(strain.price?.toString() || '');
    setEditType(strain.type || '');
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingStrain || !editName.trim()) return;

    const updatedStrains = [...strains];
    updatedStrains[editingStrain.index] = {
      name: editName.trim(),
      ...(editPrice && { price: parseFloat(editPrice) }),
      ...(editType && { type: editType as 'indica' | 'sativa' | 'hybrid' })
    };

    onStrainsUpdate(updatedStrains);
    setIsEditDialogOpen(false);
    setEditingStrain(null);
    
    toast({
      title: "Strain Updated",
      description: `${editName} has been updated successfully.`,
    });
  };

  const handleDelete = (index: number) => {
    const strainName = strains[index].name;
    const updatedStrains = strains.filter((_, i) => i !== index);
    onStrainsUpdate(updatedStrains);
    
    toast({
      title: "Strain Removed",
      description: `${strainName} has been removed from the list.`,
    });
  };

  const handleClearAll = () => {
    onStrainsUpdate([]);
    toast({
      title: "List Cleared",
      description: "All strains have been removed from the list.",
    });
  };

  const generateReceiptPrint = () => {
    if (!startCount || !endCount) {
      toast({
        title: "Missing Information",
        description: "Please enter both start and end count numbers.",
        variant: "destructive",
      });
      return;
    }

    // Create mock strain objects for printing
    const mockStrains = strains.map(strain => ({
      id: `bulk-${strain.name}`,
      name: strain.name,
      type: strain.type || 'hybrid',
      thc: 20, // Default for receipt
      cbd: 1,
      effects: [],
      flavors: [],
      terpenes: {},
      medicalUses: [],
      description: '',
      imageUrl: '',
      confidence: 100,
      inStock: true,
      scannedAt: new Date().toISOString(),
      pricePoints: strain.price ? [{ 
        id: 'temp',
        strainId: 'temp',
        amount: '1oz',
        nowPrice: strain.price,
        wasPrice: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }] : []
    }));

    // Generate and download the receipt
    import('@/utils/outputGenerators').then(({ generateOutput, downloadText, formatFilename }) => {
      const output = generateOutput('full-menu', mockStrains[0], receiptPrintConfig, mockStrains);
      const filename = formatFilename('Inventory-Count-{Date}', 'inventory');
      downloadText(output, filename);
      
      toast({
        title: "Receipt Generated",
        description: "Inventory count sheet has been downloaded.",
      });
    });

    setIsPrintDialogOpen(false);
  };

  if (strains.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <Table2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No strains in the list yet.</p>
            <p className="text-sm">Use the other tabs to add strains to your bulk list.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Edit Strain List ({strains.length})</span>
          <div className="flex gap-2">
            <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Print Receipt
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Inventory Count Sheet</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="start-count">Start Count</Label>
                    <Input
                      id="start-count"
                      placeholder="e.g., 001"
                      value={startCount}
                      onChange={(e) => setStartCount(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-count">End Count</Label>
                    <Input
                      id="end-count"
                      placeholder="e.g., 025"
                      value={endCount}
                      onChange={(e) => setEndCount(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsPrintDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={generateReceiptPrint}>
                      Generate Receipt
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button onClick={handleClearAll} variant="outline" size="sm">
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
        </CardTitle>
      </CardHeader>
      <CardContent>
        {updateInventory && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> When generated, these strains will replace your current in-stock inventory.
            </p>
          </div>
        )}

        <div className="max-h-64 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Strain Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="w-24">Actions</TableHead>
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
                    <div className="flex gap-1">
                      <Button
                        onClick={() => handleEdit(strain, index)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(index)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Strain</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Strain Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter strain name"
                />
              </div>
              <div>
                <Label htmlFor="edit-price">Price (optional)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  placeholder="Enter price"
                />
              </div>
              <div>
                <Label htmlFor="edit-type">Type (optional)</Label>
                <select
                  id="edit-type"
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as any)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select type</option>
                  <option value="indica">Indica</option>
                  <option value="sativa">Sativa</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} disabled={!editName.trim()}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default BulkStrainTable;
