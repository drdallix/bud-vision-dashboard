
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf } from 'lucide-react';

interface StrainFlavorsProps {
  flavors: string[];
}

const StrainFlavors = ({ flavors }: StrainFlavorsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-green-500" />
          Flavor Profile
        </CardTitle>
        <CardDescription>Taste and aroma notes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {flavors.map((flavor, index) => (
            <Badge key={index} variant="outline">
              <span>{flavor}</span>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StrainFlavors;
