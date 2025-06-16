
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

const EmptyState = ({ hasFilters, onClearFilters }: EmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground mb-4">
        No strains match your current filters
      </p>
      {hasFilters && (
        <Button variant="outline" onClick={onClearFilters}>
          Clear Filters
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
