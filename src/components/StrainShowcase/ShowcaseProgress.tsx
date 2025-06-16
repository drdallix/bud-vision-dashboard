
import { CircleDot } from 'lucide-react';

interface ShowcaseProgressProps {
  current: number;
  total: number;
}

const ShowcaseProgress = ({ current, total }: ShowcaseProgressProps) => (
  <div className="absolute left-0 right-0 bottom-2 flex items-center justify-center gap-2">
    {Array.from({ length: total }).map((_, i) => (
      <CircleDot
        key={i}
        size={18}
        className={`transition-all ${i === current ? 'text-green-600 scale-125' : 'text-gray-300'}`}
        aria-label={i === current ? "Current slide" : undefined}
      />
    ))}
  </div>
);

export default ShowcaseProgress;
