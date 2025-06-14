
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Terpene {
  name: string;
  percentage: number;
  effects: string;
}

interface Strain {
  id: string;
  name: string;
  type: 'Indica' | 'Sativa' | 'Hybrid';
  thc: number;
  cbd: number;
  effects: string[];
  flavors: string[];
  terpenes?: Terpene[];
  medicalUses: string[];
  description: string;
  imageUrl: string;
  scannedAt: string;
  confidence: number;
}

// Use the actual database return type from Supabase (matching the generated types)
type DatabaseScan = {
  id: string;
  user_id: string;
  strain_name: string;
  strain_type: string;
  thc: number | null;
  cbd: number | null;
  effects: string[] | null;
  flavors: string[] | null;
  terpenes: any | null; // Using 'any' to match Json type from database
  medical_uses: string[] | null;
  description: string | null;
  image_url: string | null;
  confidence: number | null;
  scanned_at: string;
  created_at: string;
};

export const useScans = () => {
  const [scans, setScans] = useState<Strain[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const convertDatabaseScanToStrain = (scan: DatabaseScan): Strain => {
    // Type guard to ensure strain_type is valid
    const validStrainType = (type: string): type is 'Indica' | 'Sativa' | 'Hybrid' => {
      return ['Indica', 'Sativa', 'Hybrid'].includes(type);
    };

    // Helper function to safely parse terpenes
    const parseTerpenes = (terpenes: any): Terpene[] => {
      if (!terpenes) return [];
      if (Array.isArray(terpenes)) return terpenes;
      try {
        const parsed = typeof terpenes === 'string' ? JSON.parse(terpenes) : terpenes;
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    };

    return {
      id: scan.id,
      name: scan.strain_name,
      type: validStrainType(scan.strain_type) ? scan.strain_type : 'Hybrid',
      thc: Number(scan.thc) || 0,
      cbd: Number(scan.cbd) || 0,
      effects: scan.effects || [],
      flavors: scan.flavors || [],
      terpenes: parseTerpenes(scan.terpenes),
      medicalUses: scan.medical_uses || [],
      description: scan.description || '',
      imageUrl: scan.image_url || '/placeholder.svg',
      scannedAt: scan.scanned_at,
      confidence: scan.confidence || 0,
    };
  };

  const fetchScans = async () => {
    if (!user) {
      setScans([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', user.id)
        .order('scanned_at', { ascending: false });

      if (error) throw error;

      const strains = (data || []).map(convertDatabaseScanToStrain);
      setScans(strains);
    } catch (error) {
      console.error('Error fetching scans:', error);
      toast({
        title: "Error loading scans",
        description: "Failed to load your scan history.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addScan = async (strain: Strain) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save your scans.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('scans')
        .insert({
          user_id: user.id,
          strain_name: strain.name,
          strain_type: strain.type,
          thc: strain.thc,
          cbd: strain.cbd,
          effects: strain.effects,
          flavors: strain.flavors,
          terpenes: strain.terpenes || null, // Store as JSON
          medical_uses: strain.medicalUses,
          description: strain.description,
          image_url: strain.imageUrl,
          confidence: strain.confidence,
          scanned_at: strain.scannedAt,
        })
        .select()
        .single();

      if (error) throw error;

      const newStrain = convertDatabaseScanToStrain(data);
      setScans(prev => [newStrain, ...prev]);
      
      toast({
        title: "Scan saved!",
        description: `${strain.name} has been added to your scan history.`,
      });
    } catch (error) {
      console.error('Error saving scan:', error);
      toast({
        title: "Error saving scan",
        description: "Failed to save your scan. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchScans();

    // Set up real-time subscription
    if (user) {
      const channel = supabase
        .channel('scans-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'scans',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Real-time scan update:', payload);
            fetchScans(); // Refetch data on any change
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return {
    scans,
    loading,
    addScan,
    refetch: fetchScans,
  };
};
