
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SlideNavigationProps {
  total: number;
  current: number;
  onNav: (index: number) => void;
}

const SlideNavigation = ({ total, current, onNav }: SlideNavigationProps) => {
  return (
    <div className="flex items-center justify-center gap-2 flex-wrap max-h-20 overflow-y-auto">
      {Array.from({ length: Math.min(total, 20) }).map((_, i) => (
        <Button
          key={i}
          variant={i === current ? "default" : "outline"}
          size="sm"
          className={`w-8 h-8 rounded-full p-0 text-xs transition-all duration-300 ${
            i === current 
              ? 'bg-green-600 hover:bg-green-700 scale-110 shadow-lg' 
              : 'hover:scale-105'
          }`}
          onClick={() => onNav(i)}
        >
          {i + 1}
        </Button>
      ))}
      {total > 20 && (
        <Badge variant="secondary" className="ml-2">
          +{total - 20} more
        </Badge>
      )}
    </div>
  );
};

export default SlideNavigation;
