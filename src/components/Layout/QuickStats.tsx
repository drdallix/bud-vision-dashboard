
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Strain } from '@/types/strain';

interface QuickStatsProps {
  scans: Strain[];
}

const QuickStats = ({ scans }: QuickStatsProps) => {
  // Return null to hide the stats completely
  return null;
};

export default QuickStats;
