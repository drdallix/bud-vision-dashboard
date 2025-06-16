
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Tone = Tables<'user_tones'>;

interface ToneEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tone?: Tone | null;
  onSave: (tone: Tone) => void;
}

const ToneEditor = ({ open, onOpenChange, tone, onSave }: ToneEditorProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [personaPrompt, setPersonaPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (tone) {
      setName(tone.name);
      setDescription(tone.description || '');
      setPersonaPrompt(tone.persona_prompt);
    } else {
      setName('');
      setDescription('');
      setPersonaPrompt('');
    }
  }, [tone]);

  const handleSave = async () => {
    if (!name.trim() || !personaPrompt.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and persona prompt are required.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const toneData = {
        name: name.trim(),
        description: description.trim(),
        persona_prompt: personaPrompt.trim(),
        user_id: user?.id,
        updated_at: new Date().toISOString()
      };

      let result;
      if (tone) {
        // Update existing tone
        result = await supabase
          .from('user_tones')
          .update(toneData)
          .eq('id', tone.id)
          .select()
          .single();
      } else {
        // Create new tone
        result = await supabase
          .from('user_tones')
          .insert(toneData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      onSave(result.data);
      toast({
        title: "Success",
        description: `Tone ${tone ? 'updated' : 'created'} successfully.`
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving tone:', error);
      toast({
        title: "Error",
        description: `Failed to ${tone ? 'update' : 'create'} tone. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {tone ? 'Edit Tone' : 'Create New Tone'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tone Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Professional, Casual, Friendly"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this tone's style"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="persona-prompt">Persona Prompt</Label>
            <Textarea
              id="persona-prompt"
              value={personaPrompt}
              onChange={(e) => setPersonaPrompt(e.target.value)}
              placeholder="Detailed instructions for how descriptions should be written in this tone..."
              className="min-h-[120px]"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              This prompt will be used to guide the AI when generating product descriptions.
              Be specific about tone, style, language, and target audience.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Saving...' : tone ? 'Update Tone' : 'Create Tone'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ToneEditor;
