import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Upload, Scan, Sparkles, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProgressUpdate } from '@/types';

interface ProgressTrackerProps {
  progress: ProgressUpdate;
}

interface ProgressStage {
  name: string;
  icon: React.ReactNode;
  range: [number, number];
}

const stages: ProgressStage[] = [
  {
    name: 'Upload',
    icon: <Upload className="w-5 h-5" />,
    range: [0, 15],
  },
  {
    name: 'Process',
    icon: <Scan className="w-5 h-5" />,
    range: [15, 20],
  },
  {
    name: 'Generate',
    icon: <Sparkles className="w-5 h-5" />,
    range: [20, 90],
  },
  {
    name: 'Finalize',
    icon: <FileText className="w-5 h-5" />,
    range: [90, 100],
  },
];

export const ProgressTracker = ({ progress }: ProgressTrackerProps) => {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    // Smooth progress animation
    const timer = setTimeout(() => {
      setDisplayProgress(progress.progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress.progress]);

  const getCurrentStage = (): number => {
    return stages.findIndex(
      stage => displayProgress >= stage.range[0] && displayProgress <= stage.range[1]
    );
  };

  const currentStageIndex = getCurrentStage();
  const isCompleted = progress.status === 'completed';
  const isFailed = progress.status === 'failed';

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Circular Progress */}
      <div className="relative w-64 h-64 mx-auto">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="128"
            cy="128"
            r="116"
            stroke="hsl(var(--muted))"
            strokeWidth="12"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="128"
            cy="128"
            r="116"
            stroke={isFailed ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 116}`}
            strokeDashoffset={`${2 * Math.PI * 116 * (1 - displayProgress / 100)}`}
            className="transition-all duration-500 ease-out"
            style={{
              filter: isCompleted ? 'drop-shadow(0 0 10px hsl(var(--success)))' : 'drop-shadow(0 0 10px hsl(var(--primary)))',
            }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isCompleted ? (
            <CheckCircle2 className="w-16 h-16 text-success animate-bounce-in" />
          ) : isFailed ? (
            <span className="text-6xl animate-bounce-in">❌</span>
          ) : (
            <>
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-2" />
              <span className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {displayProgress}%
              </span>
            </>
          )}
        </div>
      </div>

      {/* Status Message */}
      <div className="text-center space-y-2 animate-fade-in">
        <p className="text-lg font-semibold text-foreground">
          {progress.message}
        </p>
        
        {progress.current_scene && progress.total_scenes && (
          <p className="text-sm text-muted-foreground">
            Scene {progress.current_scene} of {progress.total_scenes}
          </p>
        )}
        
        {!isCompleted && !isFailed && (
          <p className="text-xs text-muted-foreground">
            Estimated time: ~{Math.max(1, Math.ceil((100 - displayProgress) / 12))} minutes
          </p>
        )}
      </div>

      {/* Stage Timeline */}
      <div className="relative">
        <div className="flex justify-between items-center relative">
          {/* Progress line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted -translate-y-1/2 rounded-full">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${(currentStageIndex + 1) * (100 / stages.length)}%`,
              }}
            />
          </div>

          {/* Stage indicators */}
          {stages.map((stage, index) => {
            const isActive = index === currentStageIndex;
            const isComplete = index < currentStageIndex || isCompleted;
            
            return (
              <div
                key={stage.name}
                className="relative flex flex-col items-center gap-2 z-10"
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                    isComplete
                      ? "bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg"
                      : isActive
                      ? "bg-primary text-primary-foreground animate-pulse-glow shadow-lg"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {isComplete ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    stage.icon
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium transition-colors absolute -bottom-6 whitespace-nowrap",
                    isActive || isComplete ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {stage.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fun fact box */}
      {!isCompleted && !isFailed && (
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-4 text-center animate-fade-in">
          <p className="text-sm font-medium text-foreground">
            ✨ <span className="font-semibold">Did you know?</span> We're using advanced AI to ensure your face looks natural in every scene!
          </p>
        </div>
      )}
    </div>
  );
};
