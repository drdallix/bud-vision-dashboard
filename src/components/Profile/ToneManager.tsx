
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Star, Mic } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ToneEditor from './ToneEditor';

interface Tone {
  id: string;
  name: string;
  description: string;
  persona_prompt: string;
  is_default: boolean;
  user_id: string | null;
  created_at: string;
}

const ToneManager = () => {
  const [tones, setTones] = useState<Tone[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTone, setEditingTone] = useState<Tone | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [defaultToneId, setDefaultToneId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchTones();
      fetchUserProfile();
    }
  }, [user]);

  const fetchTones = async () => {
    try {
      // Use raw SQL query to fetch tones since the table isn't in the generated types yet
      const { data, error } = await supabase
        .rpc('get_user_tones', { user_uuid: user?.id });

      if (error) {
        // Fallback to direct query if function doesn't exist
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('user_tones' as any)
          .select('*')
          .or(`user_id.is.null,user_id.eq.${user?.id}`)
          .order('created_at', { ascending: true });

        if (fallbackError) throw fallbackError;
        setTones(fallbackData || []);
      } else {
        setTones(data || []);
      }
    } catch (error) {
      console.error('Error fetching tones:', error);
      toast({
        title: "Error",
        description: "Failed to load tones. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('default_tone_id' as any)
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setDefaultToneId(data?.default_tone_id || null);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleSetDefault = async (toneId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ default_tone_id: toneId } as any)
        .eq('id', user?.id);

      if (error) throw error;

      setDefaultToneId(toneId);
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

  const handleDeleteTone = async (tone: Tone) => {
    if (!tone.user_id) {
      toast({
        title: "Cannot Delete",
        description: "System tones cannot be deleted.",
        variant: "destructive"
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete the "${tone.name}" tone?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('user_tones' as any)
        .delete()
        .eq('id', tone.id);

      if (error) throw error;

      // If this was the default tone, clear the default
      if (defaultToneId === tone.id) {
        await supabase
          .from('profiles')
          .update({ default_tone_id: null } as any)
          .eq('id', user?.id);
        setDefaultToneId(null);
      }

      setTones(tones.filter(t => t.id !== tone.id));
      toast({
        title: "Tone Deleted",
        description: `"${tone.name}" tone has been deleted.`
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

  const handleToneSaved = (savedTone: Tone) => {
    if (editingTone) {
      setTones(tones.map(t => t.id === savedTone.id ? savedTone : t));
    } else {
      setTones([...tones, savedTone]);
    }
    setShowEditor(false);
    setEditingTone(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Description Tones
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage how your product descriptions sound and feel
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingTone(null);
            setShowEditor(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Tone
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tones.map((tone) => (
          <Card key={tone.id} className="relative">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{tone.name}</span>
                  {!tone.user_id && (
                    <Badge variant="secondary" className="text-xs">
                      System
                    </Badge>
                  )}
                  {defaultToneId === tone.id && (
                    <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      <Star className="h-3 w-3 mr-1" />
                      Default
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {tone.user_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingTone(tone);
                        setShowEditor(true);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  )}
                  {tone.user_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTone(tone)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {tone.description}
              </p>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Persona Prompt:
                </p>
                <p className="text-xs">
                  {tone.persona_prompt}
                </p>
              </div>
              {defaultToneId !== tone.id && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSetDefault(tone.id)}
                  className="w-full"
                >
                  Set as Default
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <ToneEditor
        open={showEditor}
        onOpenChange={setShowEditor}
        tone={editingTone}
        onSave={handleToneSaved}
      />
    </div>
  );
};

export default ToneManager;
