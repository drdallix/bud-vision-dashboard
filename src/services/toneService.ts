
import { supabase } from '@/integrations/supabase/client';

export interface UserTone {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  persona_prompt: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export class ToneService {
  static async getUserTones(userId: string): Promise<UserTone[]> {
    const { data, error } = await supabase
      .from('user_tones')
      .select('*')
      .or(`user_id.is.null,user_id.eq.${userId}`)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async getUserDefaultTone(userId: string): Promise<UserTone | null> {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('default_tone_id')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.default_tone_id) {
      // Return the default system tone
      const { data: systemTone, error: systemError } = await supabase
        .from('user_tones')
        .select('*')
        .eq('id', '00000000-0000-0000-0000-000000000001')
        .single();

      if (systemError) throw systemError;
      return systemTone;
    }

    const { data: tone, error } = await supabase
      .from('user_tones')
      .select('*')
      .eq('id', profile.default_tone_id)
      .single();

    if (error) throw error;
    return tone;
  }

  static async setDefaultTone(userId: string, toneId: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ default_tone_id: toneId })
      .eq('id', userId);

    if (error) throw error;
  }

  static async createTone(toneData: Omit<UserTone, 'id' | 'created_at' | 'updated_at'>): Promise<UserTone> {
    const { data, error } = await supabase
      .from('user_tones')
      .insert({
        ...toneData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateTone(toneId: string, updates: Partial<Omit<UserTone, 'id' | 'created_at'>>): Promise<UserTone> {
    const { data, error } = await supabase
      .from('user_tones')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', toneId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteTone(toneId: string): Promise<void> {
    const { error } = await supabase
      .from('user_tones')
      .delete()
      .eq('id', toneId);

    if (error) throw error;
  }
}
