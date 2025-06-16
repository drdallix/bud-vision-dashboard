
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { Strain } from '@/types/strain';
import { TransitionMode } from './FullscreenTransitions';

interface FullscreenGalleryProps {
  strains: Strain[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onExit: () => void;
  transitionMode: TransitionMode;
}

const FullscreenGallery = ({
  strains,
  currentIndex,
  onIndexChange,
  onExit,
  transitionMode
}: FullscreenGalleryProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const currentStrain = strains[currentIndex];

  // Auto-advance when playing
  useEffect(() => {
    if (!isPlaying || strains.length <= 1) return;

    const interval = setInterval(() => {
      onIndexChange((currentIndex + 1) % strains.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, strains.length, onIndexChange]);

  // Hide controls after inactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showControls]);

  const handleNext = () => {
    onIndexChange((currentIndex + 1) % strains.length);
    setShowControls(true);
  };

  const handlePrevious = () => {
    onIndexChange((currentIndex - 1 + strains.length) % strains.length);
    setShowControls(true);
  };

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const getEffectEmojis = (effects: string[]) => {
    const effectEmojis: Record<string, string> = {
      'happy': '😊',
      'relaxed': '😌',
      'euphoric': '🌟',
      'creative': '🎨',
      'focused': '🎯',
      'energetic': '⚡',
      'sleepy': '😴',
      'uplifted': '🚀',
      'hungry': '🍕',
      'giggly': '😂',
      'talkative': '💬',
      'aroused': '💕'
    };
    
    return effects.map(effect => 
      effectEmojis[effect.toLowerCase()] || '✨'
    ).slice(0, 3);
  };

  const getFlavorEmojis = (flavors: string[]) => {
    const flavorEmojis: Record<string, string> = {
      'berry': '🫐',
      'citrus': '🍊',
      'earthy': '🌱',
      'pine': '🌲',
      'sweet': '🍯',
      'spicy': '🌶️',
      'floral': '🌸',
      'fruity': '🍓',
      'vanilla': '🍦',
      'chocolate': '🍫',
      'mint': '🌿',
      'cheese': '🧀'
    };
    
    return flavors.map(flavor => 
      flavorEmojis[flavor.toLowerCase()] || '🌿'
    ).slice(0, 3);
  };

  const getTypeGradient = (type: string) => {
    switch (type.toLowerCase()) {
      case 'indica':
        return 'from-purple-900 via-purple-600 to-indigo-900';
      case 'sativa':
        return 'from-green-900 via-green-600 to-emerald-900';
      case 'hybrid':
        return 'from-orange-900 via-yellow-600 to-red-900';
      default:
        return 'from-gray-900 via-gray-600 to-black';
    }
  };

  if (!currentStrain) return null;

  return (
    <div 
      className="fixed inset-0 bg-black z-50 cursor-none"
      onMouseMove={handleMouseMove}
    >
      {/* Animated Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getTypeGradient(currentStrain.type)} opacity-60`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/20 to-black/60" />
      </div>

      {/* Floating Effect Emojis */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {getEffectEmojis(currentStrain.effectProfiles?.map(e => e.name) || []).map((emoji, index) => (
          <motion.div
            key={`effect-${index}`}
            className="absolute text-6xl"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 100,
              rotate: 0,
              opacity: 0
            }}
            animate={{ 
              y: -100,
              rotate: 360,
              opacity: [0, 0.7, 0]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: index * 2,
              ease: "linear"
            }}
          >
            {emoji}
          </motion.div>
        ))}
        
        {getFlavorEmojis(currentStrain.flavorProfiles?.map(f => f.name) || []).map((emoji, index) => (
          <motion.div
            key={`flavor-${index}`}
            className="absolute text-4xl"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: -100,
              rotate: 0,
              opacity: 0
            }}
            animate={{ 
              y: window.innerHeight + 100,
              rotate: -360,
              opacity: [0, 0.5, 0],
              x: [
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth
              ]
            }}
            transition={{
              duration: 10 + Math.random() * 5,
              repeat: Infinity,
              delay: index * 3,
              ease: "easeInOut"
            }}
          >
            {emoji}
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStrain.id}
          className="flex items-center justify-center h-full p-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <div className="max-w-4xl w-full text-center text-white">
            {/* Strain Name */}
            <motion.h1
              className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-white via-green-200 to-white bg-clip-text text-transparent"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              {currentStrain.name}
            </motion.h1>

            {/* Type Badge */}
            <motion.div
              className={`inline-block px-6 py-2 rounded-full text-xl font-semibold mb-6 ${
                currentStrain.type === 'Indica' ? 'bg-purple-600' :
                currentStrain.type === 'Sativa' ? 'bg-green-600' :
                'bg-orange-600'
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            >
              {currentStrain.type}
            </motion.div>

            {/* THC/CBD */}
            <motion.div
              className="flex justify-center gap-8 mb-8"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400">{currentStrain.thc || 0}%</div>
                <div className="text-sm opacity-75">THC</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400">{currentStrain.cbd || 0}%</div>
                <div className="text-sm opacity-75">CBD</div>
              </div>
            </motion.div>

            {/* Effects */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <h3 className="text-2xl font-semibold mb-4">Effects</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {currentStrain.effectProfiles?.slice(0, 6).map((effect, index) => (
                  <motion.span
                    key={effect.name}
                    className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.3)' }}
                  >
                    {effect.name}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* Description */}
            <motion.p
              className="text-lg opacity-90 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
            >
              {currentStrain.description}
            </motion.p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Exit Button */}
            <button
              className="absolute top-6 right-6 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors pointer-events-auto"
              onClick={onExit}
            >
              <X className="h-6 w-6" />
            </button>

            {/* Navigation */}
            <button
              className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors pointer-events-auto"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-8 w-8" />
            </button>

            <button
              className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors pointer-events-auto"
              onClick={handleNext}
            >
              <ChevronRight className="h-8 w-8" />
            </button>

            {/* Play/Pause */}
            <button
              className="absolute bottom-6 left-1/2 -translate-x-1/2 p-4 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors pointer-events-auto"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </button>

            {/* Progress Indicator */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-auto">
              {strains.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-white' : 'bg-white/40'
                  }`}
                  onClick={() => onIndexChange(index)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FullscreenGallery;
