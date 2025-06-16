import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic } from 'lucide-react';
import { UserTone } from '@/services/toneService';
interface CurrentToneDisplayProps {
  currentTone: UserTone | null;
  isLoading: boolean;
}
const CurrentToneDisplay = ({
  currentTone,
  isLoading
}: CurrentToneDisplayProps) => {
  return <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-black ">
          <Mic className="h-4 w-4 text-blue-600" />
          Current Tone
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? <div className="animate-pulse text-sm text-muted-foreground">Loading tone...</div> : currentTone ? <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{currentTone.name}</Badge>
              {!currentTone.user_id && <Badge variant="outline" className="text-xs text bg-black ">System</Badge>}
            </div>
            <p className="text-xs text-muted-foreground">{currentTone.description}</p>
          </div> : <p className="text-sm text-muted-foreground">No tone selected</p>}
      </CardContent>
    </Card>;
};
export default CurrentToneDisplay;