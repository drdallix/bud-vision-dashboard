
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, Edit, Save } from 'lucide-react';
import { UserTone } from '@/services/toneService';

interface DescriptionReviewCardProps {
  proposedDescription: string;
  selectedToneId: string;
  availableTones: UserTone[];
  onApprove: (finalDescription: string) => void;
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
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(proposedDescription);

  if (!proposedDescription) return null;

  const handleStartEditing = () => {
    setEditedDescription(proposedDescription);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
  };

  const handleApprove = () => {
    onApprove(isEditing ? editedDescription : proposedDescription);
  };

  return (
    <Card className="border-purple-200">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="text-sm sm:text-base text-purple-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            Proposed New Description
            {selectedToneId !== 'default' && (
              <Badge variant="secondary" className="text-xs">
                {availableTones.find(t => t.id === selectedToneId)?.name || 'Custom Tone'}
              </Badge>
            )}
          </div>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStartEditing}
              className="h-8 w-8 p-0"
              disabled={isLoading || isSaving}
            >
              <Edit className="h-3 w-3" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className="min-h-[100px] text-xs sm:text-sm"
              placeholder="Edit the proposed description..."
              disabled={isLoading || isSaving}
            />
            <Button
              onClick={handleSaveEdit}
              size="sm"
              variant="outline"
              className="w-full"
              disabled={isLoading || isSaving}
            >
              <Save className="h-3 w-3 mr-2" />
              Save Changes
            </Button>
          </div>
        ) : (
          <div className="p-2 sm:p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs sm:text-sm text-black">
            {editedDescription || proposedDescription}
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={handleApprove} 
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
