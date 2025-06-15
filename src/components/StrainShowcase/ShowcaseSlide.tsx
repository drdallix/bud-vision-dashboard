
import { Strain } from '@/types/strain';
import StrainHeader from '@/components/StrainDashboard/StrainHeader';
import StrainEffectsVisual from '@/components/StrainDashboard/StrainEffectsVisual';
import StrainFlavorsVisual from '@/components/StrainDashboard/StrainFlavorsVisual';
import { Badge } from '@/components/ui/badge';

interface ShowcaseSlideProps {
  strain: Strain;
}

const ShowcaseSlide = ({ strain }: ShowcaseSlideProps) => {
  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <StrainHeader strain={strain} />
      <div className="grid md:grid-cols-2 gap-4">
        <StrainEffectsVisual effectProfiles={strain.effectProfiles} />
        <StrainFlavorsVisual flavorProfiles={strain.flavorProfiles} />
      </div>
      <div className="w-full flex flex-row-reverse items-center justify-end mt-1">
        <Badge className="text-base bg-green-200 text-green-900 border-green-400 px-4 py-2">
          In Stock
        </Badge>
      </div>
    </div>
  );
};

export default ShowcaseSlide;
