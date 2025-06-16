
import React from 'react';

interface StrainCardIconProps {
  strainType: string;
}

const StrainCardIcon = ({ strainType }: StrainCardIconProps) => {
  const getStrainEmoji = (type: string) => {
    switch (type) {
      case 'Indica':
        return '🌙';
      case 'Sativa':
        return '☀️';
      case 'Hybrid':
        return '🌓';
      default:
        return '🌿';
    }
  };

  const getGradientColor = (type: string) => {
    switch (type) {
      case 'Indica':
        return 'from-purple-500 to-purple-700';
      case 'Sativa':
        return 'from-green-500 to-green-700';
      case 'Hybrid':
        return 'from-blue-500 to-blue-700';
      default:
        return 'from-gray-500 to-gray-700';
    }
  };

  return (
    <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${getGradientColor(strainType)} flex items-center justify-center flex-shrink-0 relative`}>
      <div className="text-2xl opacity-20 absolute">🌿</div>
      <div className="text-xl z-10">{getStrainEmoji(strainType)}</div>
    </div>
  );
};

export default StrainCardIcon;
