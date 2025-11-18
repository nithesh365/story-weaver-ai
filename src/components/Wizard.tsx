import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { StoryCard } from '@/components/StoryCard';
import { ImageUpload } from '@/components/ImageUpload';
import { ProgressTracker } from '@/components/ProgressTracker';
import { ResultScreen } from '@/components/ResultScreen';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Sparkles } from 'lucide-react';
import type { Story, ProgressUpdate } from '@/types';
import { cn } from '@/lib/utils';

type WizardStep = 'landing' | 'select-story' | 'upload-image' | 'progress' | 'result';

export const Wizard = () => {
  const [step, setStep] = useState<WizardStep>('landing');
  const [stories, setStories] = useState<Record<string, Story>>({});
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [progress, setProgress] = useState<ProgressUpdate | null>(null);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (step === 'select-story') {
      loadStories();
    }
  }, [step]);

  const loadStories = async () => {
    try {
      const data = await api.fetchStories();
      setStories(data.stories);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load stories. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleStorySelect = (story: Story) => {
    setSelectedStory(story);
    setStep('upload-image');
  };

  const handleGenerate = async () => {
    if (!selectedImage || !selectedStory) return;

    setIsLoading(true);
    try {
      const response = await api.generateStorybook(selectedImage, selectedStory.id);
      
      setProgress({
        job_id: response.job_id,
        status: 'processing',
        progress: 0,
        message: 'Starting generation...',
      });
      
      setStep('progress');

      // Connect to SSE stream
      const eventSource = api.createProgressStream(
        response.job_id,
        (update) => {
          setProgress(update);
          
          if (update.status === 'completed' && update.result_url) {
            setResultUrl(update.result_url);
            setTimeout(() => setStep('result'), 500);
          } else if (update.status === 'failed') {
            toast({
              title: 'Generation Failed',
              description: update.error || 'An error occurred during generation',
              variant: 'destructive',
            });
          }
        },
        (error) => {
          toast({
            title: 'Connection Error',
            description: error.message,
            variant: 'destructive',
          });
          // Fallback to polling could be implemented here
        },
        () => {
          setIsLoading(false);
        }
      );

      return () => {
        eventSource.close();
      };
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to start generation',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'upload-image') {
      setStep('select-story');
      setSelectedImage(null);
    } else if (step === 'select-story') {
      setStep('landing');
      setSelectedStory(null);
    }
  };

  const handleCreateAnother = () => {
    setStep('select-story');
    setSelectedStory(null);
    setSelectedImage(null);
    setProgress(null);
    setResultUrl('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        {step !== 'landing' && step !== 'progress' && (
          <div className="mb-8 animate-fade-in">
            {(step === 'select-story' || step === 'upload-image') && (
              <Button
                variant="ghost"
                onClick={handleBack}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
          </div>
        )}

        {/* Landing Page */}
        {step === 'landing' && (
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8 animate-fade-in">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Sparkles className="w-12 h-12 text-primary animate-float" />
                <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  AI Storybook Generator
                </h1>
                <Sparkles className="w-12 h-12 text-secondary animate-float" style={{ animationDelay: '0.5s' }} />
              </div>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                Create Your Personalized AI-Powered Storybook
              </p>
              
              <p className="text-base text-muted-foreground max-w-xl mx-auto">
                Upload your photo and become the main character in classic fairy tales brought to life by AI
              </p>
            </div>

            <Button
              variant="hero"
              size="xl"
              onClick={() => setStep('select-story')}
              className="animate-bounce-in"
            >
              Get Started
              <Sparkles className="w-5 h-5 ml-2" />
            </Button>

            <div className="grid grid-cols-3 gap-6 max-w-2xl mt-12 text-sm">
              <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="text-3xl">📸</div>
                <p className="font-semibold">Upload Photo</p>
                <p className="text-muted-foreground text-xs">Choose your best portrait</p>
              </div>
              <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="text-3xl">✨</div>
                <p className="font-semibold">AI Magic</p>
                <p className="text-muted-foreground text-xs">15 custom illustrations</p>
              </div>
              <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <div className="text-3xl">📚</div>
                <p className="font-semibold">Get PDF</p>
                <p className="text-muted-foreground text-xs">Download your storybook</p>
              </div>
            </div>
          </div>
        )}

        {/* Story Selection */}
        {step === 'select-story' && (
          <div className="space-y-8 animate-slide-in-right">
            <div className="text-center space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Choose Your Story
              </h2>
              <p className="text-muted-foreground">
                Select a classic tale to star in
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {Object.values(stories).map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  onSelect={() => handleStorySelect(story)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Image Upload */}
        {step === 'upload-image' && selectedStory && (
          <div className="max-w-2xl mx-auto space-y-8 animate-slide-in-right">
            <div className="text-center space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Upload Your Photo
              </h2>
              <p className="text-muted-foreground">
                You'll star in <span className="text-primary font-semibold">{selectedStory.title}</span>
              </p>
            </div>

            <ImageUpload
              selectedImage={selectedImage}
              onImageSelect={setSelectedImage}
            />

            <Button
              variant="hero"
              size="xl"
              onClick={handleGenerate}
              disabled={!selectedImage || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <span className="animate-pulse">Generating...</span>
                </>
              ) : (
                <>
                  Generate My Storybook
                  <Sparkles className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* Progress Tracking */}
        {step === 'progress' && progress && (
          <div className="animate-fade-in py-12">
            <div className="text-center mb-12 space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Creating Your Storybook
              </h2>
              <p className="text-muted-foreground">
                Sit back and relax while AI works its magic ✨
              </p>
            </div>

            <ProgressTracker progress={progress} />
          </div>
        )}

        {/* Result Screen */}
        {step === 'result' && resultUrl && selectedStory && (
          <ResultScreen
            resultUrl={resultUrl}
            storyTitle={selectedStory.title}
            onCreateAnother={handleCreateAnother}
          />
        )}
      </div>
    </div>
  );
};
