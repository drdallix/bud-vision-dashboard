
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { UserTone } from '@/services/toneService';

interface DescriptionReviewCardProps {
  proposedDescription: string;
  selectedToneId: string;
  availableTones: UserTone[];
  onApprove: () => void;
  onReject: () => void;
  isLoading: boolean;
  isSaving: boolean;
}

const DescriptionReviewCard = ({
  proposedDescription,
  selectedToneId,
  availableTones,
  onApprove,
  onReject,
  isLoading,
  isSaving
}: DescriptionReviewCardProps) => {
  if (!proposedDescription) return null;

  return (
    <Card className="border-purple-200">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="text-sm sm:text-base text-purple-900">
          Proposed New Description
          {selectedToneId !== 'default' && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {availableTones.find(t => t.id === selectedToneId)?.name || 'Custom Tone'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <div className="p-2 sm:p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs sm:text-sm text-black">
          {proposedDescription}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={onApprove} 
            className="flex-1 bg-green-600 hover:bg-green-700 text-sm" 
            disabled={isLoading || isSaving} 
            size="sm"
          >
            <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Approve & Apply'}
          </Button>
          <Button 
            onClick={onReject} 
            variant="outline" 
            className="flex-1 text-red-600 border-red-300 hover:bg-red-50 text-sm" 
            disabled={isLoading || isSaving} 
            size="sm"
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DescriptionReviewCard;
