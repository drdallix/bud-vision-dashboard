import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { rateLimitService } from '@/services/rateLimitService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAnonymous: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInAnonymously: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsAnonymous(session?.user?.is_anonymous || false);
        setLoading(false);
      }
    );

    // THEN check for existing session and auto-sign in anonymously if needed
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUser(session?.user ?? null);
        setIsAnonymous(session?.user?.is_anonymous || false);
      } else {
        // Auto-sign in anonymously if no session exists
        const { error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.error('Auto anonymous sign-in failed:', error);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signInAnonymously = async () => {
    // Check rate limit for anonymous users
    const rateLimit = rateLimitService.checkLimit(true);
    
    if (!rateLimit.allowed) {
      const remainingTime = rateLimitService.getRemainingTime(rateLimit.resetTime);
      return { 
        error: { 
          message: `Rate limit exceeded. Anonymous users are limited to 3 requests per 15 minutes. Try again in ${remainingTime}.` 
        } 
      };
    }

    const { error } = await supabase.auth.signInAnonymously();
    
    if (!error) {
      toast({
        title: "🕶️ Anonymous Session",
        description: `Signed in anonymously. ${rateLimit.remaining} scans remaining (resets in ${rateLimitService.getRemainingTime(rateLimit.resetTime)})`,
      });
    }
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAnonymous(false);
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    isAnonymous,
    signIn,
    signUp,
    signOut,
    signInAnonymously,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};