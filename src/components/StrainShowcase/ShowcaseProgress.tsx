
import { CircleDot } from 'lucide-react';

interface ShowcaseProgressProps {
  current: number;
  total: number;
  onNav?: (index: number) => void;
}

const ShowcaseProgress = ({ current, total, onNav }: ShowcaseProgressProps) => (
  <div className="absolute left-0 right-0 bottom-2 flex items-center justify-center gap-2">
    {Array.from({ length: total }).map((_, i) => (
      <CircleDot
        key={i}
        size={18}
        className={`transition-all cursor-pointer ${i === current ? 'text-green-600 scale-125' : 'text-gray-300 hover:text-green-400'}`}
        aria-label={i === current ? "Current slide" : `Go to slide ${i + 1}`}
        onClick={() => onNav && onNav(i)}
      />
    ))}
  </div>
);

export default ShowcaseProgress;
