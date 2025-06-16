
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mic, Settings } from 'lucide-react';
import ToneManager from './ToneManager';

interface ProfilePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProfilePopup = ({ open, onOpenChange }: ProfilePopupProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Settings
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="tones" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="tones" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Tones
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Profile Information</h3>
              <p className="text-muted-foreground">
                Profile management features coming soon...
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="tones" className="mt-6">
            <ToneManager />
          </TabsContent>
          
          <TabsContent value="settings" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Application Settings</h3>
              <p className="text-muted-foreground">
                General settings coming soon...
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ProfilePopup;
