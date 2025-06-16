
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ToneService, UserTone } from '@/services/toneService';
import { useToast } from '@/hooks/use-toast';

export const useToneManagement = () => {
  const [tones, setTones] = useState<UserTone[]>([]);
  const [defaultTone, setDefaultTone] = useState<UserTone | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadTones();
    }
  }, [user]);

  const loadTones = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [userTones, userDefaultTone] = await Promise.all([
        ToneService.getUserTones(user.id),
        ToneService.getUserDefaultTone(user.id)
      ]);
      
      setTones(userTones);
      setDefaultTone(userDefaultTone);
    } catch (error) {
      console.error('Error loading tones:', error);
      toast({
        title: "Error",
        description: "Failed to load tones. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setUserDefaultTone = async (toneId: string) => {
    if (!user) return;

    try {
      await ToneService.setDefaultTone(user.id, toneId);
      const newDefaultTone = tones.find(t => t.id === toneId) || null;
      setDefaultTone(newDefaultTone);
      
      toast({
        title: "Default Tone Updated",
        description: "Your default tone has been set successfully."
      });
    } catch (error) {
      console.error('Error setting default tone:', error);
      toast({
        title: "Error",
        description: "Failed to set default tone. Please try again.",
        variant: "destructive"
      });
    }
  };

  const createTone = async (toneData: Omit<UserTone, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newTone = await ToneService.createTone(toneData);
      setTones([...tones, newTone]);
      
      toast({
        title: "Tone Created",
        description: `"${newTone.name}" tone has been created successfully.`
      });
      
      return newTone;
    } catch (error) {
      console.error('Error creating tone:', error);
      toast({
        title: "Error",
        description: "Failed to create tone. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateTone = async (toneId: string, updates: Partial<Omit<UserTone, 'id' | 'created_at'>>) => {
    try {
      const updatedTone = await ToneService.updateTone(toneId, updates);
      setTones(tones.map(t => t.id === toneId ? updatedTone : t));
      
      // Update default tone if it was the one being updated
      if (defaultTone?.id === toneId) {
        setDefaultTone(updatedTone);
      }
      
      toast({
        title: "Tone Updated",
        description: `"${updatedTone.name}" tone has been updated successfully.`
      });
      
      return updatedTone;
    } catch (error) {
      console.error('Error updating tone:', error);
      toast({
        title: "Error",
        description: "Failed to update tone. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteTone = async (toneId: string) => {
    const toneToDelete = tones.find(t => t.id === toneId);
    if (!toneToDelete) return;

    if (!toneToDelete.user_id) {
      toast({
        title: "Cannot Delete",
        description: "System tones cannot be deleted.",
        variant: "destructive"
      });
      return;
    }

    try {
      await ToneService.deleteTone(toneId);
      setTones(tones.filter(t => t.id !== toneId));
      
      // Clear default tone if it was the deleted one
      if (defaultTone?.id === toneId) {
        setDefaultTone(null);
      }
      
      toast({
        title: "Tone Deleted",
        description: `"${toneToDelete.name}" tone has been deleted.`
      });
    } catch (error) {
      console.error('Error deleting tone:', error);
      toast({
        title: "Error",
        description: "Failed to delete tone. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    tones,
    defaultTone,
    loading,
    setUserDefaultTone,
    createTone,
    updateTone,
    deleteTone,
    refreshTones: loadTones
  };
};
