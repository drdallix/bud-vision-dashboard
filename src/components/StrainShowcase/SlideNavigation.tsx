
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Strain } from '@/types/strain';

interface SlideNavigationProps {
  strains?: Strain[];
  currentIndex?: number;
  onSelect?: (index: number) => void;
  total: number;
  current: number;
  onNav: (index: number) => void;
}

const SlideNavigation = ({
  strains,
  currentIndex,
  onSelect,
  total,
  current,
  onNav
}: SlideNavigationProps) => {
  // Use the provided props or fallback to the legacy props
  const actualTotal = strains ? strains.length : total;
  const actualCurrent = currentIndex !== undefined ? currentIndex : current;
  const actualOnSelect = onSelect || onNav;

  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      {Array.from({
        length: Math.min(actualTotal, 20)
      }).map((_, i) => (
        <Button
          key={i}
          variant={i === actualCurrent ? "default" : "outline"}
          size="sm"
          className={`w-8 h-8 rounded-full p-0 text-xs transition-all duration-300 ${
            i === actualCurrent 
              ? 'bg-green-600 hover:bg-green-700 scale-110 shadow-lg' 
              : 'hover:scale-105'
          }`}
          onClick={() => actualOnSelect(i)}
        >
          {i + 1}
        </Button>
      ))}
      {actualTotal > 20 && (
        <Badge variant="secondary" className="ml-2">
          +{actualTotal - 20} more
        </Badge>
      )}
    </div>
  );
};

export default SlideNavigation;
