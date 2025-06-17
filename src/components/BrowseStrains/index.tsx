import React, { useState, useEffect, useCallback } from 'react';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { Search, Plus, Edit, Trash2, DollarSign } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { useOrigin } from "@/hooks/use-origin"
import { useAuth } from '@/contexts/AuthContext';
import { useBrowseStrains } from '@/hooks/useBrowseStrains';
import { Strain } from '@/types/strain';
import StrainCard from './components/StrainCard';
import BrowseHeader from './components/BrowseHeader';
import StrainEditorDialog from '@/components/StrainEditor/StrainEditorDialog';
import BatchEditDialog from './components/BatchEditDialog';
import BatchPricingDialog from './components/BatchPricingDialog';
import BrowseGridSkeleton from '@/components/ui/skeletons/BrowseGridSkeleton';

interface BrowseStrainingsProps {
  onStrainSelect?: (strain: Strain) => void;
}

const BrowseStrains = ({ onStrainSelect }: BrowseStrainingsProps) => {
  const origin = useOrigin();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [selectedStrains, setSelectedStrains] = useState<string[]>([]);
  const [editStrainId, setEditStrainId] = useState<string | null>(null);
  const [batchEditOpen, setBatchEditOpen] = useState(false);
  const [batchPricingOpen, setBatchPricingOpen] = useState(false);
  const { 
    strains, 
    allStrains,
    isLoading, 
    error,
    updateStrainInCache
  } = useBrowseStrains(searchTerm, filterType, sortBy);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (value: string) => {
    setFilterType(value);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const handleStrainSelect = (strain: Strain) => {
    onStrainSelect?.(strain);
  };

  const toggleSelectStrain = (strainId: string) => {
    setSelectedStrains(prev => {
      if (prev.includes(strainId)) {
        return prev.filter(id => id !== strainId);
      } else {
        return [...prev, strainId];
      }
    });
  };

  const clearSelection = () => {
    setSelectedStrains([]);
  };

  const isSelected = (strainId: string) => {
    return selectedStrains.includes(strainId);
  };

  const handleEditClick = (strainId: string) => {
    setEditStrainId(strainId);
  };

  const handleEditDialogClose = () => {
    setEditStrainId(null);
  };

  const handleStrainUpdate = (updatedStrain: Strain) => {
    console.log('Updating strain in BrowseStrains:', updatedStrain.name);
    updateStrainInCache(updatedStrain);
  };

  const handleBatchEditClick = () => {
    if (selectedStrains.length === 0) {
      toast({
        title: "No Strains Selected",
        description: "Please select strains to edit.",
      });
      return;
    }
    setBatchEditOpen(true);
  };

  const handleBatchEditClose = () => {
    setBatchEditOpen(false);
  };

  const handleBatchPricingClick = () => {
     if (selectedStrains.length === 0) {
      toast({
        title: "No Strains Selected",
        description: "Please select strains to set pricing for.",
      });
      return;
    }
    setBatchPricingOpen(true);
  };

  const handleBatchPricingClose = () => {
    setBatchPricingOpen(false);
  };

  const handleDeleteClick = () => {
    if (selectedStrains.length === 0) {
      toast({
        title: "No Strains Selected",
        description: "Please select strains to delete.",
      });
      return;
    }

    // Placeholder for delete logic
    toast({
      title: "Delete Action",
      description: `Deleting ${selectedStrains.length} strains. (Not Implemented)`,
    });
  };

  // Show skeleton while loading
  if (isLoading) {
    return (
      <div className="space-y-6">
        <BrowseHeader 
          selectedCount={selectedStrains.length}
          totalCount={0}
          onBatchEdit={() => {}}
          onBatchDelete={() => {}}
          onBatchPricing={() => {}}
          onClearSelection={() => {}}
        />
        <BrowseGridSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BrowseHeader 
        selectedCount={selectedStrains.length}
        totalCount={strains.length}
        onBatchEdit={handleBatchEditClick}
        onBatchDelete={handleDeleteClick}
        onBatchPricing={handleBatchPricingClick}
        onClearSelection={clearSelection}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {strains.map((strain) => (
          <StrainCard
            key={strain.id}
            strain={strain}
            onSelect={handleStrainSelect}
            isSelected={isSelected(strain.id)}
            onToggleSelect={toggleSelectStrain}
            onEditClick={handleEditClick}
          />
        ))}
      </div>

      <StrainEditorDialog
        isOpen={!!editStrainId}
        onClose={handleEditDialogClose}
        strainId={editStrainId}
        onStrainUpdate={handleStrainUpdate}
      />

      <BatchEditDialog
        open={batchEditOpen}
        onOpenChange={setBatchEditOpen}
        strainIds={selectedStrains}
        onClose={handleBatchEditClose}
      />

      <BatchPricingDialog
        open={batchPricingOpen}
        onOpenChange={setBatchPricingOpen}
        strainIds={selectedStrains}
        onClose={handleBatchPricingClose}
      />
    </div>
  );
};

export default BrowseStrains;
