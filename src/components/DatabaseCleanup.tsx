import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, Trash2, CheckCircle2, AlertTriangle, Loader2, Database } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Strain } from '@/types/strain';

interface DuplicateGroup {
  name: string;
  strains: Strain[];
  similarity: number;
}

const DatabaseCleanup = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [selectedForDeletion, setSelectedForDeletion] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const calculateSimilarity = (strain1: Strain, strain2: Strain): number => {
    let score = 0;
    let factors = 0;

    // Name similarity (most important)
    const name1 = strain1.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const name2 = strain2.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (name1 === name2) score += 40;
    else if (name1.includes(name2) || name2.includes(name1)) score += 30;
    else if (name1.substring(0, 3) === name2.substring(0, 3)) score += 15;
    factors += 40;

    // Type similarity
    if (strain1.type === strain2.type) score += 20;
    factors += 20;

    // THC similarity
    if (strain1.thc && strain2.thc) {
      const thcDiff = Math.abs(strain1.thc - strain2.thc);
      if (thcDiff <= 2) score += 15;
      else if (thcDiff <= 5) score += 10;
      factors += 15;
    }

    // CBD similarity
    if (strain1.cbd && strain2.cbd) {
      const cbdDiff = Math.abs(strain1.cbd - strain2.cbd);
      if (cbdDiff <= 1) score += 10;
      factors += 10;
    }

    // Effects similarity
    const effects1 = strain1.effectProfiles?.map(e => e.name.toLowerCase()) || [];
    const effects2 = strain2.effectProfiles?.map(e => e.name.toLowerCase()) || [];
    const effectsMatch = effects1.filter(e => effects2.includes(e)).length;
    if (effectsMatch > 0) score += Math.min(effectsMatch * 3, 15);
    factors += 15;

    return Math.round((score / factors) * 100);
  };

  const scanForDuplicates = async () => {
    if (!user) return;

    setIsScanning(true);
    setScanProgress(0);
    setDuplicates([]);
    setScanComplete(false);

    try {
      // Fetch all user strains
      const { data: strains, error } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Convert to proper type mapping
      const typeMapping: { [key: string]: 'Indica' | 'Sativa' | 'Hybrid' } = {
        indica: 'Indica',
        sativa: 'Sativa', 
        hybrid: 'Hybrid'
      };

      const convertedStrains: Strain[] = strains.map(scan => ({
        id: scan.id,
        name: scan.strain_name,
        type: typeMapping[scan.strain_type.toLowerCase()] || 'Hybrid',
        thc: scan.thc || 0,
        cbd: scan.cbd || 0,
        effectProfiles: Array.isArray(scan.effects) 
          ? scan.effects.map((effect: any) => ({ name: effect, intensity: 5, emoji: '🌿', color: '#10b981' }))
          : [],
        flavorProfiles: Array.isArray(scan.flavors)
          ? scan.flavors.map((flavor: any) => ({ name: flavor, intensity: 5, emoji: '🍃', color: '#059669' }))
          : [],
        description: scan.description || '',
        inStock: scan.in_stock,
        userId: scan.user_id,
        terpenes: Array.isArray(scan.terpenes) 
          ? scan.terpenes.map((terpene: any) => ({
              name: terpene.name || '',
              percentage: terpene.percentage || 0,
              effects: terpene.effects || ''
            }))
          : [],
        medicalUses: scan.medical_uses || [],
        confidence: scan.confidence || 0,
        scannedAt: scan.scanned_at,
        createdAt: scan.created_at
      }));

      const duplicateGroups: DuplicateGroup[] = [];
      const processed = new Set<string>();

      // Compare each strain with every other strain
      for (let i = 0; i < convertedStrains.length; i++) {
        setScanProgress(((i + 1) / convertedStrains.length) * 100);
        
        if (processed.has(convertedStrains[i].id)) continue;

        const group: Strain[] = [convertedStrains[i]];
        processed.add(convertedStrains[i].id);

        for (let j = i + 1; j < convertedStrains.length; j++) {
          if (processed.has(convertedStrains[j].id)) continue;

          const similarity = calculateSimilarity(convertedStrains[i], convertedStrains[j]);
          
          if (similarity >= 75) { // High similarity threshold
            group.push(convertedStrains[j]);
            processed.add(convertedStrains[j].id);
          }
        }

        if (group.length > 1) {
          duplicateGroups.push({
            name: convertedStrains[i].name,
            strains: group,
            similarity: 100 // Average similarity for the group
          });
        }

        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      setDuplicates(duplicateGroups);
      setScanComplete(true);

      toast({
        title: "🔍 Scan Complete",
        description: `Found ${duplicateGroups.length} potential duplicate groups across ${convertedStrains.length} strains.`,
      });

    } catch (error: any) {
      console.error('Error scanning for duplicates:', error);
      toast({
        title: "❌ Scan Failed",
        description: error.message || "Failed to scan for duplicates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const toggleStrainSelection = (strainId: string) => {
    const newSelection = new Set(selectedForDeletion);
    if (newSelection.has(strainId)) {
      newSelection.delete(strainId);
    } else {
      newSelection.add(strainId);
    }
    setSelectedForDeletion(newSelection);
  };

  const deleteDuplicates = async () => {
    if (selectedForDeletion.size === 0) return;

    setIsDeleting(true);
    try {
      // Delete selected strains
      const { error } = await supabase
        .from('scans')
        .delete()
        .in('id', Array.from(selectedForDeletion));

      if (error) throw error;

      // Update duplicates list by removing deleted strains
      const updatedDuplicates = duplicates.map(group => ({
        ...group,
        strains: group.strains.filter(strain => !selectedForDeletion.has(strain.id))
      })).filter(group => group.strains.length > 1);

      setDuplicates(updatedDuplicates);
      setSelectedForDeletion(new Set());

      toast({
        title: "🗑️ Duplicates Deleted",
        description: `Successfully removed ${selectedForDeletion.size} duplicate strains from your database.`,
      });

    } catch (error: any) {
      console.error('Error deleting duplicates:', error);
      toast({
        title: "❌ Delete Failed",
        description: error.message || "Failed to delete selected strains. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Cleanup
        </CardTitle>
        <CardDescription>
          Scan for and remove duplicate strain entries to keep your database clean and efficient.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!scanComplete ? (
          <div className="space-y-4">
            <Button
              onClick={scanForDuplicates}
              disabled={isScanning}
              className="w-full"
            >
              {isScanning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scanning Database...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Scan for Duplicates
                </>
              )}
            </Button>

            {isScanning && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Analyzing strain database...</span>
                  <span>{Math.round(scanProgress)}%</span>
                </div>
                <Progress value={scanProgress} className="h-2" />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="font-medium">Scan Results</span>
              </div>
              <Button onClick={scanForDuplicates} variant="outline" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Rescan
              </Button>
            </div>

            {duplicates.length === 0 ? (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  🎉 Great! No duplicate strains were found in your database. Your data is clean and organized.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Found {duplicates.length} groups of potential duplicate strains. Review and select which ones to remove.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {duplicates.map((group, groupIndex) => (
                    <Card key={groupIndex} className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">"{group.name}" variants</h4>
                          <Badge variant="secondary">{group.strains.length} duplicates</Badge>
                        </div>
                        <div className="grid gap-2">
                          {group.strains.map((strain, strainIndex) => (
                            <div 
                              key={strain.id}
                              className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors ${
                                selectedForDeletion.has(strain.id) 
                                  ? 'bg-red-50 border-red-200' 
                                  : 'hover:bg-gray-50'
                              }`}
                              onClick={() => toggleStrainSelection(strain.id)}
                            >
                              <div className="flex-1">
                                <div className="text-xs font-medium">{strain.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {strain.type} • {strain.thc}% THC • {strain.cbd}% CBD
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {strainIndex === 0 && (
                                  <Badge variant="outline" className="text-xs">Keep</Badge>
                                )}
                                <input
                                  type="checkbox"
                                  checked={selectedForDeletion.has(strain.id)}
                                  onChange={() => toggleStrainSelection(strain.id)}
                                  className="rounded"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {selectedForDeletion.size > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete {selectedForDeletion.size} Selected Strains
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>🗑️ Confirm Deletion</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to permanently delete {selectedForDeletion.size} duplicate strain{selectedForDeletion.size > 1 ? 's' : ''}? 
                          This action cannot be undone and will also remove all associated pricing data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={deleteDuplicates}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            'Delete Permanently'
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DatabaseCleanup;