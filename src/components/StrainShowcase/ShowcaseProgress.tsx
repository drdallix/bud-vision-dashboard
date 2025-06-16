
import { Progress } from '@/components/ui/progress';

interface ShowcaseProgressProps {
  total: number;
  current: number;
  onNav: (index: number) => void;
}

const ShowcaseProgress = ({ total, current, onNav }: ShowcaseProgressProps) => {
  const progressPercentage = total > 0 ? ((current + 1) / total) * 100 : 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Progress</span>
        <span>{current + 1} of {total}</span>
      </div>
      
      <Progress value={progressPercentage} className="h-2" />
      
      {/* Optional: Add clickable dots for direct navigation */}
      <div className="flex justify-center space-x-2">
        {Array.from({ length: Math.min(total, 10) }, (_, index) => (
          <button
            key={index}
            onClick={() => onNav(index)}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === current
                ? 'bg-primary scale-125'
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
        {total > 10 && (
          <span className="text-xs text-muted-foreground self-center ml-2">
            +{total - 10} more
          </span>
        )}
      </div>
    </div>
  );
};

export default ShowcaseProgress;
