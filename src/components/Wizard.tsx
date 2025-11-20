import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { StoryCard } from '@/components/StoryCard';
import { ImageUpload } from '@/components/ImageUpload';
import { ProgressTracker } from '@/components/ProgressTracker';
import { ResultScreen } from '@/components/ResultScreen';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, BookOpen, Wand2, Image as ImageIcon, Download, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        {step !== 'landing' && step !== 'progress' && (
          <div className="mb-8 animate-fade-in">
            {(step === 'select-story' || step === 'upload-image') && (
              <Button
                variant="ghost"
                onClick={handleBack}
                className="mb-4 -ml-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
          </div>
        )}

        {/* Landing Page */}
        {step === 'landing' && (
          <div className="min-h-screen flex items-center py-12 lg:py-20">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Hero Section - Split Layout */}
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                {/* Left Column - Content */}
                <div className="space-y-8 lg:space-y-10 animate-fade-in">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                    <Sparkles className="w-4 h-4" />
                    <span>AI-Powered Story Creation</span>
                  </div>

                  {/* Main Heading */}
                  <div className="space-y-6">
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground tracking-tight leading-[1.1]">
                      Become the Hero of Your Own
                      <span className="block text-primary mt-2">Storybook</span>
                    </h1>
                    <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed max-w-xl">
                      Transform yourself into classic fairy tale characters with AI-generated personalized storybooks. Upload your photo and watch the magic happen.
                    </p>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button
                      variant="default"
                      size="xl"
                      onClick={() => setStep('select-story')}
                      className="group px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      Create Your Story
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    {/* <Button
                      variant="outline"
                      size="xl"
                      className="px-8 py-6 text-lg font-semibold"
                    >
                      See Examples
                    </Button> */}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-8 pt-4">
                    <div>
                      <div className="text-3xl font-bold text-foreground">15+</div>
                      <div className="text-sm text-muted-foreground">Unique Scenes</div>
                    </div>
                    <div className="h-12 w-px bg-border" />
                    <div>
                      <div className="text-3xl font-bold text-foreground">100%</div>
                      <div className="text-sm text-muted-foreground">AI Generated</div>
                    </div>
                    <div className="h-12 w-px bg-border" />
                    <div>
                      <div className="text-3xl font-bold text-foreground">5min</div>
                      <div className="text-sm text-muted-foreground">Average Time</div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Visual */}
                <div className="relative lg:block hidden animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <div className="relative">
                    {/* Main Visual Card */}
                    <div className="relative bg-gradient-to-br from-card to-muted/50 rounded-2xl border border-border p-8 shadow-2xl">
                      {/* Book Preview */}
                      <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-xl flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_70%)]" />
                          <img src="/hero.jpeg" alt="Book Preview" className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-card/95 to-transparent">
                          <div className="text-lg font-bold text-foreground">Your Story</div>
                          <div className="text-sm text-muted-foreground">15 pages of magic</div>
                        </div>
                      </div>
                    </div>

                    {/* Floating Elements */}
                    <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/20 rounded-2xl border border-primary/30 backdrop-blur-sm flex items-center justify-center animate-float">
                      <Wand2 className="w-10 h-10 text-primary" />
                    </div>
                    <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-secondary/20 rounded-xl border border-secondary/30 backdrop-blur-sm flex items-center justify-center animate-float" style={{ animationDelay: '0.5s' }}>
                      <ImageIcon className="w-8 h-8 text-secondary" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Features Section */}
              <div className="mt-20 lg:mt-32 pt-16 border-t border-border">
                <div className="grid sm:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
                  <div className="space-y-4 text-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Upload Photo</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Simply upload a clear portrait. Our AI handles the rest.
                    </p>
                  </div>
                  <div className="space-y-4 text-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/10 text-secondary mb-4">
                      <Wand2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">AI Magic</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      15 unique illustrations featuring you as the main character.
                    </p>
                  </div>
                  <div className="space-y-4 text-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 text-accent mb-4">
                      <Download className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Download PDF</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Get your personalized storybook as a beautiful, high-quality PDF.
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-16 lg:mt-20 flex flex-wrap items-center justify-center gap-6 lg:gap-12 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-success" />
                  <span className="font-medium">Privacy First</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-success" />
                  <span className="font-medium">No Watermarks</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-success" />
                  <span className="font-medium">High Quality</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-success" />
                  <span className="font-medium">Instant Download</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Story Selection */}
        {step === 'select-story' && (
          <div className="space-y-12 animate-fade-in">
            {/* Header */}
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
                Choose Your Adventure
              </h2>
              <p className="text-lg text-muted-foreground">
                Pick a timeless tale and become the star of your own story
              </p>
            </div>

            {/* Stories Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
              {Object.values(stories).map((story, index) => (
                <div
                  key={story.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <StoryCard
                    story={story}
                    onSelect={() => handleStorySelect(story)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Upload */}
        {step === 'upload-image' && selectedStory && (
          <div className="max-w-3xl mx-auto space-y-10 animate-fade-in">
            <div className="text-center space-y-3">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
                Upload Your Photo
              </h2>
              <p className="text-lg text-muted-foreground">
                You'll be the star of <span className="text-primary font-semibold">{selectedStory.title}</span>
              </p>
            </div>

            <ImageUpload
              selectedImage={selectedImage}
              onImageSelect={setSelectedImage}
            />

            <Button
              variant="default"
              size="xl"
              onClick={handleGenerate}
              disabled={!selectedImage || isLoading}
              className="w-full group shadow-lg hover:shadow-xl transition-all"
            >
              {isLoading ? (
                <>
                  <span className="animate-pulse">Generating your storybook...</span>
                </>
              ) : (
                <>
                  Generate My Storybook
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* Progress Tracking */}
        {step === 'progress' && progress && (
          <div className="animate-fade-in py-12">
            <div className="text-center mb-12 space-y-3 max-w-2xl mx-auto">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
                Creating Your Storybook
              </h2>
              <p className="text-lg text-muted-foreground">
                Sit back and relax while we bring your story to life
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
