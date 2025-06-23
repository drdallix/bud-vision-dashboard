
import { supabase } from '@/integrations/supabase/client';

export interface ExtractedStrain {
  name: string;
  price?: number;
  type?: 'indica' | 'sativa' | 'hybrid';
}

export interface BulkExtractionResult {
  strains: ExtractedStrain[];
  confidence: number;
}

export const extractStrainsFromText = async (text: string): Promise<BulkExtractionResult> => {
  try {
    const { data, error } = await supabase.functions.invoke('extract-bulk-strains', {
      body: { 
        type: 'text',
        content: text 
      }
    });

    if (error) {
      console.error('Error extracting strains from text:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to extract strains from text:', error);
    throw error;
  }
};

export const extractStrainsFromImage = async (imageData: string): Promise<BulkExtractionResult> => {
  try {
    const { data, error } = await supabase.functions.invoke('extract-bulk-strains', {
      body: { 
        type: 'image',
        content: imageData 
      }
    });

    if (error) {
      console.error('Error extracting strains from image:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to extract strains from image:', error);
    throw error;
  }
};
