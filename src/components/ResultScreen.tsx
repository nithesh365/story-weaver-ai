import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { Download, Share2, RefreshCw, BookOpen, Gift, Lock, Star } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/use-window-size';

interface ResultScreenProps {
  resultUrl: string;
  storyTitle: string;
  onCreateAnother: () => void;
}

export const ResultScreen = ({ resultUrl, storyTitle, onCreateAnother }: ResultScreenProps) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [rating, setRating] = useState<number>(0);
  const { width, height } = useWindowSize();

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleDownload = () => {
    api.downloadPDF(resultUrl);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My ${storyTitle} Storybook`,
          text: 'Check out my personalized AI-generated storybook!',
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: Copy link
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto text-center space-y-12 py-12 animate-fade-in">
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}
      
      {/* Success Animation */}
      <div className="space-y-6">
        <div className="text-6xl animate-bounce-in">🎉</div>
        
        <div className="space-y-3">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-success via-primary to-secondary bg-clip-text text-transparent">
            Your Storybook is Ready!
          </h2>
          <p className="text-xl text-muted-foreground">
            {storyTitle} has been personalized just for you
          </p>
        </div>
      </div>

      {/* 3D Book Preview Mockup */}
      <div className="relative w-full max-w-md mx-auto group">
        <div className="relative bg-gradient-to-br from-card to-muted border-2 border-border rounded-xl p-8 shadow-2xl transform perspective-1000 hover:scale-105 transition-transform duration-300">
          <div className="aspect-[3/4] bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center relative overflow-hidden">
            <BookOpen className="w-24 h-24 text-primary animate-float" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-xl font-bold text-foreground">{storyTitle}</h3>
              <p className="text-sm text-muted-foreground">Your Personalized Story</p>
            </div>
          </div>
        </div>
        
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-4/5 h-8 bg-black/10 rounded-full blur-xl" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-card to-muted border border-border rounded-xl p-4 space-y-1">
          <BookOpen className="w-6 h-6 text-primary mx-auto" />
          <p className="text-2xl font-bold text-foreground">15</p>
          <p className="text-xs text-muted-foreground">Pages</p>
        </div>
        <div className="bg-gradient-to-br from-card to-muted border border-border rounded-xl p-4 space-y-1">
          <Star className="w-6 h-6 text-accent mx-auto" />
          <p className="text-2xl font-bold text-foreground">AI</p>
          <p className="text-xs text-muted-foreground">Generated</p>
        </div>
        <div className="bg-gradient-to-br from-card to-muted border border-border rounded-xl p-4 space-y-1">
          <Gift className="w-6 h-6 text-secondary mx-auto" />
          <p className="text-2xl font-bold text-foreground">Unique</p>
          <p className="text-xs text-muted-foreground">One of a kind</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-xl mx-auto">
        <Button
          variant="hero"
          size="xl"
          onClick={handleDownload}
          className="flex-1"
        >
          <Download className="w-5 h-5 mr-2" />
          Download PDF
        </Button>
        <Button
          variant="outline"
          size="xl"
          onClick={handleShare}
          className="flex-1"
        >
          <Share2 className="w-5 h-5 mr-2" />
          Share
        </Button>
        <Button
          variant="magic"
          size="xl"
          onClick={onCreateAnother}
          className="flex-1"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Create Another
        </Button>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto text-sm">
        <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-2">
          <div className="text-2xl">📱</div>
          <p className="font-semibold text-foreground">Perfect for Tablets</p>
          <p className="text-xs text-muted-foreground">Optimized for digital reading</p>
        </div>
        <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-2">
          <div className="text-2xl">🎁</div>
          <p className="font-semibold text-foreground">Great Gift Idea</p>
          <p className="text-xs text-muted-foreground">Unique and personalized</p>
        </div>
        <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-2">
          <Lock className="w-6 h-6 text-primary mx-auto" />
          <p className="font-semibold text-foreground">Privacy First</p>
          <p className="text-xs text-muted-foreground">Auto-deleted in 24 hours</p>
        </div>
      </div>

      {/* Rating Section */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-6 max-w-xl mx-auto space-y-4">
        <p className="font-semibold text-foreground">How was your experience?</p>
        <div className="flex gap-2 justify-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="text-4xl transition-transform hover:scale-125"
            >
              {star <= rating ? '😍' : '😊'}
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-sm text-success animate-fade-in">
            Thank you for your feedback! ✨
          </p>
        )}
      </div>
    </div>
  );
};
