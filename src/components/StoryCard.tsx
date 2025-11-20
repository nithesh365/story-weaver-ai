import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Story } from '@/types';
import { BookOpen, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StoryCardProps {
  story: Story;
  onSelect: () => void;
}

export const StoryCard = ({ story, onSelect }: StoryCardProps) => {
  return (
    <Card 
      className={cn(
        "group relative overflow-hidden border border-border/50",
        "bg-card hover:bg-card/95",
        "transition-all duration-300 cursor-pointer",
        "hover:shadow-xl hover:shadow-primary/5",
        "hover:-translate-y-1 hover:border-primary/30"
      )}
      onClick={onSelect}
    >
      {/* Emoji Header */}
      <div className="relative h-32 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center overflow-hidden">
        <div className="text-6xl transform group-hover:scale-110 transition-transform duration-300">
          {story.emoji || '📖'}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Header with scenes badge */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors flex-1 leading-tight">
            {story.title}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/80 px-2.5 py-1 rounded-full shrink-0">
            <BookOpen className="w-3.5 h-3.5" />
            <span className="font-medium">{story.scenes}</span>
          </div>
        </div>
        
        {/* Description */}
        {story.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {story.description}
          </p>
        )}
        
        {/* Themes */}
        {story.themes && story.themes.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {story.themes.slice(0, 3).map((theme) => (
              <span 
                key={theme}
                className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-md border border-primary/20"
              >
                {theme}
              </span>
            ))}
            {story.themes.length > 3 && (
              <span className="text-xs text-muted-foreground px-2.5 py-1">
                +{story.themes.length - 3} more
              </span>
            )}
          </div>
        )}
        
        {/* CTA Button */}
        <Button 
          variant="outline" 
          size="lg" 
          className="w-full group/btn border-border hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all"
        >
          <span>Select Story</span>
          <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </div>
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-secondary/5 transition-all duration-300 pointer-events-none" />
    </Card>
  );
};
