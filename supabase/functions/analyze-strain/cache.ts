
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const cacheStrainData = async (validatedStrain: any, supabaseUrl: string, supabaseKey: string) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const cacheKey = `strain_${validatedStrain.name.toLowerCase().replace(/\s+/g, '_')}`;
    
    await supabase
      .from('strain_cache')
      .upsert({
        cache_key: cacheKey,
        strain_data: validatedStrain,
        created_at: new Date().toISOString()
      }, { onConflict: 'cache_key' });
    
    console.log('Strain cached successfully:', cacheKey);
  } catch (cacheError) {
    console.log('Cache error (non-critical):', cacheError);
    // Don't fail the request if caching fails
  }
};
