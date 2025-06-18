
import { Badge } from '@/components/ui/badge';
import { PricePoint } from '@/types/price';

interface PriceBadgesProps {
  prices: PricePoint[];
}

const PriceBadges = ({ prices }: PriceBadgesProps) => {
  if (!prices.length) return null;
  return (
    <div className="flex gap-1 flex-wrap">
      {prices.map((p) => (
        <Badge key={p.id} className="text-xs bg-green-200 text-green-900 border-green-400">
          {p.wasPrice && (
            <span className="line-through mr-1 text-gray-400">${p.wasPrice}</span>
          )}
          ${p.nowPrice} <span className="text-muted-foreground ml-0.5">/oz</span>
        </Badge>
      ))}
    </div>
  );
};

export default PriceBadges;
