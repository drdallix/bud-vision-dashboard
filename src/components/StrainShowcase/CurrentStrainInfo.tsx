
import { Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Strain } from '@/types/strain';

interface CurrentStrainInfoProps {
  strain: Strain;
  current: number;
  total: number;
}

const CurrentStrainInfo = ({ strain, current, total }: CurrentStrainInfoProps) => {
  return (
    <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3">
      <div className="flex items-center gap-3">
        <Eye className="h-5 w-5 text-green-600" />
        <div>
          <h4 className="font-semibold text-gray-800">{strain.name}</h4>
          <p className="text-sm text-gray-600">{strain.type} • {strain.thc}% THC</p>
        </div>
      </div>
      <Badge className="bg-green-600 text-white">
        {current + 1} of {total}
      </Badge>
    </div>
  );
};

export default CurrentStrainInfo;
