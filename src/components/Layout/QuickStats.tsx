
import { Scan, Menu, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Strain } from '@/types/strain';

interface QuickStatsProps {
  scans: Strain[];
}

const QuickStats = ({ scans }: QuickStatsProps) => {
  if (scans.length === 0) return null;

  const getMostPopularType = () => {
    const typeCounts = scans.reduce((acc, strain) => {
      acc[strain.type] = (acc[strain.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(typeCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';
  };

  const getAverageThc = () => {
    return Math.round(scans.reduce((sum, strain) => sum + strain.thc, 0) / scans.length);
  };

  return (
    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Scanned Today</CardTitle>
          <Scan className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{scans.length}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Most Popular Type</CardTitle>
          <Menu className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {getMostPopularType()}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg THC Level</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {getAverageThc()}%
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickStats;
