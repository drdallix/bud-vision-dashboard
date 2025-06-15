
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';

interface StrainMedicalUsesProps {
  medicalUses: string[];
}

const StrainMedicalUses = ({ medicalUses }: StrainMedicalUsesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Therapeutic Uses
        </CardTitle>
        <CardDescription>Potential medical benefits</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {medicalUses.map((use, index) => (
            <Badge key={index} className="bg-red-50 text-red-700 border-red-200">
              {use}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StrainMedicalUses;
