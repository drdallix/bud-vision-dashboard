
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
import { useAuth } from '@/contexts/AuthContext';
import { useBrowseStrains } from '@/hooks/useBrowseStrains';
import { Strain } from '@/types/strain';
import StrainCard from './StrainCard';
import BrowseHeader from './components/BrowseHeader';
import { StrainEditModal } from '@/components/StrainEditor';
import BrowseGridSkeleton from '@/components/ui/skeletons/BrowseGridSkeleton';

interface BrowseStrainingsProps {
  onStrainSelect?: (strain: Strain) => void;
}

const BrowseStrains = ({ onStrainSelect }: BrowseStrainingsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [selectedStrains, setSelectedStrains] = useState<string[]>([]);
  const [editStrainId, setEditStrainId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const { 
    strains, 
    allStrains,
    isLoading, 
    error,
    updateStrainInCache
  } = useBrowseStrains(searchTerm, filterType, sortBy);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
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

  const handleEditModeToggle = () => {
    setEditMode(!editMode);
    if (editMode) {
      clearSelection();
    }
  };

  const handleBatchEditClick = () => {
    if (selectedStrains.length === 0) {
      toast({
        title: "No Strains Selected",
        description: "Please select strains to edit.",
      });
      return;
    }
    // Placeholder for batch edit logic
    toast({
      title: "Batch Edit",
      description: `Editing ${selectedStrains.length} strains. (Not Implemented)`,
    });
  };

  const handleBatchPricingClick = () => {
     if (selectedStrains.length === 0) {
      toast({
        title: "No Strains Selected",
        description: "Please select strains to set pricing for.",
      });
      return;
    }
    // Placeholder for batch pricing logic
    toast({
      title: "Batch Pricing",
      description: `Setting prices for ${selectedStrains.length} strains. (Not Implemented)`,
    });
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
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          editMode={editMode}
          onEditModeToggle={handleEditModeToggle}
          selectedCount={selectedStrains.length}
          onClearSelection={clearSelection}
          showMobileFilters={false}
          onToggleMobileFilters={() => {}}
          strains={[]}
        />
        <BrowseGridSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BrowseHeader 
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        editMode={editMode}
        onEditModeToggle={handleEditModeToggle}
        selectedCount={selectedStrains.length}
        onClearSelection={clearSelection}
        showMobileFilters={false}
        onToggleMobileFilters={() => {}}
        strains={strains}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {strains.map((strain) => (
          <StrainCard
            key={strain.id}
            strain={strain}
            editMode={editMode}
            isSelected={isSelected(strain.id)}
            canEdit={true}
            onSelect={(strainId, checked) => {
              if (checked) {
                setSelectedStrains(prev => [...prev, strainId]);
              } else {
                setSelectedStrains(prev => prev.filter(id => id !== strainId));
              }
            }}
            onStockToggle={async (strainId, currentStock) => {
              // Placeholder for stock toggle logic
              console.log('Toggle stock for strain:', strainId, 'current:', currentStock);
              return true;
            }}
            onStrainClick={handleStrainSelect}
            inventoryLoading={false}
            prices={[]}
            pricesLoading={false}
          />
        ))}
      </div>

      <StrainEditModal
        strain={editStrainId ? strains.find(s => s.id === editStrainId) || null : null}
        open={!!editStrainId}
        onClose={handleEditDialogClose}
        onSave={handleStrainUpdate}
      />
    </div>
  );
};

export default BrowseStrains;
