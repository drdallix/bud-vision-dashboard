
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Strain } from '@/types/strain';

interface StrainBasicInfoFormProps {
  strain: Strain;
  errors: Record<string, string>;
  onUpdate: (field: string, value: any) => void;
  isLoading: boolean;
}

const StrainBasicInfoForm = ({ strain, errors, onUpdate, isLoading }: StrainBasicInfoFormProps) => {
  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'Indica': return '🌙';
      case 'Sativa': return '☀️';
      case 'Hybrid': return '🌓';
      default: return '🌿';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Indica': return 'border-purple-300 bg-purple-50';
      case 'Sativa': return 'border-green-300 bg-green-50';
      case 'Hybrid': return 'border-blue-300 bg-blue-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Strain Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Strain Name</Label>
        <Input
          id="name"
          value={strain.name}
          onChange={(e) => onUpdate('name', e.target.value)}
          disabled={isLoading}
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>

      {/* In Stock Toggle */}
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <Label htmlFor="inStock" className="text-base font-medium">
            In Stock Status
          </Label>
          <p className="text-sm text-muted-foreground">
            Toggle availability for customers
          </p>
        </div>
        <Switch
          id="inStock"
          checked={strain.inStock}
          onCheckedChange={(checked) => onUpdate('inStock', checked)}
          disabled={isLoading}
        />
      </div>

      {/* Strain Type */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Strain Type</Label>
        <RadioGroup
          value={strain.type}
          onValueChange={(value) => onUpdate('type', value)}
          disabled={isLoading}
          className="grid grid-cols-3 gap-4"
        >
          {['Indica', 'Sativa', 'Hybrid'].map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <RadioGroupItem value={type} id={type} />
              <Label 
                htmlFor={type} 
                className={`flex-1 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                  strain.type === type ? getTypeColor(type) : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getTypeEmoji(type)}</span>
                  <span className="font-medium">{type}</span>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
        {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
      </div>

      {/* THC Percentage */}
      <div className="space-y-2">
        <Label htmlFor="thc">THC Percentage</Label>
        <div className="relative">
          <Input
            id="thc"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={strain.thc || ''}
            onChange={(e) => onUpdate('thc', parseFloat(e.target.value) || null)}
            disabled={isLoading}
            className={errors.thc ? 'border-red-500' : ''}
          />
          <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">%</span>
        </div>
        {errors.thc && <p className="text-sm text-red-500">{errors.thc}</p>}
      </div>

      {/* Confidence Score (Read-only) */}
      <div className="space-y-2">
        <Label>AI Confidence Score</Label>
        <div className="p-3 bg-gray-50 border rounded-lg">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${strain.confidence || 0}%` }}
              />
            </div>
            <span className="text-sm font-medium">{strain.confidence || 0}%</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            AI analysis confidence for this strain identification
          </p>
        </div>
      </div>
    </div>
  );
};

export default StrainBasicInfoForm;
