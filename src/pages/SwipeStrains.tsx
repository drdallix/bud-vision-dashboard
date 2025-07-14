import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, X, RotateCcw, ArrowLeft, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeStrainStore } from '@/stores/useRealtimeStrainStore';
import { Strain } from '@/types/strain';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StrainRating {
  id: string;
  user_id: string;
  strain_id: string;
  rating: 'like' | 'dislike';
  created_at: string;
}

const SwipeStrains = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { strains } = useRealtimeStrainStore(true);
  const { toast } = useToast();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ratings, setRatings] = useState<StrainRating[]>([]);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dailyStreak, setDailyStreak] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Get unrated strains
  const unratedStrains = strains.filter(strain => 
    !ratings.find(r => r.strain_id === strain.id)
  );

  const currentStrain = unratedStrains[currentIndex];

  useEffect(() => {
    if (user) {
      loadUserRatings();
    }
  }, [user]);

  const loadUserRatings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('strain_ratings')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      setRatings((data || []) as StrainRating[]);
      
      // Calculate daily streak
      const today = new Date().toDateString();
      const todayRatings = (data || []).filter(r => 
        new Date(r.created_at).toDateString() === today
      );
      setDailyStreak(todayRatings.length);
    } catch (error) {
      console.error('Error loading ratings:', error);
    }
  };

  const saveRating = async (rating: 'like' | 'dislike') => {
    if (!user || !currentStrain) return;
    
    try {
      const { error } = await supabase
        .from('strain_ratings')
        .upsert({
          user_id: user.id,
          strain_id: currentStrain.id,
          rating,
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      setRatings(prev => [
        ...prev.filter(r => r.strain_id !== currentStrain.id),
        {
          id: `temp_${Date.now()}`,
          user_id: user.id,
          strain_id: currentStrain.id,
          rating,
          created_at: new Date().toISOString()
        }
      ]);
      
      setDailyStreak(prev => prev + 1);
      
      toast({
        title: rating === 'like' ? '💚 Strain Liked!' : '❌ Strain Passed',
        description: `${currentStrain.name} rated as ${rating}`,
      });
    } catch (error) {
      console.error('Error saving rating:', error);
      toast({
        title: 'Error',
        description: 'Failed to save rating',
        variant: 'destructive'
      });
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!currentStrain) return;
    
    setSwipeDirection(direction);
    await saveRating(direction === 'right' ? 'like' : 'dislike');
    
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipeDirection(null);
      setDragOffset({ x: 0, y: 0 });
    }, 300);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const startX = e.clientX;
    const startTime = Date.now();
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - startX;
      const deltaY = 0;
      setDragOffset({ x: deltaX, y: deltaY });
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      const threshold = 100;
      const tapThreshold = 200; // milliseconds for tap vs drag
      const timeElapsed = Date.now() - startTime;
      
      // If it's a quick tap with minimal movement, navigate to details
      if (timeElapsed < tapThreshold && Math.abs(dragOffset.x) < 10) {
        navigate('/', { state: { selectedStrain: currentStrain, activeTab: 'details' } });
        return;
      }
      
      if (Math.abs(dragOffset.x) > threshold) {
        handleSwipe(dragOffset.x > 0 ? 'right' : 'left');
      } else {
        setDragOffset({ x: 0, y: 0 });
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const getCardStyle = () => {
    const rotation = dragOffset.x * 0.1;
    const scale = isDragging ? 0.95 : 1;
    const opacity = Math.max(0.7, 1 - Math.abs(dragOffset.x) / 200);
    
    return {
      transform: `translateX(${dragOffset.x}px) rotate(${rotation}deg) scale(${scale})`,
      opacity,
      transition: isDragging ? 'none' : 'all 0.3s ease-out'
    };
  };

  const getOverlayOpacity = (direction: 'like' | 'dislike') => {
    const swipeType = swipeDirection === 'left' ? 'dislike' : swipeDirection === 'right' ? 'like' : null;
    if (swipeType === direction) return 1;
    if (direction === 'like' && dragOffset.x > 50) return dragOffset.x / 150;
    if (direction === 'dislike' && dragOffset.x < -50) return Math.abs(dragOffset.x) / 150;
    return 0;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-bold mb-4">Sign in Required</h2>
          <p className="text-muted-foreground mb-4">Please sign in to rate strains</p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </Card>
      </div>
    );
  }

  if (!currentStrain) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <Sparkles className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-4">🎉 All Done!</h2>
          <p className="text-muted-foreground mb-6">
            You've rated all available strains! Check back later for new ones.
          </p>
          <div className="space-y-2 mb-6">
            <div className="text-lg font-semibold">Today's Progress</div>
            <div className="text-3xl font-bold text-primary">{dailyStreak}</div>
            <div className="text-sm text-muted-foreground">strains rated</div>
          </div>
          <Button onClick={() => navigate('/')} className="w-full">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-card border-b border-border">
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center">
          <div className="font-semibold text-foreground">🌿 Strain Swipe</div>
          <div className="text-sm text-muted-foreground">
            {unratedStrains.length - currentIndex} left • {dailyStreak} rated today
          </div>
        </div>
        <Button
          onClick={() => setCurrentIndex(0)}
          variant="ghost"
          size="sm"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Swipe Cards */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative w-full max-w-sm">
          {/* Next card (background) */}
          {unratedStrains[currentIndex + 1] && (
            <Card className="absolute inset-0 bg-card/90 border-border transform scale-95 -rotate-1 select-none">
              <CardContent className="p-6 h-full flex flex-col items-center justify-center select-none pointer-events-none">
                <div className="text-center opacity-50 select-none">
                  <h3 className="font-bold text-lg mb-2 text-foreground select-none">
                    {unratedStrains[currentIndex + 1].name}
                  </h3>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current card */}
          <Card 
            ref={cardRef}
            className="relative bg-card border-border shadow-xl cursor-grab active:cursor-grabbing h-96 overflow-hidden select-none"
            style={getCardStyle()}
            onMouseDown={handleMouseDown}
          >
            {/* Like overlay */}
            <div 
              className="absolute inset-0 bg-primary/90 flex items-center justify-center z-10 pointer-events-none select-none"
              style={{ opacity: getOverlayOpacity('like') }}
            >
              <div className="text-primary-foreground text-6xl font-bold transform -rotate-12 select-none">
                LIKE 💚
              </div>
            </div>

            {/* Dislike overlay */}
            <div 
              className="absolute inset-0 bg-destructive/90 flex items-center justify-center z-10 pointer-events-none select-none"
              style={{ opacity: getOverlayOpacity('dislike') }}
            >
              <div className="text-destructive-foreground text-6xl font-bold transform rotate-12 select-none">
                PASS ❌
              </div>
            </div>

            <CardContent className="p-6 h-full flex flex-col select-none pointer-events-none">
              {/* Strain Header */}
              <div className="text-center mb-4">
                <h1 className="text-2xl font-bold mb-2 text-foreground select-none">{currentStrain.name}</h1>
                <Badge variant="outline" className="mb-2 select-none">
                  {currentStrain.type}
                </Badge>
                <div className="flex justify-center space-x-2 text-sm text-muted-foreground select-none">
                  <span>THC: {currentStrain.thc}%</span>
                  <span>•</span>
                  <span>CBD: {currentStrain.cbd}%</span>
                </div>
              </div>

              {/* Content - Show all in a scrollable area */}
              <div className="flex-1 space-y-4 overflow-y-auto">
                {/* Description - Full text */}
                {currentStrain.description && (
                  <div>
                    <h3 className="font-semibold mb-2 text-foreground select-none">Description</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed select-none">
                      {currentStrain.description}
                    </p>
                  </div>
                )}

                {/* Effects */}
                <div>
                  <h3 className="font-semibold mb-2 text-foreground select-none">Effects</h3>
                  <div className="flex flex-wrap gap-1">
                    {currentStrain.effectProfiles.map((effect, index) => (
                      <Badge key={index} variant="secondary" className="text-xs select-none">
                        {effect.emoji} {effect.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Flavors */}
                <div>
                  <h3 className="font-semibold mb-2 text-foreground select-none">Flavors</h3>
                  <div className="flex flex-wrap gap-1">
                    {currentStrain.flavorProfiles.map((flavor, index) => (
                      <Badge key={index} variant="outline" className="text-xs select-none">
                        {flavor.emoji} {flavor.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Terpenes if available */}
                {currentStrain.terpenes && currentStrain.terpenes.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 text-foreground select-none">Terpenes</h3>
                    <div className="flex flex-wrap gap-1">
                      {currentStrain.terpenes.slice(0, 4).map((terpene, index) => (
                        <Badge key={index} variant="outline" className="text-xs select-none">
                          {terpene.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tap hint */}
              <div className="text-center mt-4 text-xs text-muted-foreground select-none">
                Tap for details • Swipe to rate
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-8 p-6 bg-card/80 backdrop-blur-sm border-t border-border">
        <Button
          onClick={() => handleSwipe('left')}
          variant="outline"
          size="lg"
          className="w-16 h-16 rounded-full border-destructive/20 hover:bg-destructive/5"
        >
          <X className="h-6 w-6 text-destructive" />
        </Button>
        
        <Button
          onClick={() => handleSwipe('right')}
          variant="outline"
          size="lg"
          className="w-16 h-16 rounded-full border-primary/20 hover:bg-primary/5"
        >
          <Heart className="h-6 w-6 text-primary" />
        </Button>
      </div>
    </div>
  );
};

export default SwipeStrains;