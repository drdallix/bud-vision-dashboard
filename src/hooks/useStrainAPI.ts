
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useScans } from '@/hooks/useScans';
import { analyzeStrainWithAI } from '@/components/SmartOmnibar/AIAnalysis';
import { rateLimitService } from '@/services/rateLimitService';
import { Strain } from '@/types/strain';
import { useToast } from '@/hooks/use-toast';

interface StrainAPIParams {
  description?: string;
  type?: 'indica' | 'sativa' | 'hybrid';
  thc?: number;
  cbd?: number;
  effects?: string[];
  flavors?: string[];
  force?: boolean; // Force generation even if strain exists
}

export const useStrainAPI = () => {
  const { user } = useAuth();
  const { addScan } = useScans();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    remaining: number;
    resetTime: number;
  } | null>(null);

  const checkRateLimit = useCallback(() => {
    if (user) return { allowed: true, remaining: Infinity, resetTime: 0 };
    
    const result = rateLimitService.checkLimit();
    setRateLimitInfo({
      remaining: result.remaining,
      resetTime: result.resetTime
    });
    
    return result;
  }, [user]);

  const generateStrain = useCallback(async (
    strainName: string, 
    params: StrainAPIParams = {}
  ): Promise<Strain | null> => {
    // Check rate limit for unauthenticated users
    const rateCheck = checkRateLimit();
    if (!rateCheck.allowed) {
      const resetTimeStr = rateLimitService.getRemainingTime(rateCheck.resetTime);
      toast({
        title: "Rate Limited",
        description: `Please try again in ${resetTimeStr}. Sign in for unlimited access.`,
        variant: "destructive",
      });
      return null;
    }

    setIsGenerating(true);
    try {
      // Build enhanced prompt with parameters
      let prompt = `Generate a detailed profile for the cannabis strain "${strainName}"`;
      
      if (params.description) {
        prompt += ` with the following characteristics: ${params.description}`;
      }
      
      if (params.type) {
        prompt += ` This should be a ${params.type} strain`;
      }
      
      if (params.thc) {
        prompt += ` with approximately ${params.thc}% THC`;
      }
      
      if (params.cbd) {
        prompt += ` and ${params.cbd}% CBD`;
      }
      
      if (params.effects?.length) {
        prompt += ` with effects including: ${params.effects.join(', ')}`;
      }
      
      if (params.flavors?.length) {
        prompt += ` and flavors like: ${params.flavors.join(', ')}`;
      }

      console.log('Generating strain with prompt:', prompt);
      
      // Use a temporary user ID for unauthenticated users
      const userId = user?.id || 'anonymous';
      const result = await analyzeStrainWithAI(undefined, prompt, userId);
      
      const strain: Strain = {
        ...result,
        id: Date.now().toString(),
        scannedAt: new Date().toISOString(),
        inStock: true,
        userId: userId
      };

      // Only save to database if user is authenticated
      if (user) {
        await addScan(strain);
        toast({
          title: "Strain Generated & Saved",
          description: `${strain.name} has been generated and added to your collection.`,
        });
      } else {
        toast({
          title: "Strain Generated",
          description: `${strain.name} has been generated. Sign in to save to your collection.`,
        });
      }

      return strain;
    } catch (error) {
      console.error('Failed to generate strain:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate strain. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [user, addScan, toast, checkRateLimit]);

  return {
    generateStrain,
    isGenerating,
    rateLimitInfo,
    isAuthenticated: !!user
  };
};
